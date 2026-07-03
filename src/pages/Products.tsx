import { useState } from "react";
import { motion } from "motion/react";
import { ClipboardList, Clock, IndianRupee } from "lucide-react";

const MY_PRODUCTS = [
  {
    id: 1,
    name: "Special Offer Plan",
    deposit: 720,
    daily: 4354,
    total: 8708,
    remainingDays: 2,
    status: "active",
  },
];

export default function Products() {
  const [activeTab, setActiveTab] = useState("running");

  return (
    <div className="bg-bg-light min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-light to-primary-dark pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg relative">
        <h1 className="text-2xl font-bold text-white text-center">My Products</h1>
      </div>

      <div className="px-4 -mt-12 relative z-10">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-gray-50">
          <button
            onClick={() => setActiveTab("running")}
            className={`flex-1 text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "running"
                ? "bg-primary text-white shadow-sm"
                : "text-text-gray hover:text-primary"
            }`}
          >
            Running
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === "completed"
                ? "bg-primary text-white shadow-sm"
                : "text-text-gray hover:text-primary"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-4">
          {MY_PRODUCTS.filter(
            (p) =>
              (activeTab === "running" && p.status === "active") ||
              (activeTab === "completed" && p.status === "completed")
          ).map((product, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={product.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text-main">{product.name}</h3>
                  <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md mt-1 font-medium w-fit">
                    <Clock size={12} className="mr-1" />
                    Remaining: {product.remainingDays} Days
                  </div>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <ClipboardList size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div>
                  <p className="text-[10px] text-text-gray font-medium mb-1 uppercase tracking-wider">
                    Deposit Amount
                  </p>
                  <p className="font-bold flex items-center text-text-main text-sm">
                    <IndianRupee size={14} className="mr-0.5" />
                    {product.deposit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-gray font-medium mb-1 uppercase tracking-wider">
                    Daily Income
                  </p>
                  <p className="font-bold flex items-center text-primary text-sm">
                    <IndianRupee size={14} className="mr-0.5" />
                    {product.daily.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-gray font-medium mb-1 uppercase tracking-wider">
                    Total Income
                  </p>
                  <p className="font-bold flex items-center text-text-main text-sm">
                    <IndianRupee size={14} className="mr-0.5" />
                    {product.total.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-gray font-medium mb-1 uppercase tracking-wider">
                    Today's Profit
                  </p>
                  <p className="font-bold flex items-center text-primary text-sm">
                    <IndianRupee size={14} className="mr-0.5" />
                    {product.daily.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {MY_PRODUCTS.filter(
            (p) =>
              (activeTab === "running" && p.status === "active") ||
              (activeTab === "completed" && p.status === "completed")
          ).length === 0 && (
            <div className="text-center py-10">
              <p className="text-text-gray font-medium">No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
