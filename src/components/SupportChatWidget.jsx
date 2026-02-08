import { useState, useEffect, useRef } from "react";
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';

function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const { user } = useAuth();
  const { messages, sendMessage, getUnreadCount, markConversationAsRead } = useMessages();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      const supportMsgs = messages.filter(m => 
        (m.from === user.email && m.to === 'support@naija-repair.com') ||
        (m.to === user.email && m.from === 'support@naija-repair.com')
      );
      setChatMessages(supportMsgs);
    }
  }, [messages, user]);

  useEffect(() => {
    if (open && user) {
      markConversationAsRead(user.email, 'support@naija-repair.com');
    }
  }, [open, user, markConversationAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('how') && (msg.includes('book') || msg.includes('hire'))) {
      return "Hi! 👋 To book a tasker: 1) Browse our Services page, 2) Select a tasker, 3) Click 'Book Now', 4) Fill in your details. Need help with a specific step?";
    }
    if (msg.includes('payment') || msg.includes('pay')) {
      return "We accept card payments and bank transfers. Payment is processed securely after booking confirmation. Is there a specific payment issue I can help with?";
    }
    if (msg.includes('cancel')) {
      return "You can cancel bookings from 'My Bookings' page. Cancellations made 24hrs+ before the scheduled time get full refunds. Need help canceling?";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('charge')) {
      return "Prices vary by service and tasker. Each tasker sets their hourly rate shown on their profile. You'll see the total cost before confirming your booking. Looking for a specific service?";
    }
    if (msg.includes('refund')) {
      return "Refunds are processed within 5-7 business days. Full refunds for cancellations 24hrs+ before booking. Have a specific refund request?";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! 👋 I'm the NAIJA-REPAIR AI assistant. How can I help you today?";
    }
    
    return "Thanks for reaching out! 🤖 I'm an AI assistant and this seems like a question that needs human attention. Our support team has been notified and will respond shortly. Is there anything else I can help with in the meantime?";
  };

  const handleSend = () => {
    if (!message.trim() || !user) return;

    sendMessage({
      from: user.email,
      to: 'support@naija-repair.com',
      content: message
    });

    setTimeout(() => {
      const aiResponse = getAIResponse(message);
      sendMessage({
        from: 'support@naija-repair.com',
        to: user.email,
        content: aiResponse,
        isAI: true
      });
    }, 1000);

    setMessage('');
  };

  const unreadCount = user ? getUnreadCount(user.email) : 0;
  const supportUnread = messages.filter(m => 
    m.to === user?.email && m.from === 'support@naija-repair.com' && !m.read
  ).length;
  return (
    <div className="fixed bottom-6 right-6 z-[99999]">
      <button
        className="bg-teal-600 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-3xl hover:bg-teal-700 transition-all hover:scale-110 focus:outline-none relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open support chat"
      >
        <span>💬</span>
        {supportUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {supportUnread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-2xl border border-teal-200 flex flex-col animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100 bg-teal-600 rounded-t-xl">
            <span className="text-white font-semibold">Customer Support</span>
            <button className="text-white text-lg" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '400px' }}>
            {!user ? (
              <p className="text-gray-600 text-sm">Please log in to chat with support.</p>
            ) : chatMessages.length === 0 ? (
              <p className="text-gray-600 text-sm">Hello! How can we help you today?</p>
            ) : (
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.from === user.email;
                  const isAI = msg.isAI;
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${isUser ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-900'} ${isAI ? 'border-2 border-teal-300' : ''}`}>
                        {!isUser && isAI && <div className="text-xs font-bold mb-1">🤖 AI Assistant</div>}
                        {!isUser && !isAI && <div className="text-xs font-bold mb-1">Support Team</div>}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="px-4 py-2 border-t border-teal-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Type your message..."
                disabled={!user}
              />
              <button
                onClick={handleSend}
                disabled={!user || !message.trim()}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportChatWidget;
