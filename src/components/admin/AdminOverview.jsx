import { useBookings } from '../../context/BookingsContext';
import { useTaskers } from '../../context/TaskersContext';

export default function AdminOverview() {
  const { bookings } = useBookings();
  const { taskers } = useTaskers();

  const registeredUsers = JSON.parse(localStorage.getItem('naija_registered_users') || '{}');
  const totalUsers = Object.keys(registeredUsers).length;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').length;

  const stats = [
    { label: 'Total Users', value: totalUsers, change: '+12%', color: 'blue', icon: '👥' },
    { label: 'Total Taskers', value: taskers.length, change: '+8%', color: 'teal', icon: '🔧' },
    { label: 'Total Bookings', value: bookings.length, change: '+15%', color: 'green', icon: '📅' },
    { label: 'Completed Tasks', value: completedBookings, change: '+20%', color: 'yellow', icon: '✅' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-green-600 text-sm mt-1">{stat.change} ↑</p>
              </div>
              <div className={`bg-${stat.color}-100 rounded-full p-3 text-3xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-green-600">{completedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-bold text-blue-600">{upcomingBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-bold text-red-600">{bookings.filter(b => b.status === 'cancelled').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Services</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plumbing</span>
              <span className="font-bold">234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cleaning</span>
              <span className="font-bold">189</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Electrical</span>
              <span className="font-bold">156</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {bookings.slice(0, 5).map((booking, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">📅</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{booking.service} booking</p>
                <p className="text-sm text-gray-600">by {booking.createdByName}</p>
              </div>
              <span className="text-sm text-gray-500">{new Date(booking.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
