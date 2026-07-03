import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Wallet, Download, HeadphonesIcon, Send, ShoppingCart, Star, Megaphone } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { initFirebase } from "../lib/firebase";
import { useSettings } from "../lib/SettingsContext";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
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

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!settings.banners || settings.banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % settings.banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [settings.banners]);

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Banner Area */}
      <div className="h-48 relative overflow-hidden">
        {settings.banners && settings.banners.length > 0 ? (
          <div className="absolute inset-0 bg-gray-900">
            {settings.banners.map((url, index) => (
              <motion.div
                key={url + index}
                initial={{ opacity: 0 }}
                animate={{ opacity: currentBanner === index ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img
                  src={url}
                  alt={`Banner ${index + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-primary-dark">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
        )}

        {/* Brand/Logo overlay */}
        <div className="absolute top-8 left-6 z-10 text-white">
          <h1 className="text-3xl font-extrabold italic tracking-tighter drop-shadow-md uppercase leading-none">
            {settings.websiteName ? settings.websiteName.split(" ")[0] : "GREEN"}
          </h1>
          <p className="text-[10px] tracking-widest font-semibold text-green-200 mt-1 uppercase drop-shadow">
            Growing Together
          </p>
          <h2 className="text-2xl font-bold text-primary-light mt-0.5 drop-shadow-sm uppercase leading-none">
            {settings.websiteName && settings.websiteName.split(" ").length > 1
              ? settings.websiteName.split(" ").slice(1).join(" ")
              : settings.websiteName ? "" : "INVEST"}
          </h2>
        </div>

        {/* Indicators */}
        {settings.banners && settings.banners.length > 1 && (
          <div className="absolute bottom-12 right-6 z-10 flex space-x-1.5">
            {settings.banners.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentBanner === index ? "bg-primary w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-primary rounded-3xl p-5 shadow-lg flex justify-between items-center border border-white/10">
          <Link to="/recharge" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
              <Wallet className="text-primary w-6 h-6" />
            </div>
            <span className="text-xs text-white font-medium">Recharge</span>
          </Link>
          <Link to="/withdraw" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
              <Download className="text-primary w-6 h-6" />
            </div>
            <span className="text-xs text-white font-medium">Withdraw</span>
          </Link>
          <a href={settings.whatsappLink} target="_blank" rel="noreferrer" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
              <HeadphonesIcon className="text-primary w-6 h-6" />
            </div>
            <span className="text-xs text-white font-medium">Service</span>
          </a>
          <a href={settings.telegramLink} target="_blank" rel="noreferrer" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
              <Send className="text-primary w-6 h-6" />
            </div>
            <span className="text-xs text-white font-medium">Channel</span>
          </a>
        </div>
      </div>

      {/* Announcement */}
      {settings.announcementText && (
        <div className="px-4 mt-6">
          <div className="bg-white rounded-2xl p-3 flex items-center border border-gray-100 shadow-sm">
            <Megaphone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-sm text-gray-700 font-medium whitespace-nowrap animate-[marquee_15s_linear_infinite]">
                {settings.announcementText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-3">
        <button className="flex-1 bg-primary text-white py-3 rounded-2xl font-semibold flex items-center justify-center shadow-md shadow-primary/20">
          <Star className="w-4 h-4 mr-2" /> Normal
        </button>
        <button className="flex-1 bg-white text-text-gray py-3 rounded-2xl font-semibold flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50">
          <Star className="w-4 h-4 mr-2 text-gray-400" /> VIP
        </button>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-4 pb-6">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-gray-500 font-medium">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500 font-medium">No products available</div>
        ) : (
          products.map((product, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={product.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
            >
              {/* Product Image Area */}
              <div 
                className="h-28 relative p-3 flex items-end bg-gradient-to-r from-emerald-600 to-teal-500 bg-cover bg-center"
                style={product.image ? { backgroundImage: `url(${product.image})` } : {}}
              >
                <div className="absolute top-2 right-2 bg-green-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
                  Limit {product.limit || 10}
                </div>
                <h3 className="text-white font-bold text-sm leading-tight text-shadow-sm w-full bg-black/30 p-1 rounded backdrop-blur-sm">{product.name}</h3>
              </div>
              
              {/* Product Details */}
              <div className="p-3 space-y-2 flex-1">
                <div className="flex justify-between items-center text-[10px] text-text-gray">
                  <span>Return Time</span>
                  <span className="font-bold text-text-main">{product.days} Days</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-gray">
                  <span>Deposit</span>
                  <span className="font-bold text-text-main">₹{(product.deposit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-gray">
                  <span>Est. Daily</span>
                  <span className="font-bold text-primary">₹{(product.daily || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-text-gray">
                  <span>Est. Total</span>
                  <span className="font-bold text-primary">₹{(product.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Buy Button */}
              <div className="p-3 pt-0 mt-auto">
                <button className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center">
                  <ShoppingCart className="w-3 h-3 mr-1" /> Buy Now
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
