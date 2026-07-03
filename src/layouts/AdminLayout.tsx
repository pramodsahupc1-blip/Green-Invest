import React from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, Package, CreditCard } from "lucide-react";

export default function AdminLayout() {
  const isAuthenticated = localStorage.getItem("adminAuth") === "true";
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md relative z-10 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === "/admin"} />
          <NavItem to="/admin/users" icon={<Users size={20} />} label="Users" active={location.pathname.startsWith("/admin/users")} />
          <NavItem to="/admin/products" icon={<Package size={20} />} label="Products" active={location.pathname.startsWith("/admin/products")} />
          <NavItem to="/admin/transactions" icon={<CreditCard size={20} />} label="Transactions" active={location.pathname.startsWith("/admin/transactions")} />
          <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" active={location.pathname.startsWith("/admin/settings")} />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => {
              localStorage.removeItem("adminAuth");
              window.location.href = "/admin/login";
            }}
            className="flex items-center text-red-500 hover:text-red-700 w-full p-3 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center p-3 rounded-xl transition-colors ${
        active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:text-primary hover:bg-green-50"
      }`}
    >
      <div className="mr-3">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
