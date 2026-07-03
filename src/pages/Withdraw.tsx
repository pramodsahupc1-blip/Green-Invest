import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronLeft, Wallet, Building2, HelpCircle, ShieldCheck, Info } from "lucide-react";
import { useSettings } from "../lib/SettingsContext";
import { useAuth } from "../lib/AuthContext";
import { initFirebase } from "../lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function Withdraw() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { settings } = useSettings();

  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank form states
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [savingBank, setSavingBank] = useState(false);

  // Local state for bank account to show changes immediately
  const [currentBankAccount, setCurrentBankAccount] = useState<any>(null);

  useEffect(() => {
    if (profile?.bankAccount) {
      setCurrentBankAccount(profile.bankAccount);
    }
  }, [profile]);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountHolder || !ifsc) {
      alert("Please fill in all bank details.");
      return;
    }
    setSavingBank(true);
    try {
      const { db } = await initFirebase();
      if (!user) throw new Error("No user authenticated");

      const userRef = doc(db, "users", user.uid);
      const bankData = { bankName, accountNumber, accountHolder, ifsc };
      
      await updateDoc(userRef, {
        bankAccount: bankData
      });

      setCurrentBankAccount(bankData);
      setIsAddingBank(false);
      alert("Bank account saved successfully!");
    } catch (error) {
      console.error("Error saving bank details:", error);
      alert("Failed to save bank details. Please try again.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !profile) {
      alert("Please log in first.");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (withdrawAmount < (settings.minWithdrawal || 110)) {
      alert(`Minimum withdrawal amount is ₹${settings.minWithdrawal || 110}.`);
      return;
    }

    const availableBalance = profile.walletBalance || 0;
    if (withdrawAmount > availableBalance) {
      alert("Insufficient balance in your wallet.");
      return;
    }

    if (!currentBankAccount) {
      alert("Please add a bank account first.");
      return;
    }

    if (!password) {
      alert("Please enter your transaction password.");
      return;
    }

    if (password !== profile.withdrawPassword) {
      alert("Incorrect transaction password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { db } = await initFirebase();
      const txRef = collection(db, "transactions");
      const userRef = doc(db, "users", user.uid);

      // Calculate fee
      const feePercent = settings.withdrawalFee || 10;
      const feeAmount = (withdrawAmount * feePercent) / 100;
      const finalAmount = withdrawAmount - feeAmount;

      // Add transaction
      await addDoc(txRef, {
        userId: user.uid,
        userPhone: profile.phone || user.phoneNumber || "unknown",
        type: "withdrawal",
        amount: withdrawAmount,
        fee: feeAmount,
        finalAmount: finalAmount,
        status: "pending",
        bankAccount: currentBankAccount,
        createdAt: serverTimestamp()
      });

      // Deduct balance
      await updateDoc(userRef, {
        walletBalance: availableBalance - withdrawAmount
      });

      alert(`Withdrawal request of ₹${withdrawAmount} submitted! Please wait for approval.`);
      // Redirect or force reload
      navigate("/");
      window.location.reload(); // Refresh profile state
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAllAmount = () => {
    if (profile?.walletBalance) {
      setAmount(profile.walletBalance.toString());
    }
  };

  return (
    <div className="bg-bg-light min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-text-main">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold mr-10">Withdraw</h1>
      </div>

      <div className="px-4 pb-32 flex-1">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-[24px] p-5 shadow-lg relative overflow-hidden mt-4">
          <div className="flex items-center relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mr-4 backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-100">Withdrawable Balance</p>
              <h2 className="text-3xl font-extrabold text-white">₹{(profile?.walletBalance || 0).toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-5 mt-6 shadow-sm border border-gray-50"
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-text-main mb-2 block">Withdrawal Amount</label>
              <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-green-600/50 focus-within:ring-2 focus-within:ring-green-600/10 transition-all">
                <span className="text-green-600 font-bold text-lg mr-2">₹</span>
                <input 
                  type="number" 
                  placeholder={`Min ₹${settings.minWithdrawal}`}
                  className="bg-transparent flex-1 outline-none text-base font-semibold placeholder:text-gray-400 placeholder:font-normal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button 
                  onClick={setAllAmount}
                  className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                >
                  ALL
                </button>
              </div>
            </div>

            {/* Bank details selection or inline form */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-text-main">Bank Account Details</label>
                {!currentBankAccount && !isAddingBank && (
                  <button 
                    onClick={() => setIsAddingBank(true)}
                    className="text-xs text-primary flex items-center font-bold bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 hover:bg-primary/10"
                  >
                    Add Bank +
                  </button>
                )}
              </div>

              {isAddingBank ? (
                <form onSubmit={handleSaveBank} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Enter Bank Information</h4>
                  <input 
                    type="text" 
                    placeholder="Bank Name (e.g. SBI, HDFC)" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 font-medium"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Account Number" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 font-medium"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Account Holder Name" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 font-medium"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="IFSC Code" 
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-600 font-medium"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    required
                  />
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      disabled={savingBank}
                      className="flex-1 bg-green-600 text-white rounded-xl py-2 text-xs font-bold shadow hover:bg-green-700 transition-colors"
                    >
                      {savingBank ? "Saving..." : "Save Bank Details"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingBank(false)}
                      className="bg-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-bold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : currentBankAccount ? (
                <div className="relative bg-green-50/50 rounded-2xl px-4 py-4 border border-green-100/50 flex items-start">
                  <Building2 className="text-green-600 mr-3 w-6 h-6 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{currentBankAccount.bankName}</h4>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">A/C: {currentBankAccount.accountNumber}</p>
                    <p className="text-xs text-gray-500 font-medium">Name: {currentBankAccount.accountHolder} | IFSC: {currentBankAccount.ifsc}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setBankName(currentBankAccount.bankName || "");
                      setAccountNumber(currentBankAccount.accountNumber || "");
                      setAccountHolder(currentBankAccount.accountHolder || "");
                      setIfsc(currentBankAccount.ifsc || "");
                      setIsAddingBank(true);
                    }}
                    className="ml-auto text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded font-bold hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                  <Building2 className="text-gray-400 mr-3 w-5 h-5" />
                  <span className="text-sm text-gray-500 font-medium">No bank account added</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-text-main mb-2 block">Transaction Password</label>
              <div className="relative flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-green-600/50 focus-within:ring-2 focus-within:ring-green-600/10 transition-all">
                <input 
                  type="password" 
                  placeholder="Enter transaction password"
                  className="bg-transparent flex-1 outline-none text-sm font-medium placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rules */}
        <div className="mt-6 bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <h3 className="font-bold text-orange-800 mb-3 text-sm flex items-center">
            <HelpCircle size={16} className="mr-2" /> Withdrawal Rules
          </h3>
          <ul className="text-xs text-orange-700/80 space-y-2 list-disc pl-4 font-medium leading-relaxed">
            <li>Minimum withdrawal amount is ₹{settings.minWithdrawal || 110}.</li>
            <li>Withdrawal time is from 10:00 to 18:00 every day.</li>
            <li>Withdrawal fee is {settings.withdrawalFee || 10}%.</li>
            <li>Usually arrives within 2 hours, up to 24 hours in case of bank delays.</li>
          </ul>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[430px] bg-white p-4 pb-6 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleWithdraw}
          disabled={!settings.enableWithdrawals || isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center uppercase tracking-wider relative overflow-hidden"
        >
          {isSubmitting 
            ? "Processing..." 
            : settings.enableWithdrawals 
              ? "Withdraw Now" 
              : "Withdrawals Disabled"}
        </motion.button>
      </div>
    </div>
  );
}
