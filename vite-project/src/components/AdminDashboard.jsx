import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useReviews } from '../context/ReviewsContext';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminTaskers from './admin/AdminTaskers';
import AdminBookings from './admin/AdminBookings';
import AdminSupport from './admin/AdminSupport';
import AdminMessages from './admin/AdminMessages';
import AdminReviews from './admin/AdminReviews';
import AdminPayments from './admin/AdminPayments';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminSettings from './admin/AdminSettings';
import AdminServiceManager from './admin/AdminServiceManager';
import AdminSafetyReports from './admin/AdminSafetyReports';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { taskers } = useTaskers();
  const navigate = useNavigate();

  const pendingVerifications = taskers.filter(t => t.verificationStatus === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'taskers', label: 'Taskers', icon: '🔧' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'safety', label: 'Safety Reports', icon: '🛡️' },
    { id: 'support', label: 'Support', icon: '💬' },
    { id: 'messages', label: 'Messages', icon: '📨' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className={`${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-3 sm:p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 rounded-full blur-sm opacity-60"></div>
              <div className="relative bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Naija</span>
                <span className="text-gray-400 mx-0.5">•</span>
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Repair</span>
              </span>
              <span className="text-[8px] font-bold text-teal-400/80 tracking-wider uppercase">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-2 transition-colors text-sm sm:text-base relative ${
                activeTab === item.id ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.id === 'taskers' && pendingVerifications > 0 && (
                <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingVerifications}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-2 sm:p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 mb-2 text-sm sm:text-base">
            <span className="text-lg sm:text-xl">🌐</span>
            <span>View Site</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 text-sm sm:text-base">
            <span className="text-lg sm:text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      <div className="flex-1 overflow-auto w-full lg:w-auto">
        <div className="bg-white border-b shadow-sm p-3 sm:p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 ml-14 lg:ml-0">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">Welcome, {user?.name}</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'taskers' && <AdminTaskers />}
          {activeTab === 'services' && <AdminServiceManager />}
          {activeTab === 'bookings' && <AdminBookings />}
          {activeTab === 'safety' && <AdminSafetyReports />}
          {activeTab === 'support' && <AdminSupport />}
          {activeTab === 'messages' && <AdminMessages />}
          {activeTab === 'reviews' && <AdminReviews />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
