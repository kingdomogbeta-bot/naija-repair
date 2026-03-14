import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'naija_user';
const TOKEN_KEY = 'naija_token';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to persist user to localStorage', e);
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    if (userData.token) localStorage.setItem(TOKEN_KEY, userData.token);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const updateProfile = async (data) => {
    try {
      const token = getToken();
      if (token && user) {
        const endpoint = user.role === 'tasker' 
          ? 'https://naija-repair-api.onrender.com/api/taskers/profile'
          : 'https://naija-repair-api.onrender.com/api/users/profile';
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update profile');
        }
      }
      setUser((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const updatePhoto = (photoUrl) => {
    setUser((prev) => ({ ...prev, photoUrl }));
  };

  const deletePhoto = () => {
    setUser((prev) => {
      const { photoUrl, ...rest } = prev;
      return rest;
    });
  };

  const addBooking = (booking) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, bookings: [...(prev.bookings || []), booking] };
      return next;
    });
  };

  const updateBookingStatus = (id, status) => {
    setUser((prev) => {
      if (!prev) return prev;
      const bookings = (prev.bookings || []).map(b => b.id === id ? { ...b, status } : b);
      return { ...prev, bookings };
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, updatePhoto, deletePhoto, addBooking, updateBookingStatus, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
