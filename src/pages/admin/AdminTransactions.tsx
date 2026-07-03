import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { initFirebase } from "../../lib/firebase";
import { 
  CreditCard, 
  Search, 
  Check, 
  X, 
  Building2, 
  User, 
  Filter, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  AlertTriangle, 
  Info,
  Calendar,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../../lib/SettingsContext";

export default function AdminTransactions() {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modals Toggles
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State for Editing
  const [editingTx, setEditingTx] = useState<any>(null);

  // Form Fields - Add/Edit Transaction
  const [formType, setFormType] = useState<"deposit" | "withdrawal">("deposit");
  const [formUserId, setFormUserId] = useState("");
  const [formUserPhone, setFormUserPhone] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFee, setFormFee] = useState("0");
  const [formStatus, setFormStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [formUtr, setFormUtr] = useState("");
  const [formChannel, setFormChannel] = useState("PAY-A");
  const [formAutoUpdate, setFormAutoUpdate] = useState(true);

  // Bank Form Fields
  const [formBankName, setFormBankName] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formAccountHolder, setFormAccountHolder] = useState("");
  const [formIfsc, setFormIfsc] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const { db } = await initFirebase();
      
      // Fetch Transactions
      const txRef = collection(db, "transactions");
      const txSnapshot = await getDocs(txRef);
      const txList: any[] = [];
      txSnapshot.forEach((doc) => {
        txList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort transactions descending by creation date
      txList.sort((a, b) => {
        const timeA = a.createdAt ? (a.createdAt.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime()) : 0;
        const timeB = b.createdAt ? (b.createdAt.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime()) : 0;
        return timeB - timeA;
      });
      setTransactions(txList);

      // Fetch Users
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const usersList: any[] = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      // Sort users by phone
      usersList.sort((a, b) => (a.phone || "").localeCompare(b.phone || ""));
      setUsers(usersList);

    } catch (error) {
      console.error("Error loading admin transaction data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick action Approve
  const handleApprove = async (tx: any) => {
    if (!window.confirm(`Are you sure you want to APPROVE this ${tx.type} of ₹${tx.amount}?`)) {
      return;
    }

    setProcessingId(tx.id);
    try {
      const { db } = await initFirebase();
      
      // If deposit, credit user balance
      if (tx.type === "deposit") {
        const userRef = doc(db, "users", tx.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().walletBalance || 0;
          const currentTotalRevenue = userSnap.data().totalRevenue || 0;
          await updateDoc(userRef, {
            walletBalance: currentBalance + tx.amount,
            totalRevenue: currentTotalRevenue + tx.amount
          });
        } else {
          alert("Error: User document not found. Cannot credit wallet.");
          setProcessingId(null);
          return;
        }
      }

      // Update status
      const txRef = doc(db, "transactions", tx.id);
      await updateDoc(txRef, {
        status: "completed",
        updatedAt: new Date().toISOString()
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "completed" } : t))
      );
      alert("Transaction approved successfully!");
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Failed to approve transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  // Quick action Reject
  const handleReject = async (tx: any) => {
    if (!window.confirm(`Are you sure you want to REJECT this ${tx.type} of ₹${tx.amount}?`)) {
      return;
    }

    setProcessingId(tx.id);
    try {
      const { db } = await initFirebase();

      // If withdrawal, refund back to user wallet
      if (tx.type === "withdrawal") {
        const userRef = doc(db, "users", tx.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().walletBalance || 0;
          await updateDoc(userRef, {
            walletBalance: currentBalance + tx.amount
          });
        } else {
          alert("Error: User document not found. Refund could not be processed.");
          setProcessingId(null);
          return;
        }
      }

      // Update status
      const txRef = doc(db, "transactions", tx.id);
      await updateDoc(txRef, {
        status: "failed",
        updatedAt: new Date().toISOString()
      });

      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, status: "failed" } : t))
      );
      alert("Transaction rejected and refunded if applicable.");
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      alert("Failed to reject transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper: Open Modal to Add
  const openAddModal = () => {
    setFormType("deposit");
    setFormUserId("");
    setFormUserPhone("");
    setFormAmount("");
    setFormFee("0");
    setFormStatus("completed"); // Default manual additions are usually completed
    setFormUtr("");
    setFormChannel("Manual-Admin");
    setFormBankName("");
    setFormAccountNumber("");
    setFormAccountHolder("");
    setFormIfsc("");
    setFormAutoUpdate(true);
    setIsAddModalOpen(true);
  };

  // Helper: Open Modal to Edit
  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setFormType(tx.type || "deposit");
    setFormUserId(tx.userId || "");
    setFormUserPhone(tx.userPhone || "");
    setFormAmount((tx.amount || 0).toString());
    setFormFee((tx.fee || 0).toString());
    setFormStatus(tx.status || "pending");
    setFormUtr(tx.utr || "");
    setFormChannel(tx.channel || "PAY-A");
    setFormAutoUpdate(true);

    if (tx.bankAccount) {
      setFormBankName(tx.bankAccount.bankName || "");
      setFormAccountNumber(tx.bankAccount.accountNumber || "");
      setFormAccountHolder(tx.bankAccount.accountHolder || "");
      setFormIfsc(tx.bankAccount.ifsc || "");
    } else {
      setFormBankName("");
      setFormAccountNumber("");
      setFormAccountHolder("");
      setFormIfsc("");
    }

    setIsEditModalOpen(true);
  };

  // Execute Ledger Corrections on user wallet
  const adjustUserWallet = async (
    db: any, 
    userId: string, 
    type: "deposit" | "withdrawal",
    oldStatus: string, 
    newStatus: string, 
    amount: number, 
    oldAmount: number
  ) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("User document does not exist");
    }

    const userData = userSnap.data();
    let balanceChange = 0;
    let revenueChange = 0;

    if (type === "deposit") {
      // Deposits only add to balance/revenue when they are "completed"
      const wasCompleted = oldStatus === "completed";
      const isCompleted = newStatus === "completed";

      if (!wasCompleted && isCompleted) {
        balanceChange = amount;
        revenueChange = amount;
      } else if (wasCompleted && !isCompleted) {
        balanceChange = -oldAmount;
        revenueChange = -oldAmount;
      } else if (wasCompleted && isCompleted) {
        // Both were completed but amount changed
        balanceChange = amount - oldAmount;
        revenueChange = amount - oldAmount;
      }
    } else if (type === "withdrawal") {
      // Withdrawals are deducted on creation (i.e. pending or completed means already deducted)
      // They are refunded ONLY when failed.
      const wasFailed = oldStatus === "failed";
      const isFailed = newStatus === "failed";

      if (!wasFailed && isFailed) {
        // Transition to Failed -> Refund amount
        balanceChange = amount;
      } else if (wasFailed && !isFailed) {
        // Transition away from Failed -> Deduct the amount again
        balanceChange = -oldAmount;
      } else if (wasFailed && isFailed) {
        // Both failed but amount changed -> adjust the refund difference
        balanceChange = amount - oldAmount;
      } else {
        // Standard flow (pending -> completed) has no wallet balance change because it was already deducted when pending!
        // But if they edit the amount while NOT failed (e.g. while pending or completed):
        if (amount !== oldAmount) {
          balanceChange = oldAmount - amount; // If new amount is higher, deduct the difference; if lower, return difference
        }
      }
    }

    if (balanceChange !== 0 || revenueChange !== 0) {
      const currentBalance = userData.walletBalance || 0;
      const currentRevenue = userData.totalRevenue || 0;
      
      await updateDoc(userRef, {
        walletBalance: currentBalance + balanceChange,
        totalRevenue: Math.max(0, currentRevenue + revenueChange)
      });
    }
  };

  // Submit Add Transaction Form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId) {
      alert("Please select a user.");
      return;
    }
    const amountVal = parseFloat(formAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const feeVal = parseFloat(formFee || "0") || 0;
    const finalAmountVal = amountVal - feeVal;

    try {
      const { db } = await initFirebase();

      // Build bank account data if withdrawal
      let bankData = null;
      if (formType === "withdrawal" && formBankName) {
        bankData = {
          bankName: formBankName,
          accountNumber: formAccountNumber,
          accountHolder: formAccountHolder,
          ifsc: formIfsc
        };
      }

      // Add to Firestore transactions
      const txData: any = {
        userId: formUserId,
        userPhone: formUserPhone,
        type: formType,
        amount: amountVal,
        fee: feeVal,
        finalAmount: finalAmountVal,
        status: formStatus,
        createdAt: serverTimestamp()
      };

      if (formType === "deposit") {
        if (formUtr) txData.utr = formUtr;
        if (formChannel) txData.channel = formChannel;
      } else {
        if (bankData) txData.bankAccount = bankData;
      }

      const txRef = await addDoc(collection(db, "transactions"), txData);

      // Perform Wallet Auto Update
      if (formAutoUpdate) {
        const userRef = doc(db, "users", formUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentBalance = userData.walletBalance || 0;
          const currentRevenue = userData.totalRevenue || 0;

          if (formType === "deposit") {
            // If completed deposit, credit wallet
            if (formStatus === "completed") {
              await updateDoc(userRef, {
                walletBalance: currentBalance + amountVal,
                totalRevenue: currentRevenue + amountVal
              });
            }
          } else if (formType === "withdrawal") {
            // If manual withdrawal, we subtract it from wallet (unless status is failed)
            if (formStatus !== "failed") {
              await updateDoc(userRef, {
                walletBalance: Math.max(0, currentBalance - amountVal)
              });
            }
          }
        }
      }

      alert("Transaction added successfully!");
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction. Try again.");
    }
  };

  // Submit Edit Transaction Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amountVal = parseFloat(formAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const feeVal = parseFloat(formFee || "0") || 0;
    const finalAmountVal = amountVal - feeVal;

    try {
      const { db } = await initFirebase();

      // Adjust wallet balance first if requested
      if (formAutoUpdate) {
        await adjustUserWallet(
          db, 
          editingTx.userId, 
          editingTx.type, 
          editingTx.status, // Old Status
          formStatus, // New Status
          amountVal, // New Amount
          editingTx.amount // Old Amount
        );
      }

      // Update Transaction in Firestore
      const txRef = doc(db, "transactions", editingTx.id);
      const updateData: any = {
        amount: amountVal,
        fee: feeVal,
        finalAmount: finalAmountVal,
        status: formStatus,
        updatedAt: new Date().toISOString()
      };

      if (formType === "deposit") {
        updateData.utr = formUtr;
        updateData.channel = formChannel;
      } else {
        updateData.bankAccount = {
          bankName: formBankName,
          accountNumber: formAccountNumber,
          accountHolder: formAccountHolder,
          ifsc: formIfsc
        };
      }

      await updateDoc(txRef, updateData);

      alert("Transaction updated successfully!");
      setIsEditModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Error: " + (error as Error).message);
    }
  };

  // Delete Transaction
  const handleDeleteTx = async () => {
    if (!editingTx) return;
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE this transaction record? This action cannot be undone and will NOT automatically reverse wallet changes. Make sure you adjust user balance if needed!")) {
      return;
    }

    try {
      const { db } = await initFirebase();
      const txRef = doc(db, "transactions", editingTx.id);
      await deleteDoc(txRef);

      alert("Transaction deleted successfully.");
      setIsEditModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    }
  };

  // Handle User select in Form
  const handleUserSelect = (uId: string) => {
    setFormUserId(uId);
    const selectedUser = users.find(u => u.id === uId);
    if (selectedUser) {
      setFormUserPhone(selectedUser.phone || "");
      // Auto prefill bank details if they exist in user profile
      if (selectedUser.bankAccount) {
        setFormBankName(selectedUser.bankAccount.bankName || "");
        setFormAccountNumber(selectedUser.bankAccount.accountNumber || "");
        setFormAccountHolder(selectedUser.bankAccount.accountHolder || "");
        setFormIfsc(selectedUser.bankAccount.ifsc || "");
      } else {
        setFormBankName("");
        setFormAccountNumber("");
        setFormAccountHolder("");
        setFormIfsc("");
      }
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (tx.userPhone && tx.userPhone.toLowerCase().includes(searchLower)) ||
      (tx.utr && tx.utr.toLowerCase().includes(searchLower)) ||
      (tx.userId && tx.userId.toLowerCase().includes(searchLower)) ||
      (tx.id && tx.id.toLowerCase().includes(searchLower));

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="pb-12">
      {/* Header section with Add Transaction */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight flex items-center">
            <Layers className="w-7 h-7 mr-2.5 text-primary" /> Transactions Ledger
          </h2>
          <p className="text-gray-500 font-semibold mt-1">Audit, edit, and manually add recharges & withdrawals</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={openAddModal}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </button>
          <button 
            onClick={loadData}
            className="bg-white hover:bg-gray-50 border border-gray-200 p-3 rounded-2xl text-gray-600 transition-all flex items-center justify-center shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mr-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Deposits</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mr-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Withdrawals</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mr-4">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {transactions.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search phone number, UTR code, user ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 w-full border border-gray-200 bg-gray-50/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-gray-800 placeholder:text-gray-400 transition-all"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="flex items-center bg-gray-50 rounded-2xl px-3 border border-gray-200 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none py-3 w-full sm:w-auto cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits Only</option>
                <option value="withdrawal">Withdrawals Only</option>
              </select>
            </div>

            <div className="flex items-center bg-gray-50 rounded-2xl px-3 border border-gray-200 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400 mr-2" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none py-3 w-full sm:w-auto cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">🟡 Pending</option>
                <option value="completed">🟢 Completed</option>
                <option value="failed">🔴 Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
                <th className="px-5 py-4">User Details</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Reference/Bank Info</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Syncing Ledger...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-500 font-bold">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 last:border-0 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-5">
                      <div className="font-extrabold text-gray-950">{tx.userPhone || 'No Phone'}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">UID: {tx.userId || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide inline-block ${
                        tx.type === 'deposit' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      {tx.type === "deposit" ? (
                        <div className="max-w-xs">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">UTR Reference:</span>
                          <span className="font-mono text-xs font-extrabold text-gray-900 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded mt-0.5 inline-block">
                            {tx.utr || 'N/A'}
                          </span>
                          {tx.channel && <div className="text-[10px] text-gray-400 font-medium mt-1">Channel: {tx.channel}</div>}
                        </div>
                      ) : (
                        <div className="max-w-xs text-xs space-y-0.5">
                          {tx.bankAccount ? (
                            <>
                              <div className="font-extrabold text-gray-900 flex items-center">
                                <Building2 className="w-3.5 h-3.5 text-gray-400 mr-1 flex-shrink-0" />
                                {tx.bankAccount.bankName}
                              </div>
                              <div className="font-mono font-semibold text-gray-700">A/C: {tx.bankAccount.accountNumber}</div>
                              <div className="text-gray-400 text-[10px] font-medium">
                                Holder: {tx.bankAccount.accountHolder} | IFSC: {tx.bankAccount.ifsc}
                              </div>
                            </>
                          ) : (
                            <span className="text-red-500 font-black flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" /> No Bank Attached
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <div className="font-black text-gray-950 text-base">₹{(tx.amount || 0).toLocaleString()}</div>
                      {tx.fee > 0 && (
                        <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                          Fee: ₹{tx.fee} (Net: ₹{tx.finalAmount})
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-block ${
                        tx.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : tx.status === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tx.status}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1.5 font-bold flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {tx.createdAt ? new Date(tx.createdAt.seconds ? tx.createdAt.seconds * 1000 : tx.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {tx.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(tx)}
                              disabled={processingId !== null}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl shadow-sm transition-colors"
                              title="Approve & Apply Wallet Credit"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(tx)}
                              disabled={processingId !== null}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-sm transition-colors"
                              title="Reject & Refund Withdrawal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(tx)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors"
                          title="Detailed Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-950 flex items-center">
                  <Plus className="w-6 h-6 text-primary mr-2" /> Add Transaction
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
                {/* Select User */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Select Platform User</label>
                  <select 
                    required
                    value={formUserId}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold focus:outline-none focus:border-primary cursor-pointer text-gray-800"
                  >
                    <option value="">-- Choose User --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.phone || 'No Phone'} (Bal: ₹{(u.walletBalance || 0).toFixed(1)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormType("deposit")}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                        formType === "deposit"
                          ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Deposit / Recharge
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("withdrawal")}
                      className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                        formType === "withdrawal"
                          ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Withdrawal / Payout
                    </button>
                  </div>
                </div>

                {/* Amount and Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Fee (₹)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 10"
                      value={formFee}
                      onChange={(e) => setFormFee(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                </div>

                {/* Conditional Fields: Deposit details */}
                {formType === "deposit" && (
                  <div className="space-y-3 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-wide">Deposit Specific Details</h4>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">UTR / Tx Reference Code</label>
                      <input 
                        type="text"
                        placeholder="Enter 12-digit UTR"
                        value={formUtr}
                        onChange={(e) => setFormUtr(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Payment Channel</label>
                      <input 
                        type="text"
                        placeholder="e.g. PAY-A, Manual"
                        value={formChannel}
                        onChange={(e) => setFormChannel(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields: Withdrawal details */}
                {formType === "withdrawal" && (
                  <div className="space-y-3 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">Recipient Bank Account Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Bank Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. SBI"
                          value={formBankName}
                          onChange={(e) => setFormBankName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">IFSC Code</label>
                        <input 
                          type="text"
                          placeholder="e.g. SBIN000123"
                          value={formIfsc}
                          onChange={(e) => setFormIfsc(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-amber-500 text-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Account Number</label>
                      <input 
                        type="text"
                        placeholder="Enter full bank account number"
                        value={formAccountNumber}
                        onChange={(e) => setFormAccountNumber(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-amber-500 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Account Holder Name</label>
                      <input 
                        type="text"
                        placeholder="Name in bank records"
                        value={formAccountHolder}
                        onChange={(e) => setFormAccountHolder(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* Status Selection */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Initial Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus("completed")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "completed"
                          ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus("pending")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "pending"
                          ? "bg-yellow-50 border-yellow-500 text-yellow-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus("failed")}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "failed"
                          ? "bg-red-50 border-red-500 text-red-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Wallet Balance Auto Sync option */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex items-start">
                  <div className="flex items-center h-5">
                    <input 
                      id="auto-update-balance"
                      type="checkbox"
                      checked={formAutoUpdate}
                      onChange={(e) => setFormAutoUpdate(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="auto-update-balance" className="ml-3 text-xs font-semibold text-gray-600 leading-tight cursor-pointer">
                    <span className="font-bold text-gray-800 block mb-0.5">Automatically credit/deduct user's wallet</span>
                    If checked, the system will instantly sync the user's wallet balance and total revenue ledger on creation.
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all uppercase tracking-wider"
                  >
                    Create Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-gray-100 text-gray-700 font-bold px-5 rounded-2xl py-3.5 text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT / DETAILS TRANSACTION MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && editingTx && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative z-10 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-950 flex items-center">
                  <Edit3 className="w-6 h-6 text-primary mr-2" /> Edit Transaction
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
                
                {/* User Info Readonly */}
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Target User Account</span>
                  <div className="font-extrabold text-gray-900 mt-1 flex items-center text-sm">
                    <User className="w-4 h-4 mr-1.5 text-primary" /> {formUserPhone || "No phone record"}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">UID: {formUserId}</div>
                </div>

                {/* Type Readonly Banner */}
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Transaction Type</span>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide inline-block ${
                    formType === 'deposit' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {formType}
                  </span>
                </div>

                {/* Amount and Fee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Fee (₹)</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={formFee}
                      onChange={(e) => setFormFee(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                </div>

                {/* Deposit Details Form fields */}
                {formType === "deposit" && (
                  <div className="space-y-3 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-800 uppercase tracking-wide">Deposit Specific Details</h4>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">UTR Reference Code</label>
                      <input 
                        type="text"
                        placeholder="12-digit UTR"
                        value={formUtr}
                        onChange={(e) => setFormUtr(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Payment Channel</label>
                      <input 
                        type="text"
                        placeholder="e.g. PAY-A"
                        value={formChannel}
                        onChange={(e) => setFormChannel(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* Withdrawal details form fields */}
                {formType === "withdrawal" && (
                  <div className="space-y-3 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">Recipient Bank Account Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Bank Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. SBI"
                          value={formBankName}
                          onChange={(e) => setFormBankName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">IFSC Code</label>
                        <input 
                          type="text"
                          placeholder="e.g. SBIN000123"
                          value={formIfsc}
                          onChange={(e) => setFormIfsc(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-amber-500 text-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Account Number</label>
                      <input 
                        type="text"
                        placeholder="Account Number"
                        value={formAccountNumber}
                        onChange={(e) => setFormAccountNumber(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-amber-500 text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">Account Holder Name</label>
                      <input 
                        type="text"
                        placeholder="Name in bank records"
                        value={formAccountHolder}
                        onChange={(e) => setFormAccountHolder(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                {/* Status Toggles */}
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 block">Update Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus("completed")}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "completed"
                          ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus("pending")}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "pending"
                          ? "bg-yellow-50 border-yellow-500 text-yellow-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus("failed")}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        formStatus === "failed"
                          ? "bg-red-50 border-red-500 text-red-700 shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Ledger corrections notice / warning */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3.5">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-orange-900 uppercase tracking-wide">Automatic Wallet Adjustment</h5>
                      <p className="text-[11px] text-orange-800/80 leading-relaxed font-semibold mt-0.5">
                        Changing status or amounts can trigger user wallet balance adjustments.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-start border-t border-orange-200/50 pt-2.5">
                    <input 
                      id="edit-auto-update-balance"
                      type="checkbox"
                      checked={formAutoUpdate}
                      onChange={(e) => setFormAutoUpdate(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-offset-0 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="edit-auto-update-balance" className="ml-2.5 text-[11px] font-bold text-orange-950 cursor-pointer">
                      Automatically adjust user balance based on this correction (Recommended)
                    </label>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-100 transition-all uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTx}
                    className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold px-4 rounded-2xl py-3.5 text-sm transition-all flex items-center justify-center"
                    title="Permanently Delete Record"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-100 text-gray-700 font-bold px-4 rounded-2xl py-3.5 text-sm hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
