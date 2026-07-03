import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronLeft, ShieldCheck, Wallet, Edit2, Zap, Info, Copy, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initFirebase } from "../lib/firebase";
import { useSettings } from "../lib/SettingsContext";
import { useAuth } from "../lib/AuthContext";

const AMOUNTS = [720, 285, 520, 1000, 2000, 4785];

export default function Recharge() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState(720);
  const [channel, setChannel] = useState("PAY-A");
  
  const [step, setStep] = useState(1);
  const [utr, setUtr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { settings } = useSettings();
  const upiId = settings.upiId || "jinwoosung.jg@oksbi";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRechargeNext = () => {
    setStep(2);
  };

  const handleSubmitUtr = async () => {
    if (utr.length < 12) {
      alert("Please enter a valid 12-digit UTR/Reference number.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { db } = await initFirebase();
      const txRef = collection(db, "transactions");
      
      await addDoc(txRef, {
        userId: user?.uid || "unknown",
        userPhone: profile?.phone || user?.phoneNumber || "unknown",
        type: "deposit",
        amount: amount,
        utr: utr,
        status: "pending",
        channel: channel,
        createdAt: serverTimestamp()
      });
      
      alert("Payment submitted successfully! Your recharge is pending review.");
      navigate("/");
    } catch (error) {
      console.error("Error submitting recharge:", error);
      alert("Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div className="bg-bg-light min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <button onClick={() => setStep(1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-text-main">
            <ChevronLeft size={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold mr-10">Make Payment</h1>
        </div>
        
        <div className="px-4 pb-24 flex-1">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 mt-4 text-center">
            <h3 className="text-gray-500 font-medium mb-2">Amount to Pay</h3>
            <div className="text-4xl font-extrabold text-primary mb-6">
              ₹{amount.toLocaleString()}
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2 font-medium">Scan to Pay</p>
              <div className="bg-white p-3 rounded-xl border border-gray-200 mb-4 inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Merchant&am=${amount}&cu=INR`)}`} 
                  alt="UPI QR Code" 
                  className="w-40 h-40"
                />
              </div>
              <p className="text-sm text-gray-500 mb-2 font-medium">Or pay to this UPI ID</p>
              <div className="flex items-center justify-between w-full bg-white px-4 py-3 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900 select-all">{upiId}</span>
                <button 
                  onClick={handleCopy}
                  className="w-8 h-8 rounded-lg bg-green-50 text-primary flex items-center justify-center"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2">Enter 12-digit UTR/Reference No.</label>
              <input 
                type="text" 
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                maxLength={12}
                placeholder="e.g. 123456789012"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Info size={14} className="mr-1 text-primary" />
                Must be 12 digits from your payment app
              </p>
            </div>
          </div>
        </div>
        
        {/* Sticky Bottom Action */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-white p-4 pb-6 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitUtr}
            disabled={isSubmitting || utr.length < 12}
            className="w-full bg-gradient-to-r from-primary to-primary-dark disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center uppercase tracking-wider relative overflow-hidden"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-light min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-text-main">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold mr-10">Recharge</h1>
      </div>

      <div className="px-4 pb-24 flex-1">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-light to-primary-dark rounded-[24px] p-5 shadow-lg relative overflow-hidden mt-4">
          <div className="absolute top-2 right-4 w-4 h-4 text-white/20"><StarIcon /></div>
          <div className="absolute bottom-4 right-10 w-6 h-6 text-white/10"><StarIcon /></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 text-white/30"><StarIcon /></div>
          
          <div className="flex items-center relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mr-4 backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-100">Available Balance</p>
              <h2 className="text-3xl font-extrabold text-white">₹8.00</h2>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center bg-white/20 px-3 py-1 rounded-full text-[10px] text-white backdrop-blur-sm font-medium">
            <ShieldCheck size={12} className="mr-1" /> Secured Wallet
          </div>
        </div>

        {/* Amount Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-5 mt-6 shadow-sm border border-gray-50"
        >
          <h3 className="font-bold text-text-main mb-4 text-sm">Enter Amount</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-4xl font-extrabold text-text-main">
              <span className="text-primary mr-1">₹</span>
              {amount.toLocaleString()}
            </div>
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-text-gray">
              <Edit2 size={18} />
            </div>
          </div>

          <p className="text-xs text-text-gray flex items-center mb-4 font-medium">
            <Info size={14} className="mr-1 text-primary" /> Minimum recharge: ₹285
          </p>

          <div className="grid grid-cols-3 gap-3">
            {AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={cn(
                  "py-3 rounded-xl text-sm font-bold border transition-all relative",
                  amount === val 
                    ? "bg-green-50 border-primary text-primary" 
                    : "bg-white border-gray-100 text-text-main hover:bg-gray-50"
                )}
              >
                ₹{val.toLocaleString()}
                {amount === val && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Payment Channel */}
        <div className="mt-6">
          <h3 className="font-bold text-text-main mb-4 text-sm px-1">Payment Channel</h3>
          <div className="space-y-3">
            <PaymentChannelCard 
              name="PAY-A" 
              subtitle="Online · Fast & secure" 
              selected={channel === "PAY-A"}
              onClick={() => setChannel("PAY-A")}
            />
            <PaymentChannelCard 
              name="PAY-B" 
              subtitle="Online · Fast & secure" 
              selected={channel === "PAY-B"}
              onClick={() => setChannel("PAY-B")}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6">
          <h3 className="font-bold text-text-main mb-4 text-sm px-1 flex items-center">
            <Info size={16} className="text-primary mr-2" /> Instructions
          </h3>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-sm text-text-gray space-y-3 font-medium">
            <div className="flex items-start">
              <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center text-primary mt-0.5 mr-2 flex-shrink-0">✓</div>
              <p>Minimum deposit amount is ₹285.</p>
            </div>
            <div className="border-t border-gray-100 border-dashed pt-3 flex items-start">
              <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center text-primary mt-0.5 mr-2 flex-shrink-0">✓</div>
              <p>Please do not save any previous UPI ID or account number. Get a new one every time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[430px] bg-white p-4 pb-6 border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleRechargeNext}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center uppercase tracking-wider relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
          Recharge Now
        </motion.button>
      </div>
    </div>
  );
}

function PaymentChannelCard({ name, subtitle, selected, onClick }: { name: string, subtitle: string, selected: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center p-4 rounded-2xl cursor-pointer transition-all border",
        selected ? "border-primary bg-white shadow-sm" : "border-gray-50 bg-white hover:bg-gray-50"
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mr-4", selected ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>
        <Zap size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-text-main text-sm">{name}</h4>
        <p className="text-[11px] text-text-gray flex items-center mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span> {subtitle}
        </p>
      </div>
      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selected ? "border-primary" : "border-gray-300")}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}
