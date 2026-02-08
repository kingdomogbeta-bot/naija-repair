import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'naija_user';
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

  const login = ({ name, email, phone, role }) => {
    setUser({ name, email, phone, role });
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  const updateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
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
    <AuthContext.Provider value={{ user, login, logout, updateProfile, addBooking, updateBookingStatus }}>
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
