import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { User, Shield, LogOut, ChevronRight, CheckCircle, CreditCard, Banknote, ListOrdered, Download } from "lucide-react";
import { useSettings } from "../lib/SettingsContext";

export default function Profile() {
  const { settings } = useSettings();

  return (
    <div className="bg-bg-light min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-light to-primary-dark pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg relative">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-inner mr-4 border-2 border-white/50">
            <User size={32} />
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">+91 9040845838</h2>
            <p className="text-sm text-green-100 font-medium">Member</p>
          </div>
          <div className="ml-auto w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 -mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-text-gray font-medium flex items-center mb-1">
                Balance <EyeIcon />
              </p>
              <h3 className="text-3xl font-extrabold text-primary tracking-tight">₹8.00</h3>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/recharge" className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center">
                <CheckCircle size={14} className="mr-1" /> Recharge
              </Link>
              <Link to="/withdraw" className="bg-green-600/10 hover:bg-green-600/20 text-green-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center">
                <Banknote size={14} className="mr-1" /> Withdrawal
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
            <div className="text-center border-r border-gray-100">
              <p className="text-[10px] text-text-gray font-medium mb-1">My Balance</p>
              <p className="text-sm font-bold">₹8</p>
            </div>
            <div className="text-center border-r border-gray-100">
              <p className="text-[10px] text-text-gray font-medium mb-1">Recharge</p>
              <p className="text-sm font-bold">₹0</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-text-gray font-medium mb-1">Total Revenue</p>
              <p className="text-sm font-bold">₹8</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu List */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-50">
          <MenuLink icon={<Shield className="text-emerald-500" />} title="About" />
          <MenuLink icon={<CreditCard className="text-blue-500" />} title="Bank Account" />
          <MenuLink icon={<ListOrdered className="text-primary" />} title="My Product" />
          <MenuLink icon={<Banknote className="text-purple-500" />} title="Revenue Record" />
          <MenuLink icon={<Banknote className="text-orange-500" />} title="Withdraw Record" />
          
          <a href={settings.appDownloadLink} target="_blank" rel="noreferrer" className="flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4">
              <Download className="text-indigo-500" />
            </div>
            <span className="font-semibold text-text-main text-sm">Download App</span>
            <ChevronRight className="ml-auto text-gray-300" size={20} />
          </a>
          
          <div className="my-2 border-t border-gray-50"></div>
          
          <Link to="/login" className="flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-red-50 transition-colors">
              <LogOut className="text-text-gray group-hover:text-red-500" size={20} />
            </div>
            <span className="font-semibold text-text-main text-sm group-hover:text-red-500 transition-colors">Logout</span>
            <ChevronRight className="ml-auto text-gray-300" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <Link to="#" className="flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-4">
        {icon}
      </div>
      <span className="font-semibold text-text-main text-sm">{title}</span>
      <ChevronRight className="ml-auto text-gray-300" size={20} />
    </Link>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4 ml-1 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
