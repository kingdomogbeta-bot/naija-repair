import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { Wallet, TrendingUp, Calendar, Award } from 'lucide-react';

export default function EarningsDashboard() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [period, setPeriod] = useState('week');

  const myCompletedBookings = bookings.filter(
    b => b.assignedTo === user?.email && b.status === 'completed'
  );

  const calculateEarnings = (timeframe) => {
    const now = new Date();
    let startDate;

    if (timeframe === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeframe === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    return myCompletedBookings
      .filter(b => new Date(b.createdAt) >= startDate)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  };

  const totalEarnings = myCompletedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const weeklyEarnings = calculateEarnings('week');
  const monthlyEarnings = calculateEarnings('month');
  const avgPerTask = totalEarnings / (myCompletedBookings.length || 1);

  const getEarningsByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const earningsByDay = days.map(() => 0);

    myCompletedBookings.forEach(b => {
      const day = new Date(b.createdAt).getDay();
      earningsByDay[day] += b.totalPrice || 0;
    });

    const maxEarning = Math.max(...earningsByDay);
    return days.map((day, i) => ({
      day,
      amount: earningsByDay[i],
      height: maxEarning > 0 ? (earningsByDay[i] / maxEarning) * 100 : 0
    }));
  };

  const earningsData = getEarningsByDay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-8 h-8" />
            <span className="text-teal-100 text-sm">Total</span>
          </div>
          <p className="text-3xl font-bold">₦{totalEarnings.toLocaleString()}</p>
          <p className="text-teal-100 text-sm mt-1">All time earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="text-gray-500 text-sm">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦{weeklyEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-gray-500 text-sm">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦{monthlyEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="text-gray-500 text-sm">Avg/Task</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦{Math.round(avgPerTask).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Earnings by Day</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {earningsData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-teal-100 rounded-t-lg relative group cursor-pointer hover:bg-teal-200 transition-all"
                   style={{ height: `${data.height}%` }}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₦{data.amount.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Earnings</h3>
        <div className="space-y-3">
          {myCompletedBookings.slice(0, 5).map(booking => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{booking.service}</p>
                <p className="text-sm text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-lg font-bold text-teal-600">₦{booking.totalPrice?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
