import { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { getAllMessagesAdmin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminMessages() {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllMessagesAdmin(getToken());
        setConversations(res.data || []);
      } catch (e) {
        console.error('Failed to load messages:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedConv = conversations.find(c => c.conversationId === selected);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Messages</h2>
        <p className="text-gray-600">All conversations between users and taskers</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading messages...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Conversation list */}
          <div className="lg:w-1/3 space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.conversationId}
                onClick={() => setSelected(conv.conversationId)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected === conv.conversationId
                    ? 'bg-teal-50 border-teal-400'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {conv.participants[0]?.name} &amp; {conv.participants[1]?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(conv.lastMessageTime).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {conv.participants.map(p => (
                    <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                      {p.email}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Message thread */}
          <div className="lg:flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-[400px]">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">
                    {selectedConv.participants[0]?.name} &amp; {selectedConv.participants[1]?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedConv.participants.map(p => p.email).join(' · ')}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
                  {selectedConv.messages.map(msg => (
                    <div key={msg._id} className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-teal-700">{msg.senderName}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 mt-1 w-fit max-w-[80%]">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
