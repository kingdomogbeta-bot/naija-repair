import { useState } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { MessageCircle, User, X, Trash2, Flag, AlertTriangle } from 'lucide-react';

export default function AdminMessages() {
  const { messages, deleteConversation } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const nonSupportMessages = messages.filter(m => 
    m.to !== 'support@naija-repair.com' && m.from !== 'support@naija-repair.com'
  );

  const conversations = {};
  nonSupportMessages.forEach(msg => {
    const key = [msg.from, msg.to].sort().join('-');
    if (!conversations[key]) {
      conversations[key] = {
        participants: [msg.from, msg.to],
        messages: [],
        lastMessage: msg
      };
    }
    conversations[key].messages.push(msg);
    if (new Date(msg.timestamp) > new Date(conversations[key].lastMessage.timestamp)) {
      conversations[key].lastMessage = msg;
    }
  });

  const conversationList = Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
  );

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        <div className={`lg:col-span-1 border-r border-gray-200 overflow-y-auto bg-gray-50 ${
          showMobileChat ? 'hidden lg:block' : 'block'
        }`}>
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-cyan-600">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              All Conversations
            </h3>
            <p className="text-teal-100 text-sm mt-1">{conversationList.length} active chats</p>
          </div>
          {conversationList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No conversations yet</p>
              <p className="text-gray-400 text-sm mt-1">Messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversationList.map((conv, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 hover:bg-white text-left transition-all ${
                    selectedConversation === conv ? 'bg-white shadow-sm border-l-4 border-l-teal-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-md">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {conv.participants[0].split('@')[0]}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700 text-xs truncate mb-1">
                        ↔ {conv.participants[1].split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                          {conv.messages.length} messages
                        </span>
                      </div>
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
          {!selectedConversation ? (
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
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="lg:hidden text-white hover:text-teal-100"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{selectedConversation.participants[0].split('@')[0]}</p>
                  <p className="font-semibold text-teal-100 text-xs truncate">↔ {selectedConversation.participants[1].split('@')[0]}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                {selectedConversation.messages.map((msg, idx) => {
                  const isFromFirst = msg.from === selectedConversation.participants[0];
                  return (
                    <div key={idx} className={`flex gap-3 ${isFromFirst ? '' : 'flex-row-reverse'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md ${
                        isFromFirst ? 'bg-gradient-to-br from-teal-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {msg.from[0].toUpperCase()}
                      </div>
                      <div className={`flex-1 min-w-0 max-w-[75%] ${isFromFirst ? '' : 'flex flex-col items-end'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs text-gray-700 truncate">{msg.from.split('@')[0]}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className={`rounded-2xl p-3 shadow-sm ${
                          isFromFirst 
                            ? 'bg-white border border-gray-200' 
                            : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                        }`}>
                          <p className={`text-sm break-words ${isFromFirst ? 'text-gray-900' : 'text-white'}`}>{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t bg-white shadow-lg">
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 text-sm font-semibold border border-yellow-200 transition-all">
                    <Flag className="w-4 h-4" />
                    Flag Conversation
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 text-sm font-semibold border border-orange-200 transition-all">
                    <AlertTriangle className="w-4 h-4" />
                    Send Warning
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this entire conversation? This cannot be undone.')) {
                        deleteConversation(selectedConversation.participants[0], selectedConversation.participants[1]);
                        handleBack();
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-semibold shadow-md transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
