import { useState } from 'react';
import { useBookings } from '../../context/BookingsContext';
import { Calendar, Filter, Eye } from 'lucide-react';

export default function AdminBookings() {
  const { bookings } = useBookings();
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'assigned': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 sm:ml-auto text-xs sm:text-sm">
            <span className="text-gray-600">Upcoming: <strong className="text-blue-600">{bookings.filter(b => b.status === 'upcoming').length}</strong></span>
            <span className="text-gray-600">Completed: <strong className="text-green-600">{bookings.filter(b => b.status === 'completed').length}</strong></span>
            <span className="text-gray-600">Total: <strong className="text-gray-900">{bookings.length}</strong></span>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">#{booking.id.slice(0, 8)}</p>
                    <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                    <p className="text-sm text-gray-600 mt-1">{booking.createdByName || booking.createdByEmail}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-bold text-gray-900">₦{(booking.totalPrice || 0).toLocaleString()}</p>
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
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tasker</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">#{booking.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{booking.createdByName || booking.createdByEmail}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{booking.service}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{booking.assignedTo || '-'}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ₦{(booking.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-medium text-gray-900">#{selectedBooking.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium text-gray-900">{selectedBooking.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{selectedBooking.createdByName || selectedBooking.createdByEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Details</p>
                <p className="font-medium text-gray-900">{selectedBooking.details || 'No details provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {selectedBooking.date} at {selectedBooking.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-bold text-gray-900 text-xl">₦{(selectedBooking.totalPrice || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
