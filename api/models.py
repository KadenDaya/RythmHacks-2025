from sqlalchemy import Column, Integer, String, Text, ForeignKey, LargeBinary, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    financial_data = relationship("FinancialData", back_populates="user")

class FinancialData(Base):
    __tablename__ = "financial_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    credit_card_limit = Column(String)
    card_age = Column(String)
    credit_card_statement = Column(LargeBinary)
    credit_forms = Column(Text)
    current_debt = Column(String)
    debt_amount = Column(String)
    debt_end_date = Column(String)
    debt_duration = Column(String)
    
    cleaned_card_limit = Column(String)
    cleaned_card_age = Column(String)
    cleaned_transaction_list = Column(Text)
    cleaned_debt_history = Column(Text)
    ai_analysis_result = Column(Text)
    is_data_cleaned = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="financial_data")