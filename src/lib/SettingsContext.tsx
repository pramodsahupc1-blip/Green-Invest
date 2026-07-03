import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { initFirebase } from "./firebase";

export interface AppSettings {
  minWithdrawal: number;
  withdrawalFee: number;
  referralBonus: number;
  enableWithdrawals: boolean;
  enableRegistrations: boolean;
  upiId: string;
  telegramLink: string;
  whatsappLink: string;
  appDownloadLink: string;
  announcementText: string;
  websiteName: string;
  banners: string[];
}

const defaultSettings: AppSettings = {
  minWithdrawal: 100,
  withdrawalFee: 5,
  referralBonus: 50,
  enableWithdrawals: true,
  enableRegistrations: true,
  upiId: "jinwoosung.jg@oksbi",
  telegramLink: "https://t.me/example",
  whatsappLink: "https://wa.me/example",
  appDownloadLink: "#",
  announcementText: "Welcome to Green Invest!",
  websiteName: "Green Invest",
  banners: [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80"
  ]
};

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {}
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const { db } = await initFirebase();
      const settingsDoc = await getDoc(doc(db, "settings", "global"));
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() } as AppSettings);
      } else {
        // If it doesn't exist, use defaults
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
