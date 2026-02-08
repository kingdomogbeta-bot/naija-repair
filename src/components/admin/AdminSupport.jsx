import { useState, useEffect, useRef } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { MessageCircle, User, X, Send, Trash2 } from 'lucide-react';

export default function AdminSupport() {
  const { messages, sendMessage, markAsRead, deleteConversation } = useMessages();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  const supportMessages = messages.filter(m => 
    m.to === 'support@naija-repair.com' || m.from === 'support@naija-repair.com'
  );

  const conversations = {};
  supportMessages.forEach(msg => {
    const userEmail = msg.from === 'support@naija-repair.com' ? msg.to : msg.from;
    if (!conversations[userEmail]) {
      conversations[userEmail] = {
        userEmail,
        messages: [],
        unreadCount: 0,
        lastMessage: msg
      };
    }
    conversations[userEmail].messages.push(msg);
    if (!msg.read && msg.from !== 'support@naija-repair.com') {
      conversations[userEmail].unreadCount++;
    }
    if (new Date(msg.timestamp) > new Date(conversations[userEmail].lastMessage.timestamp)) {
      conversations[userEmail].lastMessage = msg;
    }
  });

  const conversationList = Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;

    sendMessage({
      from: 'support@naija-repair.com',
      to: selectedUser.userEmail,
      content: replyText,
      isSupport: true
    });

    setReplyText('');
    const updated = conversations[selectedUser.userEmail];
    setSelectedUser(updated);
  };

  const handleSelectUser = (conv) => {
    setSelectedUser(conv);
    setShowMobileChat(true);
    conv.messages.forEach(msg => {
      if (msg.from !== 'support@naija-repair.com' && !msg.read) {
        markAsRead(msg.id);
      }
    });
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        <div className={`lg:col-span-1 border-r border-gray-200 overflow-y-auto ${
          showMobileChat ? 'hidden lg:block' : 'block'
        }`}>
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              Support Tickets ({conversationList.length})
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {conversationList.filter(c => c.unreadCount > 0).length} unread
            </p>
          </div>
          {conversationList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No support messages yet</p>
            </div>
          ) : (
            <div>
              {conversationList.map((conv, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectUser(conv)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                    selectedUser?.userEmail === conv.userEmail ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                  } ${conv.unreadCount > 0 ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{conv.userEmail}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessage.timestamp).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`lg:col-span-2 flex flex-col ${
          showMobileChat ? 'block' : 'hidden lg:flex'
        }`}>
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{selectedUser.userEmail}</p>
                  <p className="text-xs text-gray-500">{selectedUser.messages.length} messages</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedUser.messages.map((msg, idx) => {
                  const isSupport = msg.from === 'support@naija-repair.com';
                  const isAI = msg.isAI;
                  
                  return (
                    <div key={idx} className={`flex gap-3 ${isSupport ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-md rounded-2xl shadow-sm ${
                        isSupport 
                          ? 'bg-teal-600 text-white' 
                          : 'bg-white text-gray-900 border border-gray-200'
                      } ${isAI ? 'border-2 border-teal-300' : ''}`}>
                        <div className="px-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-xs ${isSupport ? 'text-teal-100' : 'text-gray-600'}`}>
                              {isSupport ? (isAI ? '🤖 AI Assistant' : '🛠️ Support Team') : 'User'}
                            </span>
                          </div>
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                        <p className={`px-4 pb-2 text-xs ${isSupport ? 'text-teal-100' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendReply} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
                <button
                  onClick={() => {
                    if (confirm('Delete this conversation?')) {
                      deleteConversation('support@naija-repair.com', selectedUser.userEmail);
                      handleBack();
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Conversation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
