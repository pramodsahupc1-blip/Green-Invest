import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { initFirebase } from "../../lib/firebase";
import { Package, Plus, X, Edit2, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    image: "",
    deposit: "",
    daily: "",
    total: "",
    days: "",
    type: "normal"
  });

  // Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const { db } = await initFirebase();
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      const productsList: any[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { db } = await initFirebase();
      const productsRef = collection(db, "products");
      
      await addDoc(productsRef, {
        name: newProduct.name,
        image: newProduct.image,
        deposit: Number(newProduct.deposit),
        daily: Number(newProduct.daily),
        total: Number(newProduct.total),
        days: Number(newProduct.days),
        type: newProduct.type || "normal",
        createdAt: serverTimestamp()
      });
      
      setShowAddModal(false);
      setNewProduct({ name: "", image: "", deposit: "", daily: "", total: "", days: "", type: "normal" });
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name || "",
      image: product.image || "",
      deposit: product.deposit ? String(product.deposit) : "",
      daily: product.daily ? String(product.daily) : "",
      total: product.total ? String(product.total) : "",
      days: product.days ? String(product.days) : "",
      type: product.type || "normal"
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);
    
    try {
      const { db } = await initFirebase();
      const productDocRef = doc(db, "products", editingProduct.id);
      
      await updateDoc(productDocRef, {
        name: editingProduct.name,
        image: editingProduct.image,
        deposit: Number(editingProduct.deposit),
        daily: Number(editingProduct.daily),
        total: Number(editingProduct.total),
        days: Number(editingProduct.days),
        type: editingProduct.type || "normal",
        updatedAt: serverTimestamp()
      });
      
      setEditingProduct(null);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsSubmitting(true);
    
    try {
      const { db } = await initFirebase();
      const productDocRef = doc(db, "products", productToDelete.id);
      await deleteDoc(productDocRef);
      
      setProductToDelete(null);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
          <p className="text-gray-500 font-medium mt-1">Manage investment plans</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Total: {products.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-4 font-semibold">Image</th>
                <th className="pb-4 font-semibold">Product Name</th>
                <th className="pb-4 font-semibold">Type</th>
                <th className="pb-4 font-semibold">Deposit</th>
                <th className="pb-4 font-semibold">Daily Income</th>
                <th className="pb-4 font-semibold">Total Income</th>
                <th className="pb-4 font-semibold">Duration (Days)</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 text-sm hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-gray-900 font-bold">{product.name}</td>
                    <td className="py-4">
                      {product.type === "vip" ? (
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">
                          VIP
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-primary">₹{(product.deposit || 0).toLocaleString()}</td>
                    <td className="py-4 font-bold text-green-600">₹{(product.daily || 0).toLocaleString()}</td>
                    <td className="py-4 font-bold text-gray-900">₹{(product.total || 0).toLocaleString()}</td>
                    <td className="py-4 text-gray-600 font-medium">{product.days || 0}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. Green Invest Plan A"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewProduct({...newProduct, type: "normal"})}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      newProduct.type === "normal"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProduct({...newProduct, type: "vip"})}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      newProduct.type === "vip"
                        ? "bg-amber-500/10 border-amber-500 text-amber-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    VIP
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://example.com/image.png"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deposit (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newProduct.deposit}
                    onChange={(e) => setNewProduct({...newProduct, deposit: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Daily Income (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newProduct.daily}
                    onChange={(e) => setNewProduct({...newProduct, daily: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Total Income (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newProduct.total}
                    onChange={(e) => setNewProduct({...newProduct, total: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Days)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newProduct.days}
                    onChange={(e) => setNewProduct({...newProduct, days: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="30"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. Green Invest Plan A"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({...editingProduct, type: "normal"})}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      editingProduct.type === "normal"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({...editingProduct, type: "vip"})}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      editingProduct.type === "vip"
                        ? "bg-amber-500/10 border-amber-500 text-amber-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    VIP
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://example.com/image.png"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deposit (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editingProduct.deposit}
                    onChange={(e) => setEditingProduct({...editingProduct, deposit: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Daily Income (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editingProduct.daily}
                    onChange={(e) => setEditingProduct({...editingProduct, daily: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Total Income (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editingProduct.total}
                    onChange={(e) => setEditingProduct({...editingProduct, total: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Days)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={editingProduct.days}
                    onChange={(e) => setEditingProduct({...editingProduct, days: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="30"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{productToDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
