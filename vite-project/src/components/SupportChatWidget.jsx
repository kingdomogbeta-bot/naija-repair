import { useState, useEffect, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import { createSupportTicket, getUserSupportTickets, addMessageToSupportTicket } from '../services/api';
import { useSocket } from '../context/SocketContext';

function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, getToken } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && open) {
      fetchUserTickets();
    }
  }, [user, open]);

  useEffect(() => {
    if (socket) {
      socket.on('support_message', (data) => {
        if (currentTicket && data.ticketId === currentTicket.ticketId) {
          fetchUserTickets();
        }
      });

      return () => {
        socket.off('support_message');
      };
    }
  }, [socket, currentTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTicket?.messages]);

  const fetchUserTickets = async () => {
    try {
      const token = getToken();
      const response = await getUserSupportTickets(token);
      setTickets(response.data);
      
      // Set current ticket to the most recent open one
      const openTicket = response.data.find(t => t.status === 'open' || t.status === 'in-progress');
      if (openTicket) {
        setCurrentTicket(openTicket);
      }
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user || loading) return;

    setLoading(true);
    try {
      const token = getToken();
      
      if (currentTicket) {
        // Add message to existing ticket
        await addMessageToSupportTicket(token, currentTicket.ticketId, message);
      } else {
        // Create new support ticket
        await createSupportTicket(token, {
          subject: 'General Support Inquiry',
          message,
          category: 'general',
          priority: 'medium'
        });
      }
      
      setMessage('');
      await fetchUserTickets();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = () => {
    return tickets.reduce((count, ticket) => {
      const unreadMessages = ticket.messages.filter(msg => 
        msg.senderRole !== 'user' && msg.senderRole !== 'tasker' && !msg.read
      );
      return count + unreadMessages.length;
    }, 0);
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="fixed bottom-6 right-6 z-[99999]">
      <button
        className="bg-teal-600 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-3xl hover:bg-teal-700 transition-all hover:scale-110 focus:outline-none relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open support chat"
      >
        <span>💬</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl border border-teal-200 flex flex-col animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl">
            <div>
              <span className="text-white font-semibold">Naija-Repair Support</span>
              {currentTicket && (
                <p className="text-teal-100 text-xs">Ticket: {currentTicket.ticketId}</p>
              )}
            </div>
            <button className="text-white text-lg hover:bg-white/20 rounded p-1" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '400px' }}>
            {!user ? (
              <div className="text-center py-8">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-2">Authentication Required</p>
                <p className="text-gray-500 text-xs">Please log in to chat with our support team</p>
              </div>
            ) : !currentTicket ? (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Welcome to Support!</h3>
                <p className="text-gray-600 text-sm mb-4">Hi {user.name}! How can we help you today?</p>
                <div className="bg-teal-50 rounded-lg p-3 text-left">
                  <p className="text-xs text-teal-700 font-medium mb-2">💡 Quick Help Topics:</p>
                  <ul className="text-xs text-teal-600 space-y-1">
                    <li>• Booking & scheduling</li>
                    <li>• Payment & billing</li>
                    <li>• Account issues</li>
                    <li>• Service quality</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTicket.messages.map((msg, idx) => {
                  const isUser = msg.senderRole === 'user' || msg.senderRole === 'tasker';
                  const isAI = msg.senderId === 'ai-assistant';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg p-3 ${
                        isUser 
                          ? 'bg-teal-600 text-white' 
                          : isAI 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold">
                              {isAI ? '🤖 AI Assistant' : '👨‍💼 Support Team'}
                            </span>
                            {msg.senderRole === 'admin' && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Staff</span>
                            )}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-2 ${
                          isUser ? 'text-teal-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-teal-100 bg-gray-50 rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={user ? "Type your message..." : "Please log in first"}
                disabled={!user || loading}
              />
              <button
                onClick={handleSend}
                disabled={!user || !message.trim() || loading}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
            {currentTicket && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Status: <span className={`font-medium ${
                  currentTicket.status === 'open' ? 'text-green-600' :
                  currentTicket.status === 'in-progress' ? 'text-yellow-600' :
                  currentTicket.status === 'resolved' ? 'text-blue-600' : 'text-gray-600'
                }`}>{currentTicket.status}</span></span>
                <span>Priority: {currentTicket.priority}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportChatWidget;