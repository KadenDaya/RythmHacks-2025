from fastapi import FastAPI, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import database, models, auth
import uvicorn
import os
import sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from martianAPIWrapper import MartianClient
from pdfToText import extract_pdf_text
from dataInput import transactionData, date, cardData

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_martian_client():
    api_key = os.getenv("MARTIAN_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Martian API key not configured")
    return MartianClient(api_key)

def generate_financial_insights(cleaned_data, financial_data):
    try:
        with open("ai2.prompt", "r") as f:
            insights_prompt = f.read()
        
        analysis_data = f"""
CLEANED FINANCIAL DATA:
Card Limit: {cleaned_data.get("card_limit", "")}
Card Age: {cleaned_data.get("card_age", "")} months
Purchases: {cleaned_data.get("purchases", [])}
Debt History: {cleaned_data.get("debt_history", [])}

RAW FINANCIAL DATA:
Credit Card Limit: {financial_data.credit_card_limit}
Card Age: {financial_data.card_age}
Credit Forms: {financial_data.credit_forms}
Current Debt: {financial_data.current_debt}
Debt Amount: {financial_data.debt_amount}
Debt End Date: {financial_data.debt_end_date}
Debt Duration: {financial_data.debt_duration}
"""
        
        martian_client = get_martian_client()
        
        messages = [
            {"role": "system", "content": insights_prompt},
            {"role": "user", "content": f"Analyze this financial data: {analysis_data}"}
        ]
        
        response = martian_client.chat_completions(
            model="openai/gpt-4.1-nano:cheap",
            messages=messages,
            temperature=0.1
        )
        
        insights_analysis = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        import json
        insights_json = json.loads(insights_analysis)
        
        return {
            "financial_metrics": json.dumps(insights_json.get("financial_metrics", {})),
            "insights": json.dumps(insights_json.get("insights", [])),
            "recommendations": json.dumps(insights_json.get("recommendations", [])),
            "risk_assessment": json.dumps(insights_json.get("risk_assessment", {})),
            "trends": json.dumps(insights_json.get("trends", {})),
            "ai_insights_text": insights_json.get("ai_insights_text", ""),
            "full_analysis": insights_analysis
        }
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        return {
            "financial_metrics": "{}",
            "insights": "[]",
            "recommendations": "[]",
            "risk_assessment": "{}",
            "trends": "{}",
            "ai_insights_text": f"Error generating insights: {str(e)}",
            "full_analysis": f"Error: {str(e)}"
        }

