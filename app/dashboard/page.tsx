'use client'

import { useState, useEffect } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts'

interface FinancialData {
  raw_data: {
    credit_card_limit: string
    card_age: string
    credit_forms: string
    current_debt: string
    debt_amount: string
    debt_end_date: string
    debt_duration: string
    has_pdf: boolean
  }
  cleaned_data: {
    cleaned_card_limit: string
    cleaned_card_age: string
    cleaned_transaction_list: string
    cleaned_debt_history: string
    ai_analysis_result: string
    is_data_cleaned: boolean
  }
  insights: {
    financial_metrics: string
    insights: string
    recommendations: string
    risk_assessment: string
    trends: string
    custom_credit_score: string
    credit_improvement_plan: string
    ai_insights_text: string
    ai_insights_result: string
    is_insights_generated: boolean
    is_plan_generated: boolean
  }
}

export default function Dashboard() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'plan'>('analytics')

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('http://localhost:8000/get-financial-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }

      const data = await response.json()
      
      // Console log everything for debugging
      console.log('=== API RESPONSE DEBUG ===')
      console.log('Full API Response:', data)
      console.log('Raw Data:', data.raw_data)
      console.log('Cleaned Data:', data.cleaned_data)
      console.log('Insights:', data.insights)
      console.log('Financial Metrics:', data.insights?.financial_metrics)
      console.log('Custom Credit Score:', data.insights?.custom_credit_score)
      console.log('Credit Improvement Plan:', data.insights?.credit_improvement_plan)
      console.log('========================')
      console.log('CREDIT PLAN DEBUG:', data.insights?.credit_improvement_plan)
      
      setFinancialData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const parseJsonSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      case 'critical': return 'text-red-600'
      default: return 'text-orange-300'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend?.toLowerCase()) {
      case 'increasing': return '↑'
      case 'decreasing': return '↓'
      case 'stable': return '→'
      case 'improving': return '+'
      case 'declining': return '-'
      default: return '='
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
            ))}
          </div>
        </div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 relative z-10"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-orange-500/20 relative z-10">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-orange-200">{error}</p>
        </div>
      </div>
    )
  }

  const metrics = parseJsonSafely(financialData?.insights?.financial_metrics || '{}')
  const insights = parseJsonSafely(financialData?.insights?.insights || '[]')
  const recommendations = parseJsonSafely(financialData?.insights?.recommendations || '[]')
  const riskAssessment = parseJsonSafely(financialData?.insights?.risk_assessment || '{}')
  const trends = parseJsonSafely(financialData?.insights?.trends || '{}')
  const customCreditScore = parseJsonSafely(financialData?.insights?.custom_credit_score || '{}')
  const creditPlan = typeof financialData?.insights?.credit_improvement_plan === 'string' 
    ? parseJsonSafely(financialData.insights.credit_improvement_plan) 
    : financialData?.insights?.credit_improvement_plan

  // Debug logging for credit plan
  console.log('=== CREDIT PLAN DEBUG ===')
  console.log('credit_improvement_plan type:', typeof financialData?.insights?.credit_improvement_plan)
  console.log('credit_improvement_plan value:', financialData?.insights?.credit_improvement_plan?.substring(0, 200))
  console.log('creditPlan parsed:', creditPlan)
  console.log('creditPlan keys:', creditPlan ? Object.keys(creditPlan) : 'null')
  console.log('========================')

  // Chart data preparation
  const chartColors = ['#f97316', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
  
  // Comprehensive data structures for all metrics
  const utilizationData = [
    { 
      name: 'Used', 
      value: (customCreditScore.utilization_ratio || 0) * 100, 
      color: '#ef4444',
      explanation: `Credit utilization is the percentage of your available credit that you're currently using. ${(customCreditScore.utilization_ratio || 0) * 100}% utilization means you're using ${(customCreditScore.utilization_ratio || 0) * 100}% of your available credit. Lower utilization (under 30%) is better for your credit score as it shows you're not overextending yourself financially.`
    },
    { 
      name: 'Available', 
      value: 100 - ((customCreditScore.utilization_ratio || 0) * 100), 
      color: '#10b981',
      explanation: `Available credit represents the unused portion of your credit limit. Having ${100 - ((customCreditScore.utilization_ratio || 0) * 100)}% available credit shows lenders you have room for unexpected expenses and aren't maxing out your cards, which is a positive sign for creditworthiness.`
    }
  ]

  const comprehensiveMetricsData = [
    { 
      name: 'Credit Utilization', 
      value: (customCreditScore.utilization_ratio || 0) * 100,
      explanation: `Credit utilization measures how much of your available credit you're using. ${(customCreditScore.utilization_ratio || 0) * 100}% is ${(customCreditScore.utilization_ratio || 0) * 100 < 30 ? 'excellent' : (customCreditScore.utilization_ratio || 0) * 100 < 50 ? 'good' : 'concerning'}. Keeping this under 30% will significantly improve your credit score.`
    },
    { 
      name: 'Financial Health', 
      value: metrics.financial_health_score || 0,
      explanation: `Your financial health score of ${metrics.financial_health_score || 0}/100 reflects your overall financial stability. This considers factors like payment history, debt levels, and spending patterns. A score above 70 indicates strong financial health, while below 50 suggests areas for improvement.`
    },
    { 
      name: 'Payment Behavior', 
      value: metrics.payment_behavior_score || 0,
      explanation: `Payment behavior score of ${metrics.payment_behavior_score || 0}/100 measures how consistently you pay bills on time. This is the most important factor in your credit score. Scores above 80 indicate excellent payment habits, while below 60 suggest missed or late payments that hurt your credit.`
    },
    { 
      name: 'Spending Consistency', 
      value: metrics.spending_consistency_score || 0,
      explanation: `Spending consistency of ${metrics.spending_consistency_score || 0}/100 shows how stable your spending patterns are. Consistent spending indicates good budgeting skills and financial discipline, which lenders view positively when evaluating credit applications.`
    },
    { 
      name: 'Credit Building Potential', 
      value: metrics.credit_building_potential || 0,
      explanation: `Credit building potential of ${metrics.credit_building_potential || 0}/100 indicates how quickly you can improve your credit score. Higher scores mean you have good fundamentals and can see rapid improvement with the right actions, while lower scores suggest more foundational work is needed.`
    },
    { 
      name: 'Risk Score', 
      value: riskAssessment.risk_score || 0,
      explanation: `Risk score of ${riskAssessment.risk_score || 0}/100 represents your overall financial risk level. Lower scores indicate lower risk to lenders, making you more likely to get approved for loans and credit cards with better terms. Scores below 30 are considered low risk.`
    }
  ]

  const transactionAnalysisData = [
    { 
      name: 'Paid', 
      value: metrics.paid_transactions || 0, 
      color: '#10b981',
      explanation: `${metrics.paid_transactions || 0} paid transactions show your track record of completing payments. This demonstrates reliability and financial responsibility to lenders. Higher numbers of paid transactions build positive payment history, which is crucial for credit score improvement.`
    },
    { 
      name: 'Unpaid', 
      value: metrics.unpaid_transactions || 0, 
      color: '#ef4444',
      explanation: `${metrics.unpaid_transactions || 0} unpaid transactions represent missed or incomplete payments. These negatively impact your credit score and payment history. Reducing unpaid transactions to zero should be a top priority for credit improvement.`
    },
    { 
      name: 'Total', 
      value: metrics.total_transactions || 0, 
      color: '#3b82f6',
      explanation: `${metrics.total_transactions || 0} total transactions show your overall credit activity. Regular, responsible credit usage demonstrates to lenders that you can handle credit effectively. However, too many transactions might indicate overspending, so balance is key.`
    }
  ]

  const algorithmInsightsData = customCreditScore.algorithm_results ? [
    { 
      name: 'Anomalies Detected', 
      value: customCreditScore.algorithm_results.anomalies?.length || 0,
      explanation: `${customCreditScore.algorithm_results.anomalies?.length || 0} anomalies detected in your spending patterns. Anomalies are unusual transactions that stand out from your normal spending behavior. While some anomalies are normal (like large purchases), frequent anomalies might indicate inconsistent financial habits that could concern lenders.`
    },
    { 
      name: 'Transactions Analyzed', 
      value: customCreditScore.algorithm_results.sorting_stats?.quicksort_by_amount || 0,
      explanation: `${customCreditScore.algorithm_results.sorting_stats?.quicksort_by_amount || 0} transactions were analyzed using advanced sorting algorithms. This analysis helps identify spending patterns, transaction frequency, and financial behavior trends that inform your credit assessment and improvement recommendations.`
    },
    { 
      name: 'Unpaid Found', 
      value: customCreditScore.algorithm_results.search_results?.unpaid_count || 0,
      explanation: `${customCreditScore.algorithm_results.search_results?.unpaid_count || 0} unpaid transactions were identified through algorithmic search. These represent missed payments that negatively impact your credit score. Addressing these unpaid transactions is crucial for credit improvement.`
    },
    { 
      name: 'Spending Clusters', 
      value: customCreditScore.algorithm_results.graph_analysis?.cluster_count || 0,
      explanation: `${customCreditScore.algorithm_results.graph_analysis?.cluster_count || 0} spending clusters identified through graph analysis. Clusters represent groups of related transactions or spending patterns. Understanding these patterns helps optimize your spending habits and identify areas for improvement.`
    },
    { 
      name: 'Debt Optimization', 
      value: customCreditScore.algorithm_results.greedy_debt_plan?.length || 0,
      explanation: `${customCreditScore.algorithm_results.greedy_debt_plan?.length || 0} debt optimization strategies identified. These algorithms find the most efficient ways to pay down debt, prioritizing high-interest debts and creating optimal payment schedules to minimize interest costs and improve your credit score faster.`
    },
    { 
      name: 'Budget Allocations', 
      value: customCreditScore.algorithm_results.backtracking?.optimal_budget?.length || 0,
      explanation: `${customCreditScore.algorithm_results.backtracking?.optimal_budget?.length || 0} optimal budget allocations calculated. These use advanced backtracking algorithms to find the best way to allocate your income across different categories (essential expenses, debt payments, savings) to maximize your financial health and credit improvement potential.`
    }
  ] : []

  const creditScoreBreakdownData = [
    { 
      name: 'Payment History', 
      value: 35,
      explanation: `Payment history accounts for 35% of your credit score - the largest factor. This measures how consistently you pay bills on time. Even one missed payment can significantly damage your score. Building a strong payment history takes time but is the most impactful way to improve your credit.`
    },
    { 
      name: 'Credit Utilization', 
      value: 30,
      explanation: `Credit utilization makes up 30% of your credit score. This measures how much of your available credit you're using. Keeping utilization below 30% (ideally under 10%) shows lenders you're not overextending yourself and can manage credit responsibly.`
    },
    { 
      name: 'Credit History Length', 
      value: 15,
      explanation: `Credit history length represents 15% of your score. Longer credit histories generally result in higher scores because they provide more data about your financial behavior. This is why it's important to keep old accounts open and maintain long-term relationships with creditors.`
    },
    { 
      name: 'Credit Mix', 
      value: 10,
      explanation: `Credit mix accounts for 10% of your score. Having different types of credit (credit cards, loans, mortgages) shows you can handle various financial products responsibly. However, don't open new accounts just for credit mix - only do so when it makes financial sense.`
    },
    { 
      name: 'New Credit', 
      value: 10,
      explanation: `New credit inquiries make up 10% of your score. Each time you apply for credit, it creates a "hard inquiry" that can slightly lower your score. Too many inquiries in a short period can signal financial distress to lenders, so apply for credit sparingly and strategically.`
    }
  ]

  // Enhanced tooltip component with detailed explanations
  const EnhancedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4 shadow-xl max-w-sm">
          <p className="text-orange-300 font-semibold text-lg mb-2">{label}</p>
          <p className="text-orange-400 font-bold text-xl mb-3">
            {payload[0].name}: {payload[0].value}{payload[0].name.includes('Score') || payload[0].name.includes('Potential') ? '/100' : payload[0].name.includes('Utilization') ? '%' : ''}
          </p>
          {data.explanation && (
            <p className="text-orange-200 text-sm leading-relaxed">
              {data.explanation}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          // Use fixed positions to avoid hydration mismatch
          const positions = [
            { left: 15, top: 20, delay: 0.5, duration: 2.5 },
            { left: 85, top: 30, delay: 1.2, duration: 3.1 },
            { left: 45, top: 60, delay: 0.8, duration: 2.8 },
            { left: 75, top: 15, delay: 1.5, duration: 3.5 },
            { left: 25, top: 80, delay: 0.3, duration: 2.2 },
            { left: 65, top: 45, delay: 1.8, duration: 3.2 },
            { left: 35, top: 70, delay: 0.7, duration: 2.9 },
            { left: 90, top: 55, delay: 1.1, duration: 3.8 },
            { left: 55, top: 25, delay: 1.4, duration: 2.6 },
            { left: 40, top: 85, delay: 0.9, duration: 3.4 },
            { left: 20, top: 40, delay: 1.6, duration: 2.7 },
            { left: 70, top: 75, delay: 0.4, duration: 3.6 },
            { left: 50, top: 10, delay: 1.3, duration: 2.4 },
            { left: 30, top: 50, delay: 0.6, duration: 3.3 },
            { left: 80, top: 90, delay: 1.7, duration: 2.1 }
          ];
          
          const pos = positions[i] || positions[0];
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-bounce"
              style={{
                left: pos.left + '%',
                top: pos.top + '%',
                animationDelay: pos.delay + 's',
                animationDuration: pos.duration + 's'
              }}
            />
          );
        })}
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Incrediscore Dashboard
          </h1>
          <p className="text-orange-200 text-lg">Your Financial Health Overview</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 border border-orange-500/20 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex-1 ${
                activeTab === 'analytics'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-orange-200 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex-1 ${
                activeTab === 'plan'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-orange-200 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Personal Plan
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && (
          <>
            {financialData?.insights?.ai_insights_text && (
              <div className="bg-gradient-to-r from-orange-800/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/30 mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <h2 className="text-2xl font-bold text-orange-300">AI Financial Insights</h2>
                </div>
                <p className="text-orange-100 leading-relaxed text-lg">
                  {financialData.insights.ai_insights_text}
                </p>
              </div>
            )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Financial Metrics
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credit Utilization Pie Chart */}
                <div className="h-64">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3 text-center">Credit Utilization</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<EnhancedTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Financial Metrics Bar Chart */}
                <div className="h-64">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3 text-center">Key Metrics</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comprehensiveMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#f97316', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#f97316', fontSize: 12 }} />
                      <Tooltip content={<EnhancedTooltip />} />
                      <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Risk Assessment
              </h3>
              {riskAssessment && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Overall Risk</span>
                    <span className={`font-bold ${getRiskColor(riskAssessment.overall_risk_level)}`}>
                      {riskAssessment.overall_risk_level || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Credit Risk</span>
                    <span className={`font-bold ${getRiskColor(riskAssessment.credit_risk)}`}>
                      {riskAssessment.credit_risk || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Payment Risk</span>
                    <span className={`font-bold ${getRiskColor(riskAssessment.payment_risk)}`}>
                      {riskAssessment.payment_risk || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Risk Score</span>
                    <span className="text-orange-400 font-bold">{riskAssessment.risk_score || 0}/100</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Transaction Analysis
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Status Pie Chart */}
                <div className="h-64">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3 text-center">Transaction Status</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionAnalysisData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {transactionAnalysisData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<EnhancedTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Algorithm Results Bar Chart */}
                <div className="h-64">
                  <h4 className="text-lg font-semibold text-orange-400 mb-3 text-center">Algorithm Analysis</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={algorithmInsightsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#f97316', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#f97316', fontSize: 12 }} />
                      <Tooltip content={<EnhancedTooltip />} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Credit Health Timeline */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Credit Health Timeline</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', score: metrics.financial_health_score || 50 },
                    { month: 'Feb', score: (metrics.financial_health_score || 50) + 5 },
                    { month: 'Mar', score: (metrics.financial_health_score || 50) + 8 },
                    { month: 'Apr', score: (metrics.financial_health_score || 50) + 12 },
                    { month: 'May', score: (metrics.financial_health_score || 50) + 15 },
                    { month: 'Jun', score: (metrics.financial_health_score || 50) + 20 }
                  ]}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: '#f97316' }} />
                    <YAxis tick={{ fill: '#f97316' }} />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#f97316" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Trends Analysis
              </h3>
              {trends && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Spending Trend</span>
                    <span className="text-orange-400 font-bold flex items-center">
                      {getTrendIcon(trends.spending_trend)} {trends.spending_trend || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Payment Trend</span>
                    <span className="text-orange-400 font-bold flex items-center">
                      {getTrendIcon(trends.payment_trend)} {trends.payment_trend || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Utilization Trend</span>
                    <span className="text-orange-400 font-bold flex items-center">
                      {getTrendIcon(trends.utilization_trend)} {trends.utilization_trend || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Debt Trend</span>
                    <span className="text-orange-400 font-bold flex items-center">
                      {getTrendIcon(trends.debt_trend)} {trends.debt_trend || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Credit Score Breakdown Chart */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Credit Score Factors Breakdown</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={creditScoreBreakdownData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#f97316', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#f97316', fontSize: 12 }} width={120} />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Comprehensive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Spending Pattern Analysis */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
                <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Spending Pattern Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-200">Average Transaction Size</span>
                      <span className="text-orange-400 font-bold">${metrics.average_transaction_size || 0}</span>
                    </div>
                    <p className="text-orange-300 text-sm">
                      Your average transaction size of ${metrics.average_transaction_size || 0} indicates {metrics.average_transaction_size > 100 ? 'larger purchases' : 'smaller, frequent purchases'}. 
                      {metrics.average_transaction_size > 100 ? ' Consider if these larger purchases align with your budget and financial goals.' : ' This pattern suggests consistent, manageable spending habits.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-200">Total Spending</span>
                      <span className="text-orange-400 font-bold">${metrics.total_spending || 0}</span>
                    </div>
                    <p className="text-orange-300 text-sm">
                      Total spending of ${metrics.total_spending || 0} shows your overall credit usage. 
                      {metrics.total_spending > 5000 ? ' This level of spending requires careful budget management to maintain healthy credit utilization.' : ' This moderate spending level helps maintain good credit utilization ratios.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-200">Payment Completion Rate</span>
                      <span className="text-orange-400 font-bold">{metrics.payment_completion_rate || 0}%</span>
                    </div>
                    <p className="text-orange-300 text-sm">
                      A {metrics.payment_completion_rate || 0}% payment completion rate {metrics.payment_completion_rate > 90 ? 'demonstrates excellent payment habits' : metrics.payment_completion_rate > 70 ? 'shows good payment behavior with room for improvement' : 'indicates significant payment issues that need immediate attention'}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Algorithm Insights Summary */}
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
                <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Advanced Algorithm Insights</h3>
                <div className="space-y-4">
                  {customCreditScore.algorithm_results && (
                    <>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-orange-200">Spending Volatility</span>
                          <span className="text-orange-400 font-bold">{metrics.spending_volatility || 0}%</span>
                        </div>
                        <p className="text-orange-300 text-sm">
                          {metrics.spending_volatility || 0}% spending volatility indicates {metrics.spending_volatility < 20 ? 'very stable spending patterns' : metrics.spending_volatility < 50 ? 'moderate spending variability' : 'high spending variability'}. 
                          Lower volatility generally indicates better financial discipline and budgeting skills.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-orange-200">Monthly Spending Pattern</span>
                          <span className="text-orange-400 font-bold capitalize">{metrics.monthly_spending_pattern || 'Unknown'}</span>
                        </div>
                        <p className="text-orange-300 text-sm">
                          Your {metrics.monthly_spending_pattern || 'spending pattern'} shows {metrics.monthly_spending_pattern === 'consistent' ? 'stable financial habits' : metrics.monthly_spending_pattern === 'variable' ? 'fluctuating spending that may need attention' : 'spending patterns that require analysis'}. 
                          Consistent patterns are generally viewed more favorably by lenders.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-orange-200">Transaction Frequency</span>
                          <span className="text-orange-400 font-bold capitalize">{metrics.transaction_frequency || 'Unknown'}</span>
                        </div>
                        <p className="text-orange-300 text-sm">
                          {metrics.transaction_frequency || 'Transaction frequency'} indicates {metrics.transaction_frequency === 'high' ? 'active credit usage that demonstrates credit management skills' : metrics.transaction_frequency === 'low' ? 'minimal credit activity that may limit credit history building' : 'moderate credit usage'}. 
                          Regular, responsible usage helps build positive credit history.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Debt Reduction Progress */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Debt Reduction Progress</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-600/20 to-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-orange-200 text-sm mb-2">Current Debt</p>
                  <p className="text-3xl font-bold text-green-400">${parseInt(financialData?.raw_data?.debt_amount || '0')}</p>
                  <p className="text-orange-300 text-xs mt-2">Being paid down over 36 months</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-600/20 to-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-orange-200 text-sm mb-2">Monthly Payment Target</p>
                  <p className="text-3xl font-bold text-orange-400">${Math.round(parseInt(financialData?.raw_data?.debt_amount || '0') / 36)}</p>
                  <p className="text-orange-300 text-xs mt-2">To complete in time</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm text-orange-200 mb-2">
                  <span>Progress to debt-free</span>
                  <span>~{100 - (parseInt(financialData?.raw_data?.debt_duration || '0') / 36 * 100)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${100 - (parseInt(financialData?.raw_data?.debt_duration || '0') / 36 * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payment Behavior Calendar */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Payment Behavior Analysis</h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const paid = i % 3 !== 0;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded flex items-center justify-center ${
                        paid ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                      }`}
                      title={`Day ${i + 1}: ${paid ? 'Paid on time' : 'Missed payment'}`}
                    >
                      <span className={`text-xs ${paid ? 'text-green-400' : 'text-red-400'}`}>
                        {paid ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded mr-2"></div>
                  <span className="text-orange-200">On Time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded mr-2"></div>
                  <span className="text-orange-200">Missed</span>
                </div>
              </div>
            </div>

            {/* Credit Score Comparison */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Your Credit Score Progress</h3>
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between mb-2 text-sm text-orange-200">
                    <span>Current Score Code</span>
                    <span>{customCreditScore.score_code || 'N/A'}/6</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-green-500 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-500"
                      style={{ width: `${((customCreditScore.score_code || 0) / 6) * 100}%` }}
                    >
                      {customCreditScore.score_code || 'N/A'}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-orange-400">
                    <span>Critical (1)</span>
                    <span>Poor (2)</span>
                    <span>Fair (3-4)</span>
                    <span>Good-Excellent (5-6)</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-orange-200 text-sm">
                    Your current score code of <span className="font-bold text-orange-400">{customCreditScore.score_code || 'N/A'}</span> indicates 
                    {customCreditScore.score_code >= 6 ? ' excellent' : customCreditScore.score_code >= 5 ? ' good' : customCreditScore.score_code >= 4 ? ' fair' : customCreditScore.score_code >= 2 ? ' poor' : ' critical'} credit health. 
                    Follow your credit improvement plan to reach your target score of {creditPlan?.overview?.target_credit_score_code ? creditPlan.overview.target_credit_score_code : '6'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width sections below the grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
            <h3 className="text-xl font-bold text-orange-300 mb-4">
              Key Insights
            </h3>
              {insights && insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-700/50 rounded-lg border-l-4 border-orange-400">
                      <h4 className="font-semibold text-orange-300 mb-2">{insight.title}</h4>
                      <p className="text-orange-200 text-sm mb-2">{insight.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-orange-400">Severity: {insight.severity}</span>
                        <span className="text-xs text-orange-400">Impact: {insight.impact_score}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-orange-200">No insights available</p>
              )}
            </div>
          
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
            <h3 className="text-xl font-bold text-orange-300 mb-4">
              Recommendations
            </h3>
          {recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec: any, index: number) => (
                <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-300">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-orange-200 text-sm mb-2">{rec.description}</p>
                  <p className="text-orange-300 text-xs">
                    <span className="font-semibold">Expected Impact:</span> {rec.expected_impact}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-orange-200">No recommendations available</p>
          )}
          </div>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
          <h3 className="text-xl font-bold text-orange-300 mb-4">Raw Financial Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-orange-200 mb-2">Credit Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-orange-300">Card Limit:</span> <span className="text-orange-200">${financialData?.raw_data?.credit_card_limit || 'N/A'}</span></p>
                <p><span className="font-medium text-orange-300">Card Age:</span> <span className="text-orange-200">{financialData?.raw_data?.card_age || 'N/A'} months</span></p>
                <p><span className="font-medium text-orange-300">Credit Forms:</span> <span className="text-orange-200">{financialData?.raw_data?.credit_forms || 'N/A'}</span></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-orange-200 mb-2">Debt Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-orange-300">Current Debt:</span> <span className="text-orange-200">{financialData?.raw_data?.current_debt || 'N/A'}</span></p>
                <p><span className="font-medium text-orange-300">Debt Amount:</span> <span className="text-orange-200">${financialData?.raw_data?.debt_amount || 'N/A'}</span></p>
                <p><span className="font-medium text-orange-300">Debt Duration:</span> <span className="text-orange-200">{financialData?.raw_data?.debt_duration || 'N/A'} months</span></p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-8">
            {/* Credit Score Overview */}
            {customCreditScore && Object.keys(customCreditScore).length > 0 && (
              <div className="bg-gradient-to-r from-orange-800/20 to-red-800/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/30">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">CS</span>
                  </div>
                  <h2 className="text-2xl font-bold text-orange-300">Credit Score Analysis</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{customCreditScore.score_code || 'N/A'}</div>
                    <div className="text-orange-200">Score Code (1-6)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{((customCreditScore.utilization_ratio || 0) * 100).toFixed(1)}%</div>
                    <div className="text-orange-200">Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{customCreditScore.card_age_months || 'N/A'}</div>
                    <div className="text-orange-200">Card Age (months)</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-orange-100">{customCreditScore.credit_health_status || 'No status available'}</p>
                </div>
              </div>
            )}

            {/* Credit Score Radial Chart */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4 text-center">Credit Health Overview</h3>
              <div className="flex justify-center">
                <div className="w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                      { name: 'Credit Score', value: (customCreditScore.score_code || 0) * 16.67, fill: '#f97316' },
                      { name: 'Utilization', value: (customCreditScore.utilization_ratio || 0) * 100, fill: '#ef4444' },
                      { name: 'Card Age', value: Math.min((customCreditScore.card_age_months || 0) * 2, 100), fill: '#10b981' }
                    ]}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#f97316" />
                      <Tooltip content={<EnhancedTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Credit Improvement Plan */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-2xl font-bold text-orange-300 mb-6">Personal Credit Improvement Plan</h3>
              {creditPlan && typeof creditPlan === 'object' && Object.keys(creditPlan).length > 0 && creditPlan.overview ? (
                <>
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                    <p className="text-green-300 text-sm">✅ Plan loaded successfully</p>
                  </div>
                
                {/* Plan Overview */}
                {creditPlan.overview && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Plan Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-orange-200 mb-2">Current Score</div>
                        <div className="text-2xl font-bold text-orange-400">{creditPlan.overview.current_credit_score_code || 'N/A'}</div>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-orange-200 mb-2">Target Score</div>
                        <div className="text-2xl font-bold text-orange-400">{creditPlan.overview.target_credit_score_code || 'N/A'}</div>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-orange-200 mb-2">Timeline</div>
                        <div className="text-lg font-bold text-orange-400">{creditPlan.overview.estimated_timeline_months || 'N/A'} months</div>
                      </div>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-orange-200 mb-2">Priority</div>
                        <div className="text-lg font-bold text-orange-400 capitalize">{creditPlan.overview.priority_level || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phase 1: Immediate Actions */}
                {creditPlan.phase_1_immediate_actions && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Phase 1: Immediate Actions (0-30 days)</h4>
                    <div className="space-y-4">
                      {creditPlan.phase_1_immediate_actions.actions && creditPlan.phase_1_immediate_actions.actions.map((action: any, index: number) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-orange-300">{action.title}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              action.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                          <p className="text-orange-200 text-sm mb-2">{action.description}</p>
                          <div className="flex justify-between text-xs text-orange-300">
                            <span>Cost: ${action.cost || 0}</span>
                            <span>Time: {action.time_required_hours || 0}h</span>
                            <span className="capitalize">{action.difficulty || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 2: Short-Term Actions */}
                {creditPlan.phase_2_short_term && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Phase 2: Short-Term Actions (1-6 months)</h4>
                    <div className="space-y-4">
                      {creditPlan.phase_2_short_term.actions && creditPlan.phase_2_short_term.actions.map((action: any, index: number) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-orange-300">{action.title}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              action.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                          <p className="text-orange-200 text-sm mb-2">{action.description}</p>
                          <div className="flex justify-between text-xs text-orange-300">
                            <span>Cost: ${action.cost || 0}</span>
                            <span>Time: {action.time_required_hours || 0}h</span>
                            <span className="capitalize">{action.difficulty || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phase 3: Long-Term Actions */}
                {creditPlan.phase_3_long_term && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Phase 3: Long-Term Actions (6-24 months)</h4>
                    <div className="space-y-4">
                      {creditPlan.phase_3_long_term.actions && creditPlan.phase_3_long_term.actions.map((action: any, index: number) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-orange-300">{action.title}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              action.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              action.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                          <p className="text-orange-200 text-sm mb-2">{action.description}</p>
                          <div className="flex justify-between text-xs text-orange-300">
                            <span>Cost: ${action.cost || 0}</span>
                            <span>Time: {action.time_required_hours || 0}h</span>
                            <span className="capitalize">{action.difficulty || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Algorithm Insights */}
                {creditPlan.algorithm_insights && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Algorithm-Based Insights</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {creditPlan.algorithm_insights.anomaly_insights && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Anomaly Detection</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.algorithm_insights.anomaly_insights}</p>
                        </div>
                      )}
                      {creditPlan.algorithm_insights.dynamic_programming_insights && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Payment Optimization</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.algorithm_insights.dynamic_programming_insights}</p>
                        </div>
                      )}
                      {creditPlan.algorithm_insights.greedy_insights && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Debt Strategy</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.algorithm_insights.greedy_insights}</p>
                        </div>
                      )}
                      {creditPlan.algorithm_insights.graph_insights && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Spending Patterns</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.algorithm_insights.graph_insights}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Mitigation */}
                {creditPlan.risk_mitigation && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Risk Mitigation Strategies</h4>
                    {creditPlan.risk_mitigation.high_risk_factors && creditPlan.risk_mitigation.high_risk_factors.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-red-400 mb-2">High Risk Factors</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {creditPlan.risk_mitigation.high_risk_factors.map((risk: string, index: number) => (
                            <li key={index} className="text-orange-200 text-sm">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {creditPlan.risk_mitigation.medium_risk_factors && creditPlan.risk_mitigation.medium_risk_factors.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-yellow-400 mb-2">Medium Risk Factors</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {creditPlan.risk_mitigation.medium_risk_factors.map((risk: string, index: number) => (
                            <li key={index} className="text-orange-200 text-sm">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {creditPlan.risk_mitigation.mitigation_strategies && creditPlan.risk_mitigation.mitigation_strategies.length > 0 && (
                      <div className="space-y-3">
                        {creditPlan.risk_mitigation.mitigation_strategies.map((strategy: any, index: number) => (
                          <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                            <h6 className="font-semibold text-orange-300 mb-1">{strategy.risk}</h6>
                            <p className="text-orange-200 text-sm mb-1">{strategy.strategy}</p>
                            <p className="text-orange-300 text-xs">Monitoring: {strategy.monitoring}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Success Metrics */}
                {creditPlan.success_metrics && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Success Metrics & Milestones</h4>
                    {creditPlan.success_metrics.key_performance_indicators && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-orange-300 mb-2">Key Performance Indicators</h5>
                        <div className="space-y-2">
                          {creditPlan.success_metrics.key_performance_indicators.map((kpi: any, index: number) => (
                            <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-orange-200 font-medium">{kpi.metric}</span>
                                <span className="text-orange-400">
                                  {kpi.current_value} → {kpi.target_value}
                                </span>
                              </div>
                              <div className="w-full bg-slate-600/50 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full"
                                  style={{ width: `${(kpi.current_value / kpi.target_value) * 100}%` }}
                                ></div>
                              </div>
                              <p className="text-orange-300 text-xs mt-1">Measure: {kpi.measurement_frequency}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {creditPlan.success_metrics.milestone_tracking && (
                      <div>
                        <h5 className="font-semibold text-orange-300 mb-2">Milestone Tracking</h5>
                        <div className="space-y-2">
                          {creditPlan.success_metrics.milestone_tracking.map((milestone: any, index: number) => (
                            <div key={index} className="p-4 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                              <div className="flex justify-between items-start mb-2">
                                <h6 className="font-semibold text-orange-300">{milestone.milestone}</h6>
                                <span className="text-orange-400 text-sm">{milestone.target_date}</span>
                              </div>
                              <div className="space-y-1">
                                {milestone.success_criteria.map((criteria: string, idx: number) => (
                                  <div key={idx} className="flex items-center text-orange-200 text-sm">
                                    <span className="mr-2">✓</span>
                                    <span>{criteria}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Personalized Recommendations */}
                {creditPlan.personalized_recommendations && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Personalized Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {creditPlan.personalized_recommendations.based_on_age && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Based on Card Age</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.personalized_recommendations.based_on_age}</p>
                        </div>
                      )}
                      {creditPlan.personalized_recommendations.based_on_utilization && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Based on Utilization</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.personalized_recommendations.based_on_utilization}</p>
                        </div>
                      )}
                      {creditPlan.personalized_recommendations.based_on_payment_history && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Based on Payment History</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.personalized_recommendations.based_on_payment_history}</p>
                        </div>
                      )}
                      {creditPlan.personalized_recommendations.based_on_debt_level && (
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h5 className="font-semibold text-orange-300 mb-2">Based on Debt Level</h5>
                          <p className="text-orange-200 text-sm">{creditPlan.personalized_recommendations.based_on_debt_level}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                {creditPlan.executive_summary && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Executive Summary</h4>
                    <p className="text-orange-100 leading-relaxed text-base whitespace-pre-wrap">{creditPlan.executive_summary}</p>
                  </div>
                )}
                </>
              ) : (
              <div className="p-8 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-lg font-semibold mb-2">⚠️ Credit Improvement Plan Not Available</p>
                  <p className="text-orange-200 text-sm">
                    {!financialData?.insights?.credit_improvement_plan 
                      ? "The credit improvement plan has not been generated yet. Please make sure your financial data has been submitted and analyzed."
                      : "The credit improvement plan was received but could not be parsed correctly. Check the browser console for details."}
                  </p>
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg text-left">
                    <p className="text-orange-200 text-xs">Debug Info:</p>
                    <p className="text-orange-300 text-xs mt-1">Plan exists: {financialData?.insights?.credit_improvement_plan ? 'Yes' : 'No'}</p>
                    <p className="text-orange-300 text-xs">Plan is empty: {!financialData?.insights?.credit_improvement_plan || financialData?.insights?.credit_improvement_plan === '{}' ? 'Yes' : 'No'}</p>
                    <p className="text-orange-300 text-xs">Plan type: {typeof financialData?.insights?.credit_improvement_plan}</p>
                    <p className="text-orange-300 text-xs">Parsed plan keys: {creditPlan ? Object.keys(creditPlan).join(', ') : 'null'}</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* Algorithm Insights */}
            {customCreditScore?.algorithm_results && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
                <h3 className="text-xl font-bold text-orange-300 mb-4">Algorithm Analysis Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Anomaly Detection</h4>
                    <p className="text-orange-200 text-sm">{customCreditScore.algorithm_results.anomalies?.length || 0} anomalies found</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Sorting Analysis</h4>
                    <p className="text-orange-200 text-sm">{customCreditScore.algorithm_results.sorting_stats?.quicksort_by_amount || 0} transactions sorted</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Search Results</h4>
                    <p className="text-orange-200 text-sm">{customCreditScore.algorithm_results.search_results?.unpaid_count || 0} unpaid transactions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}