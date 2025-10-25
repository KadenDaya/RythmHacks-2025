"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
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
      
      <nav className="w-full px-8 py-6 flex justify-between items-center relative z-10 animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Incrediscore
        </h1>
        <Link 
          href="/login" 
          className="relative px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-105 hover:-translate-y-1 duration-300 overflow-hidden group"
        >
          <span className="relative z-10">Sign In</span>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 rounded-lg animate-border-flow"></div>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="max-w-4xl text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            <span className="bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent animate-gradient-x">
              Take Control of Your Credit Score
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-orange-200 mb-8 font-light animate-fade-in-delayed">
            Rise Above Your Financial Limits
          </p>

          <div className="space-y-6 mt-12 animate-bounce-in">
            <p className="text-orange-300 text-xl font-medium animate-pulse">
              Begin Your Financial Revolution
            </p>
            
            <Link 
              href="/signup"
              className="relative inline-block px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 hover:scale-110 hover:-translate-y-2 overflow-hidden group"
            >
              <span className="relative z-10">Sign Up →</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 rounded-full animate-border-flow"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
