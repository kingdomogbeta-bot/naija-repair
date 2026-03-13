import { createContext, useContext, useEffect, useState } from 'react';
import { getUserBookings, createBooking as apiCreateBooking, completeBooking as apiCompleteBooking, cancelBooking as apiCancelBooking, deleteBooking as apiDeleteBooking, acceptBooking as apiAcceptBooking } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const BookingsContext = createContext();

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken, user } = useAuth();
  const { socket } = useSocket();

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = getToken();
      
      console.log('🔄 Fetching bookings for user:', user.role, user.email);
      
      // Admin users get all bookings
      if (user.role === 'admin') {
        const response = await fetch('http://localhost:5000/api/bookings/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data.success ? data.data : []);
          console.log('📊 Admin loaded', data.data?.length || 0, 'bookings');
        }
      } 
      // Taskers get their assigned bookings + all pending bookings
      else if (user.role === 'tasker') {
        const response = await fetch('http://localhost:5000/api/bookings/tasker', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data.success ? data.data : []);
          console.log('📊 Tasker loaded', data.data?.length || 0, 'bookings');
          console.log('📋 Booking statuses:', data.data?.map(b => ({ id: b._id, status: b.status, service: b.service })));
        } else {
          console.error('❌ Failed to fetch tasker bookings:', response.status);
        }
      }
      // Regular users get their own bookings
      else {
        const response = await getUserBookings(token);
        if (response.success) {
          setBookings(response.data);
          console.log('📊 User loaded', response.data?.length || 0, 'bookings');
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_booking', (booking) => {
      console.log('New booking received:', booking);
      fetchBookings(); // Refresh all bookings
    });

    socket.on('booking_updated', (booking) => {
      console.log('Booking updated:', booking);
      fetchBookings(); // Refresh all bookings
    });

    socket.on('booking_created', (booking) => {
      console.log('Booking created:', booking);
      fetchBookings(); // Refresh all bookings
    });

    return () => {
      socket.off('new_booking');
      socket.off('booking_updated');
      socket.off('booking_created');
    };
  }, [socket]);

  const addBooking = async (bookingData) => {
    try {
      const token = getToken();
      const response = await apiCreateBooking(token, bookingData);
      if (response.success) {
        setBookings((prev) => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const token = getToken();
      const endpoint = `http://localhost:5000/api/bookings/${id}/${status}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setBookings((prev) => prev.map(b => b._id === id ? { ...b, status } : b));
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw error;
    }
  };

  const assignBooking = async (id, taskerEmail) => {
    try {
      const token = getToken();
      console.log('🎯 Accepting booking:', id, 'for tasker:', taskerEmail);
      const response = await apiAcceptBooking(token, id);
      if (response.success) {
        console.log('✅ Booking accepted successfully');
        await fetchBookings(); // Refresh bookings
      }
    } catch (error) {
      console.error('❌ Failed to accept booking:', error);
      alert('Failed to accept booking: ' + error.message);
    }
  };

  const unassignBooking = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/unassign`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setBookings((prev) => prev.map(b => b._id === id ? { ...b, assignedTo: null, status: 'pending' } : b));
      }
    } catch (error) {
      console.error('Failed to unassign booking:', error);
      throw error;
    }
  };

  const updateBooking = async (id, data) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setBookings((prev) => prev.map(b => b._id === id ? { ...b, ...data } : b));
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      throw error;
    }
  };

  const completeBooking = async (id) => {
    try {
      const token = getToken();
      const response = await apiCompleteBooking(token, id);
      if (response.success) {
        setBookings((prev) => prev.map(b => b._id === id ? response.data : b));
      }
    } catch (error) {
      console.error('Failed to complete booking:', error);
      throw error;
    }
  };

  const cancelBooking = async (id, reason) => {
    try {
      const token = getToken();
      const response = await apiCancelBooking(token, id, reason);
      if (response.success) {
        setBookings((prev) => prev.map(b => b._id === id ? response.data : b));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw error;
    }
  };

  const loadBookings = async () => {
    await fetchBookings();
  };

  const loadAllBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/bookings/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch all bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const token = getToken();
      const response = await apiDeleteBooking(token, id);
      if (response.success) {
        setBookings((prev) => prev.filter(b => b._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
      throw error;
    }
  };

  return (
    <BookingsContext.Provider value={{ 
      bookings, 
      loading,
      addBooking, 
      updateBookingStatus, 
      assignBooking, 
      unassignBooking, 
      updateBooking, 
      completeBooking,
      cancelBooking,
      deleteBooking,
      loadBookings,
      loadAllBookings,
      refreshBookings: fetchBookings
    }}>
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