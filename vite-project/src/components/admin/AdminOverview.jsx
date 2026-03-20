import { useState } from 'react';
import { useBookings } from '../../context/BookingsContext';
import { useTaskers } from '../../context/TaskersContext';
import { useUsers } from '../../context/UsersContext';
import { Users, Wrench, CalendarDays, Clock, Calendar } from 'lucide-react';

export default function AdminOverview() {
  const { bookings } = useBookings();
  const { taskers } = useTaskers();
  const { users } = useUsers();

  const pendingVerifications = taskers.filter(t => t.verificationStatus === 'pending').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').length;

  const stats = [
    { label: 'Total Users', value: users.length, change: '+12%', icon: <Users className="w-5 h-5" />, bg: '#0d9488', light: '#f0fdfa' },
    { label: 'Total Taskers', value: taskers.length, change: '+8%', icon: <Wrench className="w-5 h-5" />, bg: '#0f172a', light: '#f1f5f9' },
    { label: 'Total Bookings', value: bookings.length, change: '+15%', icon: <CalendarDays className="w-5 h-5" />, bg: '#0d9488', light: '#f0fdfa' },
    { label: 'Pending Verifications', value: pendingVerifications, change: '', icon: <Clock className="w-5 h-5" />, bg: '#f59e0b', light: '#fffbeb' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#64748b' }}>{stat.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: '#0f172a' }}>{stat.value}</p>
              {stat.change && (
                <p className="text-xs font-semibold mt-1" style={{ color: '#0d9488' }}>{stat.change} ↑</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 relative" style={{ background: stat.bg }}>
              {stat.icon}
              {stat.label === 'Pending Verifications' && stat.value > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stat.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Booking Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: '#0d9488' }} />
            <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>Booking Status</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Completed', value: completedBookings, color: '#0d9488' },
              { label: 'Upcoming', value: upcomingBookings, color: '#0f172a' },
              { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="text-sm font-medium" style={{ color: '#64748b' }}>{item.label}</span>
                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: item.color + '15', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: '#0f172a' }} />
            <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>Top Services</h3>
          </div>
          <div className="space-y-3">
            {['Plumbing', 'Cleaning', 'Electrical'].map((service, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="text-sm font-medium" style={{ color: '#64748b' }}>{service}</span>
                <span className="text-sm font-bold" style={{ color: '#0f172a' }}>{[234, 189, 156][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: '#0d9488' }} />
          <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {bookings.slice(0, 5).map((booking, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0d9488' }}>
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{booking.service} booking</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>by {booking.userName || booking.createdByName}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: '#94a3b8' }}>{new Date(booking.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>No recent activity</p>}
        </div>
      </div>
    </div>
  );
}
