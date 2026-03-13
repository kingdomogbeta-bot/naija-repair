import { createContext, useContext, useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead as apiMarkAsRead, markAllNotificationsAsRead as apiMarkAllAsRead, deleteNotification as apiDeleteNotification } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken, user } = useAuth();
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = getToken();
      const response = await getUserNotifications(token);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_booking', (booking) => {
      addNotification({
        _id: Date.now().toString(),
        type: 'booking',
        title: 'New Booking',
        message: `New booking for ${booking.service}`,
        read: false,
        createdAt: new Date()
      });
    });

    socket.on('booking_updated', (booking) => {
      addNotification({
        _id: Date.now().toString(),
        type: 'booking',
        title: 'Booking Updated',
        message: `Booking status changed to ${booking.status}`,
        read: false,
        createdAt: new Date()
      });
    });

    socket.on('new_message', (message) => {
      addNotification({
        _id: Date.now().toString(),
        type: 'message',
        title: 'New Message',
        message: `${message.senderName}: ${message.message.substring(0, 50)}`,
        read: false,
        createdAt: new Date()
      });
    });

    socket.on('new_review', (review) => {
      addNotification({
        _id: Date.now().toString(),
        type: 'review',
        title: 'New Review',
        message: `${review.userName} left a ${review.rating}-star review`,
        read: false,
        createdAt: new Date()
      });
    });

    return () => {
      socket.off('new_booking');
      socket.off('booking_updated');
      socket.off('new_message');
      socket.off('new_review');
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (id) => {
    try {
      const token = getToken();
      await apiMarkAsRead(token, id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = getToken();
      await apiMarkAllAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const deleteNotification = async (id) => {
    try {
      const token = getToken();
      await apiDeleteNotification(token, id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      loading,
      addNotification, 
      markAsRead, 
      markAllAsRead, 
      getUnreadCount, 
      deleteNotification,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
