import { createContext, useContext, useState, useEffect } from 'react';
import { sendMessage as apiSendMessage, getConversation as apiGetConversation, getAllConversations as apiGetAllConversations, markMessagesAsRead as apiMarkAsRead } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken, user } = useAuth();
  const { socket } = useSocket();

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = getToken();
      const response = await apiGetAllConversations(token);
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      setCurrentConversation(prev => [...prev, message]);
      fetchConversations();
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket]);

  const sendMessage = async (messageData) => {
    try {
      console.log('Sending message with data:', messageData);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await apiSendMessage(token, messageData);
      console.log('Message send response:', response);
      if (response.success) {
        setCurrentConversation(prev => [...prev, response.data]);
        await fetchConversations();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const getConversation = async (userId) => {
    try {
      const token = getToken();
      const response = await apiGetConversation(token, userId);
      if (response.success) {
        setCurrentConversation(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      return [];
    }
  };

  const markConversationAsRead = async (userId) => {
    try {
      const token = getToken();
      await apiMarkAsRead(token, userId);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getUnreadCount = () => {
    return conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  };

  const getUserConversations = () => {
    return conversations;
  };

  return (
    <MessagesContext.Provider value={{
      conversations,
      currentConversation,
      loading,
      sendMessage,
      getConversation,
      markConversationAsRead,
      getUnreadCount,
      getUserConversations,
      refreshConversations: fetchConversations
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return ctx;
}
