import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useTaskers } from '../context/TaskersContext';
import { useLocation, useNavigate } from 'react-router-dom';
import EnhancedMessageInput from './EnhancedMessageInput';
import { MessageCircle, User, ArrowLeft, MoreVertical, ExternalLink, Flag, Trash2 } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserConversations, getConversation, sendMessage, markConversationAsRead, deleteConversation, currentConversation } = useMessages();
  const { taskers } = useTaskers();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [swipedConv, setSwipedConv] = useState(null);
  const [longPressConv, setLongPressConv] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const longPressTimer = useRef(null);

  const conversations = getUserConversations();
  const currentMessages = selectedConversation ? currentConversation : [];

  const currentTasker = taskers.find(t => t.email === selectedConversation?.email);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    await getConversation(conv.userId);
    await markConversationAsRead(conv.userId);
  };

  useEffect(() => {
    if (!location.state?.taskerEmail) return;

    const openConversation = () => {
      const existingConv = conversations.find(c =>
        c.userEmail === location.state.taskerEmail ||
        c.userId === location.state.taskerId ||
        c.userId === location.state.taskerEmail
      );
      if (existingConv) {
        handleSelectConversation(existingConv);
      } else {
        const newConversation = {
          userId: location.state.taskerId || location.state.taskerEmail,
          userEmail: location.state.taskerEmail,
          userName: location.state.taskerName || location.state.taskerEmail,
        };
        setSelectedConversation(newConversation);
        setShowMobileChat(true);
        if (location.state.taskerId) {
          getConversation(location.state.taskerId);
        }
      }
    };

    // If conversations already loaded, open immediately
    // Otherwise wait for them to load (conversations.length check)
    if (conversations.length > 0) {
      openConversation();
    } else {
      // Small delay to let conversations fetch complete
      const timer = setTimeout(openConversation, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.state?.taskerEmail, conversations.length]);

  useEffect(() => {
    if (selectedConversation && currentMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [currentMessages.length]);

  const handleSend = async (messageData) => {
    if (!selectedConversation) {
      console.error('No selected conversation');
      return;
    }

    console.log('Sending message to:', selectedConversation);
    console.log('Message data:', messageData);

    try {
      const messagePayload = {
        receiverId: selectedConversation.userId,
        receiverEmail: selectedConversation.userEmail,
        receiverName: selectedConversation.userName,
        message: messageData.content || messageData.message || messageData
      };
      console.log('Final message payload:', messagePayload);
      
      await sendMessage(messagePayload);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    const reports = JSON.parse(localStorage.getItem('naija_reports') || '[]');
    reports.push({
      id: Date.now().toString(),
      reportedBy: user?.email,
      reportedUser: selectedConversation.email,
      reason: reportReason,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('naija_reports', JSON.stringify(reports));
    setReportModalOpen(false);
    setReportReason('');
    alert('Report submitted. Our team will review it shortly.');
  };

  const handleDeleteConversation = (convEmail) => {
    if (confirm('Delete this conversation?')) {
      if (selectedConversation?.userEmail === convEmail) {
        setSelectedConversation(null);
        setShowMobileChat(false);
      }
      setSwipedConv(null);
      setLongPressConv(null);
    }
  };

  const handleTouchStart = (conv, e) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressConv(conv.email);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-4 px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" style={{ height: 'calc(100vh - 11rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            <div className={`lg:col-span-1 border-r border-gray-200 overflow-y-auto bg-white ${
              showMobileChat ? 'hidden lg:block' : 'block'
            }`}>
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-cyan-600 sticky top-0 z-10">
                <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Chats
                </h2>
                <p className="text-teal-100 text-xs mt-1">{conversations.length} conversations</p>
              </div>
              {conversations.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start chatting with taskers</p>
                </div>
              ) : (
                <div>
                  {conversations.map(conv => {
                    const displayName = conv.userName;
                    const isLongPressed = longPressConv === conv.userEmail;
                    return (
                    <div
                      key={conv.email}
                      className="relative overflow-hidden"
                    >
                      <div
                        onClick={() => !isLongPressed && handleSelectConversation(conv)}
                        onTouchStart={(e) => handleTouchStart(conv, e)}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={(e) => handleTouchStart(conv, e)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all ${
                          selectedConversation?.userEmail === conv.userEmail ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-l-teal-600' : ''
                        } ${isLongPressed ? 'bg-red-50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{displayName}</p>
                                {conv.unreadCount > 0 && (
                                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0 ml-2 shadow-md">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(conv.lastMessageTime).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          {isLongPressed && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.userEmail); }}
                              className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`lg:col-span-2 flex flex-col ${
              showMobileChat ? 'block' : 'hidden lg:flex'
            }`}>
              {selectedConversation ? (
                <>
                  <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center gap-2 sm:gap-3 sticky top-0 z-10">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="lg:hidden text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                        {selectedConversation.userName}
                      </h3>
                    </div>
                    {user?.role !== 'tasker' && currentTasker && (
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                            <button
                              onClick={() => { navigate(`/tasker/${currentTasker.id}`); setShowMenu(false); }}
                              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors w-full text-left text-xs sm:text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>View Profile</span>
                            </button>
                            <button
                              onClick={() => { setReportModalOpen(true); setShowMenu(false); }}
                              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full text-left text-xs sm:text-sm font-medium"
                            >
                              <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Report User</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-gray-50 via-white to-gray-50" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                    {currentMessages.map(msg => {
                      const isMe = msg.senderId === user?.id || msg.senderId === user?._id || msg.senderEmail === user?.email;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-md rounded-2xl shadow-md ${
                              isMe
                                ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {msg.images && msg.images.length > 0 && (
                              <div className="p-2">
                                <div className={`grid gap-2 ${
                                  msg.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                                }`}>
                                  {msg.images.map((img, i) => (
                                    <img key={i} src={img} alt="Shared" className="rounded-xl w-full h-28 sm:h-32 object-cover" />
                                  ))}
                                </div>
                              </div>
                            )}
                            {(msg.message || msg.content) && (
                              <div className="px-3 sm:px-4 py-2">
                                <p className="text-xs sm:text-sm break-words leading-relaxed">{msg.message || msg.content}</p>
                              </div>
                            )}
                            <p className={`px-3 sm:px-4 pb-2 text-xs ${
                              isMe ? 'text-teal-100' : 'text-gray-500'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { 
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

                  <EnhancedMessageInput onSend={handleSend} />
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold text-sm sm:text-base">Select a conversation</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Choose a chat to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report User</h3>
            <p className="text-sm text-gray-600 mb-4">Please describe why you're reporting this user. Our team will review your report.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows="4"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setReportModalOpen(false); setReportReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
