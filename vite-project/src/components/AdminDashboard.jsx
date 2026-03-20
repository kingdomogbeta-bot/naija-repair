import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useReviews } from '../context/ReviewsContext';
import { Menu, X, LayoutDashboard, Users, Wrench, Briefcase, CalendarDays, ShieldAlert, Flag, MessageSquare, Mail, Star, Banknote, BarChart2, Settings, Globe, LogOut } from 'lucide-react';
import { getUnreadReportsCount } from '../services/api';
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
import AdminReports from './admin/AdminReports';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadReports, setUnreadReports] = useState(0);
  const { user, logout, getToken } = useAuth();
  const { taskers } = useTaskers();
  const navigate = useNavigate();

  const pendingVerifications = taskers.filter(t => t.verificationStatus === 'pending').length;

  useEffect(() => {
    getUnreadReportsCount(getToken()).then(r => setUnreadReports(r.count || 0)).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    if (tabId === 'reports') setUnreadReports(0);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'taskers', label: 'Taskers', icon: <Wrench className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'bookings', label: 'Bookings', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'safety', label: 'Safety Reports', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'reports', label: 'User Reports', icon: <Flag className="w-5 h-5" />, badge: unreadReports },
    { id: 'support', label: 'Support', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <Mail className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <Banknote className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg text-white"
        style={{ background: '#0f172a' }}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-all duration-300 flex flex-col`}
        style={{ background: '#0f172a' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: '#0d9488' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-base leading-none tracking-tight">
              Naija<span style={{ color: '#0d9488' }}>Repair</span>
            </p>
            <p className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: '#0d9488', opacity: 0.8 }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                style={isActive
                  ? { background: '#0d9488', color: '#fff' }
                  : { color: '#94a3b8' }
                }
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: '#5eead4' }} />}
                <span className="ml-1">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'taskers' && pendingVerifications > 0 && (
                  <span className="absolute right-3 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingVerifications}
                  </span>
                )}
                {item.badge > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Globe className="w-5 h-5" /><span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto w-full lg:w-auto flex flex-col">
        {/* Top bar */}
        <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ borderBottom: '2px solid #0d9488', boxShadow: '0 1px 8px rgba(13,148,136,0.08)' }}>
          <div className="flex items-center gap-3 ml-12 lg:ml-0">
            <div className="w-1 h-7 rounded-full" style={{ background: '#0d9488' }} />
            <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#0f172a' }}>
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: '#64748b' }}>Welcome, <span className="font-semibold" style={{ color: '#0f172a' }}>{user?.name}</span></span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow" style={{ background: '#0d9488' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'taskers' && <AdminTaskers />}
          {activeTab === 'services' && <AdminServiceManager />}
          {activeTab === 'bookings' && <AdminBookings />}
          {activeTab === 'safety' && <AdminSafetyReports />}
          {activeTab === 'reports' && <AdminReports />}
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
