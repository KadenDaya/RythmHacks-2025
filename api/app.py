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
from criteria import critera
from datetime import datetime

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

def detect_anomalies(transactions):
    if len(transactions) < 3:
        return []
    
    costs = [t.cost for t in transactions]
    mean_cost = sum(costs) / len(costs)
    variance = sum((x - mean_cost) ** 2 for x in costs) / len(costs)
    std_dev = variance ** 0.5
    
    anomalies = []
    for i, transaction in enumerate(transactions):
        z_score = abs(transaction.cost - mean_cost) / std_dev if std_dev > 0 else 0
        if z_score > 2.5:
            anomalies.append({
                "transaction_index": i,
                "amount": transaction.cost,
                "z_score": z_score,
                "date": f"{transaction.purchaseDate.year}-{transaction.purchaseDate.month}-{transaction.purchaseDate.day}"
            })
    
    return anomalies

def generate_credit_improvement_plan(financial_metrics, insights, recommendations, risk_assessment, trends, custom_credit_score):
    try:
        with open("credit_plan_prompt.txt", "r") as f:
            plan_prompt = f.read()
        
        # Parse all the JSON data
        import json
        metrics_data = json.loads(financial_metrics) if financial_metrics else {}
        insights_data = json.loads(insights) if insights else []
        recommendations_data = json.loads(recommendations) if recommendations else []
        risk_data = json.loads(risk_assessment) if risk_assessment else {}
        trends_data = json.loads(trends) if trends else {}
        credit_score_data = json.loads(custom_credit_score) if custom_credit_score else {}
        
        # Extract algorithm results
        algorithm_results = credit_score_data.get("algorithm_results", {})
        
        comprehensive_data = f"""
COMPREHENSIVE FINANCIAL ANALYSIS FOR CREDIT IMPROVEMENT PLAN:

FINANCIAL METRICS:
{json.dumps(metrics_data, indent=2)}

AI INSIGHTS:
{json.dumps(insights_data, indent=2)}

RECOMMENDATIONS:
{json.dumps(recommendations_data, indent=2)}

RISK ASSESSMENT:
{json.dumps(risk_data, indent=2)}

TRENDS ANALYSIS:
{json.dumps(trends_data, indent=2)}

CUSTOM CREDIT SCORE:
{json.dumps(credit_score_data, indent=2)}

ALGORITHM ANALYSIS RESULTS:
Anomaly Detection: {json.dumps(algorithm_results.get("anomalies", []), indent=2)}
Sorting Analysis: {json.dumps(algorithm_results.get("sorting_stats", {}), indent=2)}
Search Results: {json.dumps(algorithm_results.get("search_results", {}), indent=2)}
Greedy Debt Plan: {json.dumps(algorithm_results.get("greedy_debt_plan", []), indent=2)}
Recursive Trend: {json.dumps(algorithm_results.get("recursive_trend", {}), indent=2)}
Dynamic Programming: {json.dumps(algorithm_results.get("dynamic_programming", {}), indent=2)}
Graph Analysis: {json.dumps(algorithm_results.get("graph_analysis", {}), indent=2)}
Hash Table Analysis: {json.dumps(algorithm_results.get("hash_table", {}), indent=2)}
Sliding Window: {json.dumps(algorithm_results.get("sliding_window", {}), indent=2)}
Heap Priority: {json.dumps(algorithm_results.get("heap_priority", {}), indent=2)}
Backtracking: {json.dumps(algorithm_results.get("backtracking", {}), indent=2)}
Divide & Conquer: {json.dumps(algorithm_results.get("divide_conquer", {}), indent=2)}
Two Pointers: {json.dumps(algorithm_results.get("two_pointers", {}), indent=2)}

CREDIT SCORE DETAILS:
Current Score Code: {credit_score_data.get("score_code", 0)}
Utilization Ratio: {credit_score_data.get("utilization_ratio", 0)}
Credit Health Status: {credit_score_data.get("credit_health_status", "Unknown")}
Card Age: {credit_score_data.get("card_age_months", 0)} months
Total Transactions: {credit_score_data.get("total_transactions", 0)}
"""
        
        martian_client = get_martian_client()
        
        messages = [
            {"role": "system", "content": plan_prompt},
            {"role": "user", "content": f"Create a comprehensive credit improvement plan based on this complete financial analysis: {comprehensive_data}"}
        ]
        
        response = martian_client.chat_completions(
            model="openai/gpt-4.1-nano:cheap",
            messages=messages,
            temperature=0.1
        )
        
        plan_analysis = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Parse the plan JSON
        plan_json = json.loads(plan_analysis)
        
        return {
            "credit_improvement_plan": json.dumps(plan_json.get("credit_improvement_plan", {})),
            "plan_generated": True,
            "plan_timestamp": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        print(f"Error generating credit improvement plan: {e}")
        return {
            "credit_improvement_plan": "{}",
            "plan_generated": False,
            "error": str(e)
        }

def generate_financial_insights(cleaned_data, financial_data):
    try:
        # Create transaction objects using dataInput classes
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
        
        # Detect anomalies in spending patterns
        anomalies = detect_anomalies(transaction_objects)
        
        # Advanced sorting algorithms for transaction analysis
        def quicksort_transactions(arr, key_func):
            if len(arr) <= 1:
                return arr
            pivot = arr[len(arr) // 2]
            left = [x for x in arr if key_func(x) < key_func(pivot)]
            middle = [x for x in arr if key_func(x) == key_func(pivot)]
            right = [x for x in arr if key_func(x) > key_func(pivot)]
            return quicksort_transactions(left, key_func) + middle + quicksort_transactions(right, key_func)
        
        def mergesort_transactions(arr, key_func):
            if len(arr) <= 1:
                return arr
            mid = len(arr) // 2
            left = mergesort_transactions(arr[:mid], key_func)
            right = mergesort_transactions(arr[mid:], key_func)
            return merge(left, right, key_func)
        
        def merge(left, right, key_func):
            result = []
            i = j = 0
            while i < len(left) and j < len(right):
                if key_func(left[i]) <= key_func(right[j]):
                    result.append(left[i])
                    i += 1
                else:
                    result.append(right[j])
                    j += 1
            result.extend(left[i:])
            result.extend(right[j:])
            return result
        
        # Sort transactions by amount using quicksort
        sorted_by_amount = quicksort_transactions(transaction_objects.copy(), lambda t: t.cost)
        # Sort transactions by date using mergesort
        sorted_by_date = mergesort_transactions(transaction_objects.copy(), 
            lambda t: (t.purchaseDate.year, t.purchaseDate.month, t.purchaseDate.day))
        
        # Create cardData object
        card_limit_float = float(cleaned_data.get("card_limit", "0")) if cleaned_data.get("card_limit") else 0.0
        card_age_int = int(cleaned_data.get("card_age", "0")) if cleaned_data.get("card_age") else 0
        
        user_card_data = cardData(
            cardLimit=card_limit_float,
            transactionList=transaction_objects,
            ageOfCard=card_age_int
        )
        
        # Organize transactions and calculate utilization
        user_card_data.organizeDataSet(user_card_data.transactionList)
        user_card_data.percentageOfCardUsed(user_card_data.transactionList, user_card_data.cardLimit)
        
        # Search algorithms for financial analysis
        def binary_search_transactions(sorted_transactions, target_amount):
            left, right = 0, len(sorted_transactions) - 1
            while left <= right:
                mid = (left + right) // 2
                if sorted_transactions[mid].cost == target_amount:
                    return mid
                elif sorted_transactions[mid].cost < target_amount:
                    left = mid + 1
                else:
                    right = mid - 1
            return -1
        
        def linear_search_unpaid(transactions):
            unpaid_indices = []
            for i, transaction in enumerate(transactions):
                if transaction.paymentDate.year < 0:
                    unpaid_indices.append(i)
            return unpaid_indices
        
        # Greedy algorithm for debt optimization
        def greedy_debt_payoff(unpaid_transactions, available_funds):
            sorted_debts = sorted(unpaid_transactions, key=lambda t: t.cost, reverse=True)
            payoff_plan = []
            remaining_funds = available_funds
            
            for debt in sorted_debts:
                if remaining_funds >= debt.cost:
                    payoff_plan.append({
                        "amount": debt.cost,
                        "date": f"{debt.purchaseDate.year}-{debt.purchaseDate.month}-{debt.purchaseDate.day}",
                        "action": "pay_full"
                    })
                    remaining_funds -= debt.cost
                elif remaining_funds > 0:
                    payoff_plan.append({
                        "amount": remaining_funds,
                        "date": f"{debt.purchaseDate.year}-{debt.purchaseDate.month}-{debt.purchaseDate.day}",
                        "action": "pay_partial",
                        "remaining": debt.cost - remaining_funds
                    })
                    remaining_funds = 0
                else:
                    break
            
            return payoff_plan
        
        # Apply search algorithms
        unpaid_transactions = [t for t in transaction_objects if t.paymentDate.year < 0]
        unpaid_indices = linear_search_unpaid(transaction_objects)
        median_amount = sorted_by_amount[len(sorted_by_amount)//2].cost if sorted_by_amount else 0
        median_index = binary_search_transactions(sorted_by_amount, median_amount)
        
        # Apply greedy debt optimization
        total_unpaid = sum(t.cost for t in unpaid_transactions)
        debt_payoff_plan = greedy_debt_payoff(unpaid_transactions, total_unpaid * 0.5)
        
        # Recursive trend analysis algorithm
        def recursive_trend_analysis(transactions, depth=0, max_depth=3):
            if depth >= max_depth or len(transactions) < 2:
                return {"trend": "insufficient_data", "depth": depth}
            
            if len(transactions) == 2:
                diff = transactions[1].cost - transactions[0].cost
                return {"trend": "increasing" if diff > 0 else "decreasing" if diff < 0 else "stable", "depth": depth}
            
            mid = len(transactions) // 2
            left_trend = recursive_trend_analysis(transactions[:mid], depth + 1, max_depth)
            right_trend = recursive_trend_analysis(transactions[mid:], depth + 1, max_depth)
            
            if left_trend["trend"] == right_trend["trend"]:
                return {"trend": left_trend["trend"], "depth": depth, "consistency": "high"}
            else:
                return {"trend": "mixed", "depth": depth, "left": left_trend["trend"], "right": right_trend["trend"]}
        
        # Apply recursive trend analysis
        trend_analysis = recursive_trend_analysis(sorted_by_date)
        
        # Dynamic programming for optimal payment scheduling
        def optimal_payment_schedule(debts, monthly_budget):
            n = len(debts)
            dp = [[0 for _ in range(monthly_budget + 1)] for _ in range(n + 1)]
            
            for i in range(1, n + 1):
                debt_amount = int(debts[i-1].cost)
                for budget in range(monthly_budget + 1):
                    if debt_amount <= budget:
                        dp[i][budget] = max(dp[i-1][budget], 
                                          dp[i-1][budget - debt_amount] + debt_amount)
                    else:
                        dp[i][budget] = dp[i-1][budget]
            
            # Reconstruct optimal schedule
            schedule = []
            budget = monthly_budget
            for i in range(n, 0, -1):
                if dp[i][budget] != dp[i-1][budget]:
                    debt_amount = int(debts[i-1].cost)
                    schedule.append({
                        "debt_index": i-1,
                        "amount": debt_amount,
                        "month": len(schedule) + 1
                    })
                    budget -= debt_amount
            
            return schedule
        
        # Graph algorithms for spending pattern analysis
        def build_spending_graph(transactions):
            graph = {}
            for i, t1 in enumerate(transactions):
                graph[i] = []
                for j, t2 in enumerate(transactions):
                    if i != j:
                        time_diff = abs((t1.purchaseDate.year - t2.purchaseDate.year) * 365 + 
                                      (t1.purchaseDate.month - t2.purchaseDate.month) * 30 + 
                                      (t1.purchaseDate.day - t2.purchaseDate.day))
                        if time_diff <= 7 and abs(t1.cost - t2.cost) <= 50:
                            graph[i].append(j)
            return graph
        
        def dfs_spending_clusters(graph, visited, node, cluster):
            visited[node] = True
            cluster.append(node)
            for neighbor in graph[node]:
                if not visited[neighbor]:
                    dfs_spending_clusters(graph, visited, neighbor, cluster)
        
        def find_spending_clusters(graph):
            visited = [False] * len(graph)
            clusters = []
            for node in range(len(graph)):
                if not visited[node]:
                    cluster = []
                    dfs_spending_clusters(graph, visited, node, cluster)
                    if len(cluster) > 1:
                        clusters.append(cluster)
            return clusters
        
        # Hash table for transaction lookup optimization
        def build_transaction_hash_table(transactions):
            hash_table = {}
            for i, transaction in enumerate(transactions):
                key = f"{transaction.purchaseDate.year}-{transaction.purchaseDate.month}-{transaction.purchaseDate.day}"
                if key not in hash_table:
                    hash_table[key] = []
                hash_table[key].append(i)
            return hash_table
        
        # Sliding window for trend detection
        def sliding_window_trend(transactions, window_size=5):
            if len(transactions) < window_size:
                return {"trend": "insufficient_data", "avg_slope": 0, "window_size": window_size}
            
            trends = []
            for i in range(len(transactions) - window_size + 1):
                window = transactions[i:i + window_size]
                costs = [t.cost for t in window]
                slope = (costs[-1] - costs[0]) / window_size
                trends.append(slope)
            
            avg_slope = sum(trends) / len(trends)
            return {
                "trend": "increasing" if avg_slope > 0.1 else "decreasing" if avg_slope < -0.1 else "stable",
                "avg_slope": avg_slope,
                "window_size": window_size
            }
        
        # Apply advanced algorithms
        monthly_budget = card_limit_float * 0.3
        optimal_schedule = optimal_payment_schedule(unpaid_transactions, int(monthly_budget)) if unpaid_transactions else []
        
        spending_graph = build_spending_graph(transaction_objects)
        spending_clusters = find_spending_clusters(spending_graph)
        
        transaction_hash = build_transaction_hash_table(transaction_objects)
        
        try:
            sliding_trend = sliding_window_trend(sorted_by_date)
        except Exception as e:
            print(f"Error in sliding_window_trend: {e}")
            sliding_trend = {"trend": "error", "avg_slope": 0, "window_size": 5}
        
        # Heap algorithms for priority-based debt management
        import heapq
        
        def priority_debt_queue(debts):
            heap = []
            for i, debt in enumerate(debts):
                priority = debt.cost * 0.8 + (30 - abs(debt.purchaseDate.day - 15)) * 0.2
                heapq.heappush(heap, (-priority, i, debt))
            return heap
        
        def extract_top_priorities(heap, count=3):
            priorities = []
            temp_heap = heap.copy()
            for _ in range(min(count, len(temp_heap))):
                if temp_heap:
                    priority, index, debt = heapq.heappop(temp_heap)
                    priorities.append({
                        "index": index,
                        "debt": debt,
                        "priority": -priority
                    })
            return priorities
        
        # Backtracking for budget optimization
        def backtrack_budget_allocation(categories, budget, current_allocation=[], best_allocation=None, best_score=0):
            if len(current_allocation) == len(categories):
                total_score = sum(cat["score"] for cat in current_allocation)
                if total_score > best_score:
                    return current_allocation.copy(), total_score
                return best_allocation, best_score
            
            category = categories[len(current_allocation)]
            for amount in range(0, min(category["max"], budget) + 1, 50):
                if amount <= budget:
                    current_allocation.append({
                        "name": category["name"],
                        "amount": amount,
                        "score": category["score"] * (amount / category["max"])
                    })
                    best_allocation, best_score = backtrack_budget_allocation(
                        categories, budget - amount, current_allocation, best_allocation, best_score)
                    current_allocation.pop()
            
            return best_allocation, best_score
        
        # Divide and conquer for large dataset processing
        def divide_conquer_analysis(transactions, threshold=10):
            if len(transactions) <= threshold:
                return {
                    "total_amount": sum(t.cost for t in transactions),
                    "avg_amount": sum(t.cost for t in transactions) / len(transactions) if transactions else 0,
                    "count": len(transactions)
                }
            
            mid = len(transactions) // 2
            left_result = divide_conquer_analysis(transactions[:mid], threshold)
            right_result = divide_conquer_analysis(transactions[mid:], threshold)
            
            return {
                "total_amount": left_result["total_amount"] + right_result["total_amount"],
                "avg_amount": (left_result["avg_amount"] + right_result["avg_amount"]) / 2,
                "count": left_result["count"] + right_result["count"],
                "left": left_result,
                "right": right_result
            }
        
        # Two pointers technique for transaction matching
        def two_pointers_matching(sorted_transactions, target_sum):
            left, right = 0, len(sorted_transactions) - 1
            matches = []
            
            while left < right:
                current_sum = sorted_transactions[left].cost + sorted_transactions[right].cost
                if current_sum == target_sum:
                    matches.append({
                        "left_index": left,
                        "right_index": right,
                        "left_amount": sorted_transactions[left].cost,
                        "right_amount": sorted_transactions[right].cost,
                        "sum": current_sum
                    })
                    left += 1
                    right -= 1
                elif current_sum < target_sum:
                    left += 1
                else:
                    right -= 1
            
            return matches
        
        # Apply advanced algorithms
        debt_heap = priority_debt_queue(unpaid_transactions)
        top_priorities = extract_top_priorities(debt_heap)
        
        budget_categories = [
            {"name": "essential", "max": int(monthly_budget * 0.6), "score": 10},
            {"name": "debt_payment", "max": int(monthly_budget * 0.3), "score": 8},
            {"name": "savings", "max": int(monthly_budget * 0.1), "score": 6}
        ]
        optimal_budget, budget_score = backtrack_budget_allocation(budget_categories, int(monthly_budget))
        
        dataset_analysis = divide_conquer_analysis(transaction_objects)
        
        target_sum = card_limit_float * 0.1
        transaction_matches = two_pointers_matching(sorted_by_amount, target_sum)
        
        # Use criteria.py for credit scoring
        credit_criteria = critera(user_card_data)
        credit_score_code = credit_criteria.messageReturnCodedName()
        utilization_ratio = user_card_data.getPercentageUsed()
        
        # Map credit score codes to descriptions
        credit_score_descriptions = {
            1: "Critical: High utilization + New card - Immediate action needed",
            2: "Poor: High utilization + Established card - Reduce spending",
            3: "Fair: Moderate utilization + New card - Build history",
            4: "Fair: Moderate utilization + Established card - Maintain payments",
            5: "Good: Low utilization + New card - Keep building history",
            6: "Excellent: Low utilization + Established card - Perfect credit health"
        }
        
        # Calculate comprehensive financial metrics
        total_spending = sum(t.cost for t in transaction_objects)
        avg_transaction_size = total_spending / len(transaction_objects) if transaction_objects else 0
        paid_transactions = len([t for t in transaction_objects if t.paymentDate.year != -1])
        unpaid_transactions = len(transaction_objects) - paid_transactions
        payment_completion_rate = (paid_transactions / len(transaction_objects)) * 100 if transaction_objects else 0
        
        # Calculate spending patterns
        transaction_amounts = [t.cost for t in transaction_objects]
        if transaction_amounts:
            spending_volatility = (max(transaction_amounts) - min(transaction_amounts)) / avg_transaction_size if avg_transaction_size > 0 else 0
            largest_transaction = max(transaction_amounts)
            smallest_transaction = min(transaction_amounts)
        else:
            spending_volatility = 0
            largest_transaction = 0
            smallest_transaction = 0
        
        # Calculate payment patterns
        payment_delays = []
        for t in transaction_objects:
            if t.paymentDate.year != -1:
                purchase_date = datetime(t.purchaseDate.year, t.purchaseDate.month, t.purchaseDate.day)
                payment_date = datetime(t.paymentDate.year, t.paymentDate.month, t.paymentDate.day)
                delay = (payment_date - purchase_date).days
                payment_delays.append(delay)
        
        avg_days_to_pay = sum(payment_delays) / len(payment_delays) if payment_delays else 0
        
        # Calculate financial health indicators
        financial_health_score = min(100, max(0, 
            (payment_completion_rate * 0.4) + 
            ((100 - utilization_ratio * 100) * 0.3) + 
            (min(100, card_age_int * 2) * 0.2) + 
            (min(100, 100 - spending_volatility) * 0.1)
        ))
        
        payment_behavior_score = min(100, max(0, 
            (payment_completion_rate * 0.6) + 
            (max(0, 100 - avg_days_to_pay) * 0.4)
        ))
        
        spending_consistency_score = min(100, max(0, 100 - spending_volatility))
        credit_velocity = total_spending / card_age_int if card_age_int > 0 else 0
        payment_reliability_index = payment_completion_rate / 100
        financial_stability_marker = (financial_health_score + payment_behavior_score + spending_consistency_score) / 3
        credit_building_potential = min(100, max(0, 
            (card_age_int * 3) + 
            (payment_completion_rate * 0.5) + 
            ((100 - utilization_ratio * 100) * 0.3)
        ))
        
        # Determine patterns
        monthly_spending_pattern = "consistent" if spending_volatility < 50 else "volatile" if spending_volatility > 100 else "moderate"
        transaction_frequency = "high" if len(transaction_objects) > card_age_int else "moderate" if len(transaction_objects) > card_age_int * 0.5 else "low"
        seasonal_spending_trend = "stable" if spending_volatility < 30 else "seasonal" if spending_volatility < 80 else "irregular"
        
        with open("ai2.prompt", "r") as f:
            insights_prompt = f.read()
        
        analysis_data = f"""
COMPREHENSIVE FINANCIAL ANALYSIS DATA:

BASIC METRICS:
Card Limit: ${card_limit_float:,.2f}
Card Age: {card_age_int} months
Total Transactions: {len(transaction_objects)}
Total Spending: ${total_spending:,.2f}
Average Transaction Size: ${avg_transaction_size:,.2f}
Largest Transaction: ${largest_transaction:,.2f}
Smallest Transaction: ${smallest_transaction:,.2f}
Transaction Range: ${largest_transaction - smallest_transaction:,.2f}

PAYMENT ANALYSIS:
Paid Transactions: {paid_transactions}
Unpaid Transactions: {unpaid_transactions}
Payment Completion Rate: {payment_completion_rate:.1f}%
Average Days to Pay: {avg_days_to_pay:.1f} days
Payment Behavior Score: {payment_behavior_score:.1f}/100
Payment Reliability Index: {payment_reliability_index:.3f}

CREDIT ANALYSIS:
Credit Utilization: {utilization_ratio:.2%}
Credit Score Code: {credit_score_code}
Credit Health Status: {credit_score_descriptions.get(credit_score_code, "Unknown")}
Credit Velocity: ${credit_velocity:.2f}/month
Credit Building Potential: {credit_building_potential:.1f}/100

SPENDING PATTERNS:
Spending Volatility: {spending_volatility:.1f}%
Monthly Spending Pattern: {monthly_spending_pattern}
Transaction Frequency: {transaction_frequency}
Seasonal Spending Trend: {seasonal_spending_trend}
Spending Consistency Score: {spending_consistency_score:.1f}/100

FINANCIAL HEALTH:
Financial Health Score: {financial_health_score:.1f}/100
Financial Stability Marker: {financial_stability_marker:.1f}/100
Debt to Credit Ratio: {utilization_ratio:.2%}

ALGORITHM ANALYSIS RESULTS:
Anomaly Detection: {len(anomalies)} anomalies found
- Anomaly Details: {[{'amount': a['amount'], 'z_score': a['z_score'], 'date': a['date']} for a in anomalies[:3]]}

Sorting Analysis: {len(sorted_by_amount)} transactions sorted by amount, {len(sorted_by_date)} by date
- Amount Range: ${f"{smallest_transaction:.2f} to {largest_transaction:.2f}" if transaction_amounts else "No transactions"}

Search Results: {len(unpaid_indices)} unpaid transactions, median amount: ${median_amount:.2f}
- Binary Search Performance: Median found at index {median_index}

Greedy Debt Plan: {len(debt_payoff_plan)} optimized payments
- Plan Details: {debt_payoff_plan[:3] if debt_payoff_plan else 'No debt to optimize'}

Recursive Trend Analysis: {trend_analysis['trend']} pattern at depth {trend_analysis['depth']}
- Consistency Level: {trend_analysis.get('consistency', 'unknown')}

Dynamic Programming: {len(optimal_schedule)} optimal payment schedule items
- Monthly Budget: ${monthly_budget:.2f}
- Schedule Details: {optimal_schedule[:3] if optimal_schedule else 'No schedule needed'}

Graph Analysis: {len(spending_clusters)} spending clusters found
- Cluster Sizes: {[len(cluster) for cluster in spending_clusters[:3]]}
- Largest Cluster: {max([len(cluster) for cluster in spending_clusters], default=0)} transactions

Hash Table Analysis: {len(transaction_hash)} date-based groups
- Total Entries: {sum(len(v) for v in transaction_hash.values())}
- Most Active Days: {sorted(transaction_hash.items(), key=lambda x: len(x[1]), reverse=True)[:3]}

Sliding Window Trend: {sliding_trend.get('trend', 'unknown')} trend
- Average Slope: {sliding_trend.get('avg_slope', 0):.4f}
- Window Size: {sliding_trend.get('window_size', 5)}

Heap Priority Analysis: {len(top_priorities)} top priority debts
- Priority Details: {[{'priority': p['priority'], 'amount': p['debt'].cost} for p in top_priorities[:3]]}

Backtracking Budget: {len(optimal_budget)} optimal allocations
- Budget Score: {budget_score:.2f}
- Allocation Details: {optimal_budget}

Divide & Conquer Analysis: {dataset_analysis['count']} transactions processed
- Total Amount: ${dataset_analysis['total_amount']:.2f}
- Average Amount: ${dataset_analysis['avg_amount']:.2f}
- Left Subset: {dataset_analysis.get('left', {}).get('count', 0)} transactions
- Right Subset: {dataset_analysis.get('right', {}).get('count', 0)} transactions

Two Pointers Matching: {len(transaction_matches)} transaction pairs found
- Target Sum: ${target_sum:.2f}
- Match Details: {transaction_matches[:3] if transaction_matches else 'No matches found'}

RAW FINANCIAL DATA:
Credit Card Limit: ${financial_data.credit_card_limit}
Card Age: {financial_data.card_age} months
Credit Forms: {financial_data.credit_forms}
Current Debt: {financial_data.current_debt}
Debt Amount: ${financial_data.debt_amount}
Debt End Date: {financial_data.debt_end_date}
Debt Duration: {financial_data.debt_duration} months

TRANSACTION DETAILS:
Transaction List: {[{'date': f"{t.purchaseDate.year}-{t.purchaseDate.month}-{t.purchaseDate.day}", 'amount': t.cost, 'paid': t.paymentDate.year != -1} for t in transaction_objects[:10]]}
"""
        
        martian_client = get_martian_client()
        
        messages = [
            {"role": "system", "content": insights_prompt},
            {"role": "user", "content": f"Analyze this financial data with custom credit scoring: {analysis_data}"}
        ]
        
        response = martian_client.chat_completions(
            model="openai/gpt-4.1-nano:cheap",
            messages=messages,
            temperature=0.1
        )
        
        insights_analysis = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # Debug: Log the response for troubleshooting
        print(f"AI Response length: {len(insights_analysis)}")
        print(f"AI Response preview: {insights_analysis[:200]}...")
        
        import json
        try:
            insights_json = json.loads(insights_analysis)
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Error position: {e.pos}")
            print(f"Content around error: {insights_analysis[max(0, e.pos-100):e.pos+100]}")
            # Return a fallback response
            insights_json = {
                "financial_metrics": {},
                "insights": [],
                "recommendations": [],
                "risk_assessment": {},
                "trends": {},
                "ai_insights_text": "Error generating insights: Invalid JSON response from AI"
            }
        
        # Add custom credit scoring data to the response
        insights_json["custom_credit_score"] = {
            "score_code": credit_score_code,
            "utilization_ratio": utilization_ratio,
            "credit_health_status": credit_score_descriptions.get(credit_score_code, "Unknown"),
            "card_age_months": card_age_int,
            "total_transactions": len(transaction_objects),
            "algorithm_results": {
                "anomalies": anomalies,
                "sorting_stats": {
                    "quicksort_by_amount": len(sorted_by_amount),
                    "mergesort_by_date": len(sorted_by_date)
                },
                "search_results": {
                    "unpaid_count": len(unpaid_indices),
                    "median_amount": median_amount,
                    "median_found": median_index != -1
                },
                "greedy_debt_plan": debt_payoff_plan,
                "recursive_trend": trend_analysis,
                "dynamic_programming": {
                    "optimal_schedule": optimal_schedule,
                    "monthly_budget": monthly_budget
                },
                "graph_analysis": {
                    "spending_clusters": spending_clusters,
                    "cluster_count": len(spending_clusters)
                },
                "hash_table": {
                    "date_groups": len(transaction_hash),
                    "total_entries": sum(len(v) for v in transaction_hash.values())
                },
                "sliding_window": sliding_trend,
                "heap_priority": {
                    "top_priorities": [{"index": p["index"], "priority": p["priority"], "amount": p["debt"].cost} for p in top_priorities],
                    "priority_count": len(top_priorities)
                },
                "backtracking": {
                    "optimal_budget": optimal_budget,
                    "budget_score": budget_score
                },
                "divide_conquer": dataset_analysis,
                "two_pointers": {
                    "matches": transaction_matches,
                    "match_count": len(transaction_matches)
                }
            }
        }
        
        # Generate comprehensive credit improvement plan
        plan_data = generate_credit_improvement_plan(
            json.dumps(insights_json.get("financial_metrics", {})),
            json.dumps(insights_json.get("insights", [])),
            json.dumps(insights_json.get("recommendations", [])),
            json.dumps(insights_json.get("risk_assessment", {})),
            json.dumps(insights_json.get("trends", {})),
            json.dumps(insights_json.get("custom_credit_score", {}))
        )
        
        return {
            "financial_metrics": json.dumps(insights_json.get("financial_metrics", {})),
            "insights": json.dumps(insights_json.get("insights", [])),
            "recommendations": json.dumps(insights_json.get("recommendations", [])),
            "risk_assessment": json.dumps(insights_json.get("risk_assessment", {})),
            "trends": json.dumps(insights_json.get("trends", {})),
            "custom_credit_score": json.dumps(insights_json.get("custom_credit_score", {})),
            "credit_improvement_plan": plan_data.get("credit_improvement_plan", "{}"),
            "ai_insights_text": insights_json.get("ai_insights_text", ""),
            "full_analysis": insights_analysis
        }
        
    except Exception as e:
        import traceback
        print(f"Error generating insights: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "financial_metrics": "{}",
            "insights": "[]",
            "recommendations": "[]",
            "risk_assessment": "{}",
            "trends": "{}",
            "custom_credit_score": "{}",
            "credit_improvement_plan": "{}",
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
        
        # Generate AI Insights
        try:
            insights_data = generate_financial_insights(cleaned_data, financial_data)
            
            if existing_data:
                existing_data.financial_metrics = insights_data.get("financial_metrics", "")
                existing_data.insights = insights_data.get("insights", "")
                existing_data.recommendations = insights_data.get("recommendations", "")
                existing_data.risk_assessment = insights_data.get("risk_assessment", "")
                existing_data.trends = insights_data.get("trends", "")
                existing_data.custom_credit_score = insights_data.get("custom_credit_score", "")
                existing_data.credit_improvement_plan = insights_data.get("credit_improvement_plan", "")
                existing_data.ai_insights_text = insights_data.get("ai_insights_text", "")
                existing_data.ai_insights_result = insights_data.get("full_analysis", "")
                existing_data.is_insights_generated = True
                existing_data.is_plan_generated = True
                db.commit()
                db.refresh(existing_data)
            else:
                financial_data.financial_metrics = insights_data.get("financial_metrics", "")
                financial_data.insights = insights_data.get("insights", "")
                financial_data.recommendations = insights_data.get("recommendations", "")
                financial_data.risk_assessment = insights_data.get("risk_assessment", "")
                financial_data.trends = insights_data.get("trends", "")
                financial_data.custom_credit_score = insights_data.get("custom_credit_score", "")
                financial_data.credit_improvement_plan = insights_data.get("credit_improvement_plan", "")
                financial_data.ai_insights_text = insights_data.get("ai_insights_text", "")
                financial_data.ai_insights_result = insights_data.get("full_analysis", "")
                financial_data.is_insights_generated = True
                financial_data.is_plan_generated = True
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
            },
            "financial_metrics": insights_data.get("financial_metrics", "{}"),
            "insights": insights_data.get("insights", "[]"),
            "recommendations": insights_data.get("recommendations", "[]"),
            "risk_assessment": insights_data.get("risk_assessment", "{}"),
            "trends": insights_data.get("trends", "{}"),
            "custom_credit_score": insights_data.get("custom_credit_score", "{}"),
            "credit_improvement_plan": insights_data.get("credit_improvement_plan", "{}"),
            "ai_insights_text": insights_data.get("ai_insights_text", ""),
            "is_insights_generated": True,
            "is_plan_generated": True
        }
        
    except Exception as e:
        return {
            "msg": "Financial information saved successfully (AI analysis failed)", 
            "data_id": financial_data.id,
            "error": str(e)
        }

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
            "custom_credit_score": financial_data.custom_credit_score,
            "credit_improvement_plan": financial_data.credit_improvement_plan,
            "ai_insights_text": financial_data.ai_insights_text,
            "ai_insights_result": financial_data.ai_insights_result,
            "is_insights_generated": financial_data.is_insights_generated,
            "is_plan_generated": financial_data.is_plan_generated
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