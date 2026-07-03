import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronLeft, Copy, Share2, Users, Network, TrendingUp } from "lucide-react";

export default function Team() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-light min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-light to-primary-dark pt-4 pb-20 px-4 rounded-b-[40px] shadow-lg relative">
        <div className="flex items-center text-white mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold mr-10">My Team</h1>
        </div>

        <div className="text-center text-white">
          <p className="text-sm font-medium text-green-100 mb-1">Total Team Members</p>
          <h2 className="text-4xl font-extrabold">1,248</h2>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        {/* Invite Code Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-text-gray font-medium mb-1">My Invite Code</p>
            <h3 className="text-xl font-bold text-primary tracking-widest">E841FB</h3>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
              <Copy size={18} />
            </button>
            <button className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <StatCard icon={<Network size={20} />} title="Direct Members" value="42" color="bg-blue-50 text-blue-600" />
          <StatCard icon={<Users size={20} />} title="Indirect Members" value="1,206" color="bg-purple-50 text-purple-600" />
          <StatCard icon={<TrendingUp size={20} />} title="Today's Income" value="₹1,240" color="bg-green-50 text-green-600" fullWidth />
        </div>

        {/* Level List */}
        <div className="mt-6">
          <h3 className="font-bold text-text-main mb-4 text-sm px-1">Team Levels</h3>
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-50 overflow-hidden">
            <LevelRow level="Level 1" members={42} commission="10%" isFirst />
            <LevelRow level="Level 2" members={218} commission="5%" />
            <LevelRow level="Level 3" members={988} commission="2%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, fullWidth = false }: { icon: React.ReactNode, title: string, value: string, color: string, fullWidth?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-50 ${fullWidth ? "col-span-2 flex items-center justify-between" : ""}`}>
      {fullWidth ? (
        <>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${color}`}>
              {icon}
            </div>
            <p className="text-sm text-text-gray font-medium">{title}</p>
          </div>
          <h4 className="text-xl font-bold text-text-main">{value}</h4>
        </>
      ) : (
        <>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
            {icon}
          </div>
          <p className="text-xs text-text-gray font-medium mb-1">{title}</p>
          <h4 className="text-lg font-bold text-text-main">{value}</h4>
        </>
      )}
    </div>
  );
}

function LevelRow({ level, members, commission, isFirst = false }: { level: string, members: number, commission: string, isFirst?: boolean }) {
  return (
    <div className={`p-4 flex items-center justify-between ${!isFirst ? "border-t border-gray-50" : ""}`}>
      <div>
        <h4 className="font-bold text-sm text-text-main">{level}</h4>
        <p className="text-xs text-text-gray mt-0.5">{members} members</p>
      </div>
      <div className="text-right">
        <div className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full mb-1">
          {commission} Reward
        </div>
      </div>
    </div>
  );
}
