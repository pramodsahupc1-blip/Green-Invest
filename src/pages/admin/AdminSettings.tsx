import React, { useState, useEffect } from "react";
import { Settings, Save, Globe, MessageCircle } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { initFirebase } from "../../lib/firebase";
import { useSettings, AppSettings } from "../../lib/SettingsContext";

export default function AdminSettings() {
  const { settings: currentSettings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [bannersText, setBannersText] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(currentSettings);
    if (currentSettings.banners) {
      setBannersText(currentSettings.banners.join("\n"));
    }
  }, [currentSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { db } = await initFirebase();
      const finalBanners = bannersText
        .split("\n")
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const finalData = {
        ...formData,
        banners: finalBanners
      };

      await setDoc(doc(db, "settings", "global"), finalData);
      await refreshSettings();
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure global application settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Config */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            General Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Withdrawal Amount (₹)</label>
              <input 
                type="number" 
                name="minWithdrawal"
                value={formData.minWithdrawal}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Withdrawal Fee (%)</label>
              <input 
                type="number" 
                name="withdrawalFee"
                value={formData.withdrawalFee}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Referral Bonus (₹)</label>
              <input 
                type="number" 
                name="referralBonus"
                value={formData.referralBonus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Company UPI ID</label>
              <input 
                type="text" 
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="enableWithdrawals" checked={formData.enableWithdrawals} onChange={handleChange} className="sr-only" />
                  <div className="block bg-gray-200 w-10 h-6 rounded-full transition-colors"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${formData.enableWithdrawals ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 font-bold text-sm">
                  Enable Withdrawals
                </div>
              </label>
            </div>
            
            <div className="pt-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="enableRegistrations" checked={formData.enableRegistrations} onChange={handleChange} className="sr-only" />
                  <div className="block bg-gray-200 w-10 h-6 rounded-full transition-colors"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${formData.enableRegistrations ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 font-bold text-sm">
                  Enable New Registrations
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Website Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            Website Content
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Website Name</label>
              <input 
                type="text" 
                name="websiteName"
                value={formData.websiteName || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Green Invest"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Website Banner Image URLs (One URL per line)</label>
              <textarea 
                value={bannersText}
                onChange={(e) => setBannersText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-xs"
                placeholder="https://example.com/banner1.png&#10;https://example.com/banner2.png"
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">Provide direct image URLs of the banners to cycle on the homepage.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Announcement Text</label>
              <textarea 
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Telegram Link</label>
              <input 
                type="url" 
                name="telegramLink"
                value={formData.telegramLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Link</label>
              <input 
                type="url" 
                name="whatsappLink"
                value={formData.whatsappLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">App Download Link</label>
              <input 
                type="url" 
                name="appDownloadLink"
                value={formData.appDownloadLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input:checked ~ .block {
          background-color: #10b981;
        }
      `}</style>
    </div>
  );
}
