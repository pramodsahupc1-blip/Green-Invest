import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { initFirebase } from "../../lib/firebase";
import { Users, Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { db } = await initFirebase();
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const usersList: any[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-500 font-medium mt-1">Manage platform users and balances</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Total: {users.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-4 font-semibold">User ID</th>
                <th className="pb-4 font-semibold">Phone</th>
                <th className="pb-4 font-semibold">Role</th>
                <th className="pb-4 font-semibold">Balance</th>
                <th className="pb-4 font-semibold">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-gray-900 font-bold">{user.id.substring(0, 8)}...</td>
                    <td className="py-4 text-gray-600 font-medium">{user.phone}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-primary">₹{(user.walletBalance || 0).toLocaleString()}</td>
                    <td className="py-4 text-gray-500 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
