import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBookings } from "../context/BookingsContext";
import { useMessages } from "../context/MessagesContext";
import { useSettings } from "../context/SettingsContext";
import NotificationsPanel from "./NotificationsPanel";
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { bookings } = useBookings();
  const { getUnreadCount } = useMessages();
  const count = (bookings || []).filter(b => b.status === 'upcoming' && b.createdByEmail === user?.email).length;
  const unreadMessages = getUnreadCount(user?.email);

  function BookingCountBadge() {
    return <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-teal-500 text-white rounded-full">{count}</span>;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={!user ? '/' : user.role === 'tasker' ? '/tasker-dashboard' : '/user-home'} className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight leading-none" style={{ fontFamily: '"Montserrat", "Poppins", sans-serif', letterSpacing: '-0.03em' }}>
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">Naija</span>
                <span className="text-gray-700 mx-0.5">•</span>
                <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Repair</span>
              </span>
              <span className="text-[9px] font-bold text-teal-600/80 tracking-[0.2em] uppercase mt-0.5" style={{ fontFamily: '"Inter", sans-serif' }}>Expert Services</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role !== 'tasker' && (
              <Link to="/services" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">Services</Link>
            )}
            {user?.role !== 'admin' && user?.role !== 'tasker' && (
              <Link to="/become-tasker" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">Become a Tasker</Link>
            )}
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">Log In</Link>
                <Link to="/signup" className="ml-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all font-medium shadow-md hover:shadow-lg">Sign Up</Link>
              </>
            ) : user.role === 'admin' ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/admin" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors">Back to Admin</Link>
                <button onClick={handleLogout} className="ml-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium transition-colors">Log out</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                {user.role === 'tasker' && (
                  <Link to="/tasker-dashboard" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">Dashboard</Link>
                )}
                {user.role !== 'tasker' && (
                  <>
                    <Link to="/my-bookings" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50 flex items-center gap-2">
                      My Bookings
                      {count > 0 && <BookingCountBadge />}
                    </Link>
                    <Link to="/favorites" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">Favorites</Link>
                    <Link to="/my-wallet" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50">My Wallet</Link>
                  </>
                )}
                <Link to="/messages" className="px-4 py-2 text-gray-700 hover:text-teal-600 font-medium transition-colors rounded-lg hover:bg-teal-50 flex items-center gap-2">
                  Messages
                  {unreadMessages > 0 && <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{unreadMessages}</span>}
                </Link>
                <NotificationsPanel />
                <div className="relative ml-2 pl-4 border-l border-gray-200" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-teal-50 rounded-lg transition-all"
                  >
                    <User className="w-6 h-6 text-gray-700" />
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-scale-in">
                      <Link
                        to={user.role === 'tasker' ? '/tasker-settings' : '/account-settings'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Account Settings</span>
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
          
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-700 hover:text-teal-600 focus:outline-none p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {user?.role !== 'tasker' && (
              <Link to="/services" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Services</Link>
            )}
            {user?.role !== 'admin' && user?.role !== 'tasker' && (
              <Link to="/become-tasker" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Become a Tasker</Link>
            )}
            {!user ? (
              <>
                <Link to="/login" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/signup" className="block bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-all font-medium text-center shadow-md" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link to="/admin" className="block bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-all font-medium text-center shadow-md" onClick={() => setMenuOpen(false)}>Back to Admin</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-3 rounded-lg font-medium transition-colors">Log out</button>
              </>
            ) : (
              <>
                {user.role === 'tasker' && (
                  <Link to="/tasker-dashboard" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                )}
                {user.role !== 'tasker' && (
                  <>
                    <Link to="/my-bookings" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>My Bookings</Link>
                    <Link to="/favorites" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Favorites</Link>
                    <Link to="/my-wallet" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>My Wallet</Link>
                  </>
                )}
                <Link to="/messages" className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Messages</Link>
                <Link to={user.role === 'tasker' ? '/tasker-settings' : '/account-settings'} className="block px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 font-medium rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>Account Settings</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-3 rounded-lg font-medium transition-colors">Log out</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
