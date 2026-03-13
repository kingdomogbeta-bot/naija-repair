import { createContext, useContext, useState, useEffect } from 'react';
import { getAllSettings, updateSetting } from '../services/api';

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
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getAllSettings();
      if (response.success && response.data) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (key, value) => {
    try {
      const token = localStorage.getItem('naija_token');
      await updateSetting(token, key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
