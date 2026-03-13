import { useState, useEffect, useRef } from 'react';
import { getAllSupportTickets, adminReplyToSupportTicket, updateSupportTicketStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageCircle, User, X, Send, Clock, AlertCircle, CheckCircle, Filter } from 'lucide-react';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const filters = filter !== 'all' ? { status: filter } : {};
      const response = await getAllSupportTickets(token, filters);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const token = getToken();
      await adminReplyToSupportTicket(token, selectedTicket.ticketId, replyMessage);
      setReplyMessage('');
      await fetchTickets();
      
      // Update selected ticket
      const updatedTicket = tickets.find(t => t.ticketId === selectedTicket.ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Failed to reply:', error);
      alert('Failed to send reply');
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      const token = getToken();
      await updateSupportTicketStatus(token, ticketId, { status });
      await fetchTickets();
      
      if (selectedTicket && selectedTicket.ticketId === ticketId) {
        const updatedTicket = tickets.find(t => t.ticketId === ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-blue-100 text-blue-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-teal-600" />
            Support Tickets
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'open').length}</div>
            <div className="text-green-700">Open</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{tickets.filter(t => t.status === 'in-progress').length}</div>
            <div className="text-yellow-700">In Progress</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'resolved').length}</div>
            <div className="text-blue-700">Resolved</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">{tickets.length}</div>
            <div className="text-gray-700">Total</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 h-96">
        {/* Tickets List */}
        <div className="lg:col-span-1 border-r border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No support tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTicket?.ticketId === ticket.ticketId ? 'bg-teal-50 border-r-4 border-r-teal-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">#{ticket.ticketId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.userName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {ticket.messages[ticket.messages.length - 1]?.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Ticket: #{selectedTicket.ticketId}</span>
                  <span>User: {selectedTicket.userName}</span>
                  <span>Category: {selectedTicket.category}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusUpdate(selectedTicket.ticketId, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority} priority
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedTicket.messages.map((msg, idx) => {
                  const isUser = msg.senderRole === 'user' || msg.senderRole === 'tasker';
                  const isAI = msg.senderId === 'ai-assistant';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        isUser 
                          ? 'bg-teal-600 text-white' 
                          : isAI 
                            ? 'bg-blue-50 text-gray-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-900'
                      }`}>
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold">
                              {isAI ? '🤖 AI Assistant' : '👨‍💼 ' + msg.senderName}
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
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim()}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Support Ticket</h3>
                <p className="text-gray-500">Choose a ticket from the list to view details and respond</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
