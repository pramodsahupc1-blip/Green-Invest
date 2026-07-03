import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { cn } from "../lib/utils";
import { loginUser } from "../lib/auth";
import { useSettings } from "../lib/SettingsContext";

export default function Login() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions");
      return;
    }
    if (!phone || !password) {
      setError("Please enter phone and password");
      return;
    }

    setLoading(true);
    try {
      await loginUser(phone, password);
      navigate("/");
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid credentials. Please check your phone and password, or register a new account.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError(err.message || "Invalid phone number or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col relative">
      {/* Background Decor */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-primary-light/20 rounded-full blur-3xl"></div>
      <div className="absolute top-[10%] right-[-50px] w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="pt-16 pb-32 px-6 bg-gradient-to-br from-primary-light to-primary-dark rounded-b-[40px] text-center shadow-lg relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-green-50 text-sm font-medium">Login to your account</p>
        
        {/* Logo Placeholder */}
        <div className="px-4 py-2 h-20 bg-white rounded-full mx-auto mt-6 flex items-center justify-center shadow-xl border-4 border-white/20 min-w-20 max-w-max">
          <span className="text-primary font-bold text-lg italic tracking-tighter truncate">
            {settings.websiteName || "Green"}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-4 -mt-16 relative z-20 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50"
        >
          {/* Tabs */}
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8 shadow-inner">
            <Link to="/login" className="flex-1 text-center py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm">
              Login
            </Link>
            <Link to="/register" className="flex-1 text-center py-3 rounded-xl text-text-gray font-medium text-sm hover:text-primary transition-colors">
              Register
            </Link>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-semibold text-center border border-red-100">
                {error}
              </div>
            )}
            {/* Phone Input */}
            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="text-text-main font-semibold mr-3 border-r border-gray-200 pr-3">+91</span>
              <input 
                type="tel" 
                placeholder="Enter mobile number" 
                className="bg-transparent flex-1 outline-none text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Lock className="text-gray-400 mr-3 w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter password" 
                className="bg-transparent flex-1 outline-none text-sm font-medium placeholder:text-gray-400 placeholder:font-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-primary ml-2 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mt-4">
              <div 
                className={cn("w-5 h-5 rounded flex items-center justify-center cursor-pointer mt-0.5 border flex-shrink-0 transition-colors", acceptedTerms ? "bg-primary border-primary" : "bg-white border-gray-300")}
                onClick={() => setAcceptedTerms(!acceptedTerms)}
              >
                {acceptedTerms && (
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
              <span className="ml-3 text-xs text-text-gray leading-tight">
                I have read and agree to the <Link to="#" className="text-primary font-semibold hover:underline">Terms & Conditions</Link>
              </span>
            </div>

            {/* Login Button */}
            <div className="mt-8">
              <motion.button 
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center text-sm uppercase tracking-wider relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                {loading ? "LOGGING IN..." : "LOGIN"}
              </motion.button>
            </div>

            <div className="text-center mt-6 text-sm text-text-gray">
              Don't have an account? <Link to="/register" className="text-primary font-bold ml-1 hover:underline">Register</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