@app.get("/")
def root():
    return {"message": "Welcome to RythmHacks API"}

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    hashed_pw = auth.hash_password(form.password)
    new_user = models.User(username=form.username, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User registered successfully"}

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form.username).first()
    if not user or not auth.verify_password(form.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/submit-financial-info")
def submit_financial_info(
    token: str = Depends(oauth2_scheme),
    creditCardLimit: str = Form(...),
    cardAge: str = Form(...),
    creditCardStatement: UploadFile = File(None),
    creditForms: str = Form(...),
    currentDebt: str = Form(...),
    debtAmount: str = Form(...),
    debtEndDate: str = Form(...),
    debtDuration: str = Form(...),
    db: Session = Depends(get_db)
):
    username = auth.decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    pdf_data = None
    pdf_text = ""
    if creditCardStatement and creditCardStatement.filename:
        pdf_data = creditCardStatement.file.read()
        pdf_text = extract_pdf_text(pdf_data)
    
    existing_data = db.query(models.FinancialData).filter(models.FinancialData.user_id == user.id).first()
    
    if existing_data:
        existing_data.credit_card_limit = creditCardLimit
        existing_data.card_age = cardAge
        if pdf_data:
            existing_data.credit_card_statement = pdf_data
        existing_data.credit_forms = creditForms
        existing_data.current_debt = currentDebt
        existing_data.debt_amount = debtAmount
        existing_data.debt_end_date = debtEndDate
        existing_data.debt_duration = debtDuration
        db.commit()
        db.refresh(existing_data)
        financial_data = existing_data
    else:
        financial_data = models.FinancialData(
            user_id=user.id,
            credit_card_limit=creditCardLimit,
            card_age=cardAge,
            credit_card_statement=pdf_data,
            credit_forms=creditForms,
            current_debt=currentDebt,
            debt_amount=debtAmount,
            debt_end_date=debtEndDate,
            debt_duration=debtDuration
        )
        db.add(financial_data)
        db.commit()
        db.refresh(financial_data)
    
    try:
        with open("ai.prompt", "r") as f:
            prompt = f.read()
        
        user_data = f"""
Credit Card Limit: {creditCardLimit}
Card Age: {cardAge}
Credit Forms: {creditForms}
Current Debt: {currentDebt}
Debt Amount: {debtAmount}
Debt End Date: {debtEndDate}
Debt Duration: {debtDuration}
PDF Statement Text: {pdf_text}
"""
        
        martian_client = get_martian_client()
        
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"text: {user_data}"}
        ]
        
        response = martian_client.chat_completions(
            model="openai/gpt-4.1-nano:cheap",
            messages=messages,
            temperature=0.1
        )
        
        ai_analysis = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        cleaned_card_limit = ""
        cleaned_card_age = ""
        cleaned_transaction_list = ""
        cleaned_debt_history = ""
        
        try:
            import json
            cleaned_data = json.loads(ai_analysis)
            cleaned_card_limit = cleaned_data.get("card_limit", "")
            cleaned_card_age = cleaned_data.get("card_age", "")
            cleaned_transaction_list = json.dumps(cleaned_data.get("purchases", []))
            cleaned_debt_history = json.dumps(cleaned_data.get("debt_history", []))
            
            transaction_objects = []
            for purchase in cleaned_data.get("purchases", []):
                transaction_obj = transactionData(
                    purchaseYear=purchase.get("purchase_year", 0),
                    purchaseMonth=purchase.get("purchase_month", 0),
                    purchaseDay=purchase.get("purchase_day", 0),
                    paymentYear=purchase.get("payment_year", -1),
                    paymentMonth=purchase.get("payment_month", -1),
                    paymentDay=purchase.get("payment_day", -1),
                    cost=float(purchase.get("cost", "0.00"))
                )
                transaction_objects.append(transaction_obj)
            
            card_limit_float = float(cleaned_card_limit) if cleaned_card_limit else 0.0
            card_age_int = int(cleaned_card_age) if cleaned_card_age else 0
            
            user_card_data = cardData(
                count=len(transaction_objects),
                cardLimit=card_limit_float,
                transactionList=transaction_objects,
                ageOfCard=card_age_int
            )
            
            user_card_data.organizeDataSet(user_card_data.transactionList)
            user_card_data.percentageOfCardUsedAVG(user_card_data.transactionList, user_card_data.cardLimit)
        except:
            pass
        
        if existing_data:
            existing_data.cleaned_card_limit = cleaned_card_limit
            existing_data.cleaned_card_age = cleaned_card_age
            existing_data.cleaned_transaction_list = cleaned_transaction_list
            existing_data.cleaned_debt_history = cleaned_debt_history
            existing_data.ai_analysis_result = ai_analysis
            existing_data.is_data_cleaned = True
            db.commit()
            db.refresh(existing_data)
            financial_data = existing_data
        else:
            financial_data.cleaned_card_limit = cleaned_card_limit
            financial_data.cleaned_card_age = cleaned_card_age
            financial_data.cleaned_transaction_list = cleaned_transaction_list
            financial_data.cleaned_debt_history = cleaned_debt_history
            financial_data.ai_analysis_result = ai_analysis
            financial_data.is_data_cleaned = True
            db.commit()
            db.refresh(financial_data)
        
