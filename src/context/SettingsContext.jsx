import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const defaultSettings = {
  siteName: 'NAIJA-REPAIR',
  siteEmail: 'admin@naija-repair.com',
  commissionRate: 15,
  minBookingAmount: 5000,
  maxBookingAmount: 500000,
  autoApproveTaskers: false,
  requireIdVerification: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  maintenanceMode: false,
  allowNewRegistrations: true,
  maxTaskersPerService: 50,
  reviewModerationEnabled: true,
  minTaskerRating: 3.0,
  refundPeriodHours: 24,
  cancellationFeePercent: 10,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('admin_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
};
