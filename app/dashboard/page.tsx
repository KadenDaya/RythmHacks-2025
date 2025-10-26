'use client'

import { useState, useEffect } from 'react'

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
  const creditPlan = parseJsonSafely(financialData?.insights?.credit_improvement_plan || '{}')

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
          const leftPos = Math.random() * 100;
          const topPos = Math.random() * 100;
          const delay = Math.random() * 3;
          const duration = 2 + Math.random() * 3;
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-bounce"
              style={{
                left: leftPos + '%',
                top: topPos + '%',
                animationDelay: delay + 's',
                animationDuration: duration + 's'
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Financial Metrics
              </h3>
              {metrics && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Credit Utilization</span>
                    <span className="text-orange-400 font-bold">{metrics.credit_utilization_percentage || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Financial Health Score</span>
                    <span className="text-orange-400 font-bold">{metrics.financial_health_score || 0}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Payment Behavior Score</span>
                    <span className="text-orange-400 font-bold">{metrics.payment_behavior_score || 0}/100</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-orange-200">Total Spending</span>
                    <span className="text-orange-400 font-bold">${metrics.total_spending || 0}</span>
                  </div>
                </div>
              )}
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

          <div className="space-y-6">
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
          </div>
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
                    <div className="text-orange-200">Score Code</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{((customCreditScore.utilization_ratio || 0) * 100).toFixed(1)}%</div>
                    <div className="text-orange-200">Utilization</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400 mb-2">{customCreditScore.card_age_months || 'N/A'}</div>
                    <div className="text-orange-200">Card Age (months)</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-orange-100">{customCreditScore.credit_health_status || 'No status available'}</p>
                </div>
              </div>
            )}

            {/* Credit Improvement Plan */}
            {creditPlan && Object.keys(creditPlan).length > 0 && (
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-500/20">
                <h3 className="text-2xl font-bold text-orange-300 mb-6">Personal Credit Improvement Plan</h3>
                
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

                {/* Executive Summary */}
                {creditPlan.executive_summary && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-800/20 to-red-800/20 rounded-lg border border-orange-500/30">
                    <h4 className="text-xl font-bold text-orange-400 mb-4">Executive Summary</h4>
                    <p className="text-orange-100 leading-relaxed">{creditPlan.executive_summary}</p>
                  </div>
                )}
              </div>
            )}

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