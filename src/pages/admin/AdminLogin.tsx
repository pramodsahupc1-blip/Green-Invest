import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { initFirebase } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id === "8144553817" && password === "admin20") {
      setLoading(true);
      try {
        const { auth, db } = await initFirebase();
        const adminEmail = "admin@greeninvest.app";
        try {
          await signInWithEmailAndPassword(auth, adminEmail, password);
        } catch (authErr: any) {
           if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
              const userCred = await createUserWithEmailAndPassword(auth, adminEmail, password);
              await setDoc(doc(db, "users", userCred.user.uid), {
                phone: "admin",
                role: "admin",
                walletBalance: 0,
                totalRevenue: 0,
                createdAt: new Date().toISOString()
              });
           } else {
             throw authErr;
           }
        }
        localStorage.setItem("adminAuth", "true");
        navigate("/admin");
      } catch (err: any) {
        setError("Admin login failed: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    } else {
      setError("Invalid ID or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Admin Login</h1>
          <p className="text-gray-500 font-medium">Green Invest Admin Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-semibold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Admin ID</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <User className="text-gray-400 mr-3 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Enter Admin ID" 
                className="bg-transparent flex-1 outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <Lock className="text-gray-400 mr-3 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Enter Password" 
                className="bg-transparent flex-1 outline-none text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-2xl transition-transform hover:scale-[0.98] shadow-lg shadow-primary/30 mt-8 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
