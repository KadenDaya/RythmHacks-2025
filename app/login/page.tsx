"use client";

import { useState } from "react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const endpoint = isLogin ? "login" : "register";
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        if (isLogin) {
          try {
            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            window.location.href = "/form";
          } catch (jsonError) {
            setMessage("Login successful but invalid response format");
          }
        } else {
          setMessage("Registration successful! Logging you in...");
          const loginResponse = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          });
          if (loginResponse.ok) {
            try {
              const loginData = await loginResponse.json();
              localStorage.setItem("token", loginData.access_token);
              window.location.href = "/form";
            } catch (jsonError) {
              setMessage("Registration successful but login response invalid");
            }
          } else {
            setMessage("Registration successful but login failed");
          }
        }
      } else {
        try {
          const error = await response.json();
          setMessage(error.detail || "Error occurred");
        } catch (jsonError) {
          setMessage("Error occurred");
        }
      }
    } catch (error) {
      console.log("Error caught:", error);
      setMessage(`Connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full animate-pulse">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border border-orange-500/20 hover:border-orange-400/40 transition-colors duration-300"></div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
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
      
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-xl shadow-2xl w-96 border border-orange-500/20 backdrop-blur-sm relative z-10 animate-slide-up">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Incrediscore
        </h1>
        <h2 className="text-xl font-semibold mb-6 text-center text-orange-300 animate-fade-in-delayed">
          {isLogin ? "Access Your Account" : "Join The Revolution"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-orange-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-orange-300/70 transition-all duration-300"
              required
            />
          </div>
          
          <button
            type="submit"
            className="relative w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-md transition-all font-semibold shadow-lg hover:shadow-orange-500/50 hover:scale-105 hover:-translate-y-1 duration-300 overflow-hidden group"
          >
            <span className="relative z-10">{isLogin ? "Access Account" : "Create Account"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 rounded-md animate-border-flow"></div>
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 bg-slate-700/50 border border-orange-500/30 rounded-md text-center text-orange-200">
            {message}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-400 hover:text-orange-300 underline transition-colors hover:scale-105 duration-300"
          >
            {isLogin ? "Need an account? Join us" : "Have an account? Access it"}
          </button>
        </div>
      </div>
    </div>
  );
}