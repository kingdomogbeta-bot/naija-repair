import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Filter, Eye, User, MapPin, Clock, DollarSign, Phone, Mail } from 'lucide-react';

export default function AdminBookings() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('https://naija-repair-api.onrender.com/api/bookings/all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin bookings data:', data);
        setBookings(data.success ? data.data : []);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'declined': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'no-show': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'in-progress').length}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'completed').length}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-teal-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
          
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="declined">Declined</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'all' ? 'No bookings have been created yet' : `No ${filter} bookings found`}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">#{booking._id?.slice(-8) || 'N/A'}</p>
                      <h3 className="font-semibold text-gray-900">{booking.service || 'Unknown Service'}</h3>
                      <p className="text-sm text-gray-600 mt-1">{booking.userName || booking.userEmail || 'Unknown User'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status || 'unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Scheduled</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(booking.scheduledDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-bold text-gray-900">₦{(booking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 text-sm font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tasker</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600">#{booking._id?.slice(-8) || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(booking.scheduledDate)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {(booking.userName || booking.userEmail || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span>{booking.userName || booking.userEmail || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{booking.service || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {booking.taskerName ? (
                          <div className="flex items-center gap-2">
                            {booking.taskerPhoto && booking.taskerPhoto !== 'undefined' && booking.taskerPhoto !== '' ? (
                              <img 
                                src={booking.taskerPhoto.startsWith('http') ? booking.taskerPhoto : `https://naija-repair-api.onrender.com${booking.taskerPhoto}`} 
                                alt={booking.taskerName} 
                                className="w-8 h-8 rounded-full object-cover" 
                                onError={(e) => { 
                                  e.target.style.display = 'none'; 
                                  e.target.nextSibling.style.display = 'flex'; 
                                }}
                              />
                            ) : null}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold" style={{ display: (booking.taskerPhoto && booking.taskerPhoto !== 'undefined' && booking.taskerPhoto !== '') ? 'none' : 'flex' }}>
                              {booking.taskerName.charAt(0)}
                            </div>
                            <span>{booking.taskerName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ₦{(booking.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status || 'unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium text-gray-900">#{selectedBooking._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium text-gray-900">{selectedBooking.service}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium text-gray-900">{selectedBooking.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {(selectedBooking.userName || selectedBooking.userEmail).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedBooking.userName || 'N/A'}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{selectedBooking.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4" />
                        <span>{selectedBooking.userPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.taskerName && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tasker Information</h3>
                    <div className="flex items-start gap-3">
                      {selectedBooking.taskerPhoto && selectedBooking.taskerPhoto !== 'undefined' && selectedBooking.taskerPhoto !== '' ? (
                        <img 
                          src={selectedBooking.taskerPhoto.startsWith('http') ? selectedBooking.taskerPhoto : `https://naija-repair-api.onrender.com${selectedBooking.taskerPhoto}`} 
                          alt={selectedBooking.taskerName} 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                          {selectedBooking.taskerName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedBooking.taskerName}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          <span>{selectedBooking.taskerEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Schedule & Location</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Date</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{formatDate(selectedBooking.scheduledDate)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Time</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{selectedBooking.scheduledTime}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <div className="flex items-start gap-2 text-gray-900">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{selectedBooking.location}</p>
                          {selectedBooking.address && (
                            <p className="text-sm text-gray-600 mt-1">{selectedBooking.address}</p>
                          )}
                          {selectedBooking.landmark && (
                            <p className="text-sm text-gray-500 mt-1">Near: {selectedBooking.landmark}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment & Duration</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">₦{(selectedBooking.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedBooking.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-700' :
                        selectedBooking.paymentStatus === 'held' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedBooking.paymentStatus || 'unpaid'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estimated Duration</p>
                      <p className="font-medium text-gray-900">{selectedBooking.estimatedHours || 1} hour(s)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Timestamps</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">{formatDateTime(selectedBooking.createdAt)}</span>
                    </div>
                    {selectedBooking.assignedAt && (
                      <div>
                        <span className="text-gray-500">Assigned:</span>
                        <span className="ml-2 text-gray-900">{formatDateTime(selectedBooking.assignedAt)}</span>
                      </div>
                    )}
                    {selectedBooking.completedAt && (
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <span className="ml-2 text-gray-900">{formatDateTime(selectedBooking.completedAt)}</span>
                      </div>
                    )}
                    {selectedBooking.cancelledAt && (
                      <div>
                        <span className="text-gray-500">Cancelled:</span>
                        <span className="ml-2 text-gray-900">{formatDateTime(selectedBooking.cancelledAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.cancelReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">Cancellation Reason</h3>
                    <p className="text-red-800">{selectedBooking.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}