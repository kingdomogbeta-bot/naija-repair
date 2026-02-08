import { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

const STORAGE_KEY = 'naija_messages';

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save messages', e);
    }
  }, [messages]);

  const sendMessage = ({ from, to, content, images, taskerId, taskerName }) => {
    const newMessage = {
      id: Date.now().toString(),
      from,
      to,
      content,
      images,
      taskerId,
      taskerName,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, newMessage]);

    const registeredUsers = JSON.parse(localStorage.getItem('naija_registered_users') || '{}');
    const senderName = registeredUsers[from]?.name || from;

    const notifications = JSON.parse(localStorage.getItem('naija_notifications') || '[]');
    const notification = {
      id: Date.now().toString() + Math.random(),
      userId: to,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      link: `/messages?from=${from}`,
      timestamp: new Date().toISOString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(notification);
    localStorage.setItem('naija_notifications', JSON.stringify(notifications));

    return newMessage;
  };

  const markAsRead = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const markConversationAsRead = (userEmail, taskerEmail) => {
    setMessages(prev => prev.map(msg => 
      ((msg.from === userEmail && msg.to === taskerEmail) || 
       (msg.from === taskerEmail && msg.to === userEmail))
        ? { ...msg, read: true }
        : msg
    ));
  };

  const getConversation = (userEmail, taskerEmail) => {
    return messages.filter(msg => 
      (msg.from === userEmail && msg.to === taskerEmail) ||
      (msg.from === taskerEmail && msg.to === userEmail)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getUnreadCount = (userEmail) => {
    return messages.filter(msg => msg.to === userEmail && !msg.read).length;
  };

  const getUserConversations = (userEmail) => {
    const conversations = {};
    messages.forEach(msg => {
      const otherPerson = msg.from === userEmail ? msg.to : msg.from;
      if ((msg.from === userEmail || msg.to === userEmail) && 
          otherPerson !== 'support@naija-repair.com') {
        if (!conversations[otherPerson]) {
          conversations[otherPerson] = {
            email: otherPerson,
            name: msg.from === userEmail ? msg.to : msg.from,
            taskerName: msg.taskerName,
            lastMessage: msg,
            unreadCount: 0,
          };
        }
        conversations[otherPerson].lastMessage = msg;
        if (msg.to === userEmail && !msg.read) {
          conversations[otherPerson].unreadCount++;
        }
      }
    });
    return Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const deleteConversation = (email1, email2) => {
    setMessages(prev => prev.filter(msg => 
      !((msg.from === email1 && msg.to === email2) || 
        (msg.from === email2 && msg.to === email1))
    ));
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      sendMessage,
      markAsRead,
      markConversationAsRead,
      getConversation,
      getUnreadCount,
      getUserConversations,
      deleteMessage,
      deleteConversation,
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
