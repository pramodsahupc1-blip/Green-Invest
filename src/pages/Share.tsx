import { motion } from "motion/react";
import { Copy, Share2, QrCode } from "lucide-react";

export default function Share() {
  return (
    <div className="bg-bg-light min-h-screen pb-6 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-light to-primary-dark pt-12 pb-32 px-6 rounded-b-[40px] shadow-lg relative text-center">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Invite Friends</h1>
        <p className="text-green-50 text-sm font-medium">Share your link and earn rewards</p>
      </div>

      <div className="px-4 -mt-24 relative z-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-50 flex flex-col items-center"
        >
          {/* QR Code Placeholder */}
          <div className="w-48 h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
            <QrCode size={64} className="text-primary/50" />
          </div>

          <h3 className="text-lg font-bold text-text-main mb-1">Your Invite Code</h3>
          <p className="text-3xl font-extrabold text-primary tracking-widest mb-6">E841FB</p>

          <div className="w-full space-y-4">
            <button className="w-full bg-green-50 hover:bg-green-100 text-primary font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center text-sm transition-colors">
              <Copy size={18} className="mr-2" /> Copy Invite Code
            </button>
            <button className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center text-sm transition-transform hover:scale-[0.98]">
              <Share2 size={18} className="mr-2" /> Share Link
            </button>
          </div>
        </motion.div>

        {/* Rules */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="font-bold text-text-main mb-4 text-sm">Referral Rules</h3>
          <div className="space-y-4">
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-3 flex-shrink-0">1</div>
              <p className="text-xs text-text-gray font-medium leading-relaxed">
                Share your invite link or code with your friends.
              </p>
            </div>
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-3 flex-shrink-0">2</div>
              <p className="text-xs text-text-gray font-medium leading-relaxed">
                When they register and purchase a product, you will get a Level 1 reward (10%).
              </p>
            </div>
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-3 flex-shrink-0">3</div>
              <p className="text-xs text-text-gray font-medium leading-relaxed">
                You will also receive indirect rewards from their referrals (Level 2: 5%, Level 3: 2%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
