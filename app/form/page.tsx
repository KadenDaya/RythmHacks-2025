"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Form() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    creditCardLimit: "",
    cardAge: "",
    creditCardStatement: "",
    creditForms: "",
    currentDebt: "",
    debtAmount: "",
    debtEndDate: "",
    debtDuration: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Submitting...");

    const submitData = new FormData();
    submitData.append("creditCardLimit", formData.creditCardLimit);
    submitData.append("cardAge", formData.cardAge);
    submitData.append("creditForms", formData.creditForms);
    submitData.append("currentDebt", formData.currentDebt);
    submitData.append("debtAmount", formData.debtAmount);
    submitData.append("debtEndDate", formData.debtEndDate);
    submitData.append("debtDuration", formData.debtDuration);
    

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/submit-financial-info", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        setMessage("✓ Information submitted successfully!");
        // TODO: Redirect to results page
      } else {
        setMessage("Error submitting information");
      }
    } catch (error) {
      setMessage("Connection error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 relative overflow-hidden">
      {/* Animated Sunset Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
          ))}
        </div>
      </div>
      
      {/* Floating Sunset Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Navbar */}
      <nav className="bg-slate-800/90 border-b border-orange-500/20 shadow-sm backdrop-blur-sm relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            Incrediscore
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-orange-300 hover:text-orange-200 transition-colors hover:scale-105 hover:-translate-y-1 duration-300"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12 relative z-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent mb-2 animate-gradient-x">Financial Information Form</h1>
          <p className="text-orange-200 animate-fade-in-delayed">Please fill out your financial information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Credit Card Info */}
          <div className="bg-slate-800/90 rounded-xl p-6 shadow-sm border border-orange-500/20 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-orange-300 mb-4">Credit Card Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Credit Card Limit ($)
                </label>
                <input
                  type="text"
                  name="creditCardLimit"
                  value={formData.creditCardLimit}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                  placeholder="e.g., $5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Card Age (months)
                </label>
                <input
                  type="text"
                  name="cardAge"
                  value={formData.cardAge}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                  placeholder="e.g., 24 months"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-orange-200 mb-2">
                Credit Card Statement Details
              </label>
              <textarea
                name="creditCardStatement"
                value={formData.creditCardStatement}
                onChange={handleInputChange}
                className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                placeholder="Describe your credit card statement details, balances, payments, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Forms of Credit */}
          <div className="bg-slate-800/90 rounded-xl p-6 shadow-sm border border-orange-500/20 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-orange-300 mb-4">Other Forms of Credit</h2>
            <p className="text-sm text-orange-200 mb-4">List all forms of credit you have (e.g., "Credit Cards, Personal Loan, Mortgage")</p>
            <div>
              <textarea
                name="creditForms"
                value={formData.creditForms}
                onChange={(e) => setFormData(prev => ({ ...prev, creditForms: e.target.value }))}
                className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                placeholder="e.g., Credit Cards, Personal Loan, Mortgage, Auto Loan"
                rows={3}
              />
            </div>
          </div>

          {/* Debt Information */}
          <div className="bg-slate-800/90 rounded-xl p-6 shadow-sm border border-orange-500/20 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-orange-300 mb-4">Current Debt & Loans</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Total Current Debt ($)
                </label>
                <input
                  type="text"
                  name="currentDebt"
                  value={formData.currentDebt}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                  placeholder="e.g., $15000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    Debt Amount ($)
                  </label>
                  <input
                    type="text"
                    name="debtAmount"
                    value={formData.debtAmount}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                    placeholder="e.g., $5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    How long? (months)
                  </label>
                  <input
                    type="text"
                    name="debtDuration"
                    value={formData.debtDuration}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                    placeholder="e.g., 24 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-200 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    name="debtEndDate"
                    value={formData.debtEndDate}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
                    placeholder="e.g., December 2025"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 overflow-hidden group"
            >
              <span className="relative z-10">{isSubmitting ? "Submitting..." : "Submit →"}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 rounded-lg animate-border-flow"></div>
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center border ${
              message.includes("✓") 
                ? "bg-green-500/20 text-green-300 border-green-500/30" 
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
