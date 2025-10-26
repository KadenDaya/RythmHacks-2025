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
        {Array.from({ length: 20 }).map((_, i) => {
          // Fixed positions to prevent hydration mismatch
          const positions = [
            { left: 17.8, top: 46.4, delay: 0.49, duration: 4.76 },
            { left: 72.2, top: 3.3, delay: 0.90, duration: 2.18 },
            { left: 74.6, top: 9.8, delay: 1.77, duration: 3.73 },
            { left: 34.4, top: 78.0, delay: 2.28, duration: 4.92 },
            { left: 66.5, top: 20.4, delay: 1.95, duration: 3.64 },
            { left: 28.0, top: 27.7, delay: 2.83, duration: 4.85 },
            { left: 31.5, top: 73.7, delay: 0.65, duration: 2.77 },
            { left: 89.6, top: 21.8, delay: 1.14, duration: 4.97 },
            { left: 6.2, top: 18.1, delay: 2.75, duration: 3.55 },
            { left: 19.9, top: 89.7, delay: 1.22, duration: 4.99 },
            { left: 2.1, top: 81.7, delay: 2.73, duration: 3.86 },
            { left: 75.8, top: 14.4, delay: 1.12, duration: 4.37 },
            { left: 75.0, top: 70.8, delay: 2.37, duration: 4.63 },
            { left: 93.3, top: 6.2, delay: 0.09, duration: 3.56 },
            { left: 81.7, top: 46.0, delay: 0.75, duration: 4.88 },
            { left: 48.5, top: 11.3, delay: 2.81, duration: 3.98 },
            { left: 38.3, top: 78.5, delay: 2.08, duration: 3.02 },
            { left: 79.5, top: 82.6, delay: 1.58, duration: 3.35 },
            { left: 58.7, top: 23.6, delay: 2.25, duration: 4.06 },
            { left: 66.0, top: 46.9, delay: 2.18, duration: 3.57 }
          ];
          
          const pos = positions[i] || { left: 50, top: 50, delay: 1, duration: 3 };
          
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