<<<<<<< Updated upstream
        return {
            "msg": "✓ Financial information saved and analyzed successfully!"
        }
        
    except Exception as e:
        return {
            "msg": "✓ Financial information saved successfully! (AI analysis failed)"
        }
=======
        # Generate AI Insights
        try:
            insights_data = generate_financial_insights(cleaned_data, financial_data)
            
            if existing_data:
                existing_data.financial_metrics = insights_data.get("financial_metrics", "")
                existing_data.insights = insights_data.get("insights", "")
                existing_data.recommendations = insights_data.get("recommendations", "")
                existing_data.risk_assessment = insights_data.get("risk_assessment", "")
                existing_data.trends = insights_data.get("trends", "")
                existing_data.ai_insights_text = insights_data.get("ai_insights_text", "")
                existing_data.ai_insights_result = insights_data.get("full_analysis", "")
                existing_data.is_insights_generated = True
                db.commit()
                db.refresh(existing_data)
            else:
                financial_data.financial_metrics = insights_data.get("financial_metrics", "")
                financial_data.insights = insights_data.get("insights", "")
                financial_data.recommendations = insights_data.get("recommendations", "")
                financial_data.risk_assessment = insights_data.get("risk_assessment", "")
                financial_data.trends = insights_data.get("trends", "")
                financial_data.ai_insights_text = insights_data.get("ai_insights_text", "")
                financial_data.ai_insights_result = insights_data.get("full_analysis", "")
                financial_data.is_insights_generated = True
                db.commit()
                db.refresh(financial_data)
        except Exception as insights_error:
            print(f"Insights generation failed: {insights_error}")
        
            return {
                "msg": "Financial information saved and analyzed successfully", 
                "data_id": financial_data.id,
                "ai_analysis": ai_analysis,
                "cleaned_data": {
                    "card_limit": cleaned_card_limit,
                    "card_age": cleaned_card_age,
                    "transaction_list": cleaned_transaction_list,
                    "debt_history": cleaned_debt_history
                }
            }
        
    except Exception as e:
            return {
                "msg": "Financial information saved successfully (AI analysis failed)", 
                "data_id": financial_data.id,
                "error": str(e)
            }
>>>>>>> Stashed changes

@app.get("/get-financial-data")
def get_financial_data(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = auth.decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    financial_data = db.query(models.FinancialData).filter(models.FinancialData.user_id == user.id).first()
    if not financial_data:
        raise HTTPException(status_code=404, detail="No financial data found")
    
    return {
        "raw_data": {
            "credit_card_limit": financial_data.credit_card_limit,
            "card_age": financial_data.card_age,
            "credit_forms": financial_data.credit_forms,
            "current_debt": financial_data.current_debt,
            "debt_amount": financial_data.debt_amount,
            "debt_end_date": financial_data.debt_end_date,
            "debt_duration": financial_data.debt_duration,
            "has_pdf": financial_data.credit_card_statement is not None
        },
        "cleaned_data": {
            "cleaned_card_limit": financial_data.cleaned_card_limit,
            "cleaned_card_age": financial_data.cleaned_card_age,
            "cleaned_transaction_list": financial_data.cleaned_transaction_list,
            "cleaned_debt_history": financial_data.cleaned_debt_history,
            "ai_analysis_result": financial_data.ai_analysis_result,
            "is_data_cleaned": financial_data.is_data_cleaned
        },
        "insights": {
            "financial_metrics": financial_data.financial_metrics,
            "insights": financial_data.insights,
            "recommendations": financial_data.recommendations,
            "risk_assessment": financial_data.risk_assessment,
            "trends": financial_data.trends,
            "ai_insights_text": financial_data.ai_insights_text,
            "ai_insights_result": financial_data.ai_insights_result,
            "is_insights_generated": financial_data.is_insights_generated
        }
    }

@app.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    username = auth.decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"msg": f"Hello, {username}! You accessed a protected route."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)