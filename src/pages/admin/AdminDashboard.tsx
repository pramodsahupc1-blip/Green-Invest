import React from "react";
import { Users, IndianRupee, Clock } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 font-medium mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex items-center bg-green-50 text-green-600 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 shadow-sm">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Updates
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value="1,248" 
          icon={<Users className="text-blue-600 w-7 h-7" />} 
          bg="bg-blue-50" 
          trend="+12 today" 
          trendUp={true} 
        />
        <StatCard 
          title="Pending Deposits" 
          value="24" 
          subValue="₹1,42,000"
          icon={<Clock className="text-orange-600 w-7 h-7" />} 
          bg="bg-orange-50" 
          trend="Action required" 
          trendUp={false} 
        />
        <StatCard 
          title="Total Revenue" 
          value="₹12,45,230" 
          icon={<IndianRupee className="text-green-600 w-7 h-7" />} 
          bg="bg-green-50" 
          trend="+15.2% this week" 
          trendUp={true} 
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
          <button className="text-sm font-semibold text-primary hover:text-primary-dark">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-4 font-semibold">User ID</th>
                <th className="pb-4 font-semibold">Phone</th>
                <th className="pb-4 font-semibold">Balance</th>
                <th className="pb-4 font-semibold">Join Date</th>
                <th className="pb-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <TableRow id="USR-001" phone="+91 9040845838" balance="₹8.00" date="2023-10-25" status="Active" />
              <TableRow id="USR-002" phone="+91 9876543210" balance="₹1,200.00" date="2023-10-26" status="Active" />
              <TableRow id="USR-003" phone="+91 8765432109" balance="₹0.00" date="2023-10-26" status="Inactive" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon, bg, trend, trendUp }: { title: string, value: string, subValue?: string, icon: React.ReactNode, bg: string, trend?: string, trendUp?: boolean }) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-semibold mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h4>
          {subValue && <span className="text-sm font-medium text-gray-500">({subValue})</span>}
        </div>
      </div>
    </div>
  );
}

function TableRow({ id, phone, balance, date, status }: { id: string, phone: string, balance: string, date: string, status: string }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 text-sm hover:bg-gray-50/50 transition-colors">
      <td className="py-4 text-gray-900 font-bold">{id}</td>
      <td className="py-4 text-gray-600 font-medium">{phone}</td>
      <td className="py-4 font-bold text-primary">{balance}</td>
      <td className="py-4 text-gray-500 font-medium">{date}</td>
      <td className="py-4">
        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
