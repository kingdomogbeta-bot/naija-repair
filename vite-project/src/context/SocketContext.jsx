import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (user && userId) {
      console.log('🔌 Connecting socket for user:', userId, 'role:', user.role);
      
      // Prevent multiple connections
      if (socket) {
        socket.close();
      }

      const newSocket = io('https://naija-repair-api.onrender.com', {
        query: { userId: userId },
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected for user:', userId, 'role:', user.role);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected for user:', userId);
      });

      // Add booking event listeners for debugging
      newSocket.on('new_booking', (booking) => {
        console.log('📨 Received new_booking event:', booking);
      });

      newSocket.on('booking_updated', (booking) => {
        console.log('📨 Received booking_updated event:', booking);
      });

      setSocket(newSocket);

      return () => {
        console.log('🧹 Cleaning up socket connection for user:', userId);
        newSocket.close();
        setSocket(null);
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        console.log('🧹 Cleaning up socket - no user');
        socket.close();
        setSocket(null);
      }
    }
  }, [user?._id, user?.id, user?.role]); // Depend on both _id and id

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
