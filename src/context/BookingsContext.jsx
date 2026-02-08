import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'naija_bookings';
const BookingsContext = createContext();

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse bookings from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to persist bookings', e);
    }
  }, [bookings]);

  const addBooking = (booking) => {
    setBookings((prev) => [...prev, booking]);
  };

  const updateBookingStatus = (id, status) => {
    setBookings((prev) => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const assignBooking = (id, taskerEmail) => {
    setBookings((prev) => prev.map(b => b.id === id ? { ...b, assignedTo: taskerEmail, status: 'assigned' } : b));
  };

  const unassignBooking = (id) => {
    setBookings((prev) => prev.map(b => b.id === id ? { ...b, assignedTo: null, status: 'upcoming' } : b));
  };

  const updateBooking = (id, data) => {
    setBookings((prev) => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, updateBookingStatus, assignBooking, unassignBooking, updateBooking }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (ctx === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return ctx;
}