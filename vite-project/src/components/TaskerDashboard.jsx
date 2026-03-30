import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useMessages } from '../context/MessagesContext';
import EarningsDashboard from './EarningsDashboard';
import CalendarView from './CalendarView';
import TaskerVerification from './TaskerVerification';
import { Shield, AlertCircle, Clock, MessageCircle } from 'lucide-react';

export default function TaskerDashboard() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const { bookings, assignBooking, refreshBookings } = useBookings();
  const { taskers, refreshTaskers } = useTaskers();
  const [activeTab, setActiveTab] = useState('jobs');
  const [currentTasker, setCurrentTasker] = useState(null);
  const [loadingTasker, setLoadingTasker] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchCurrentTasker = async () => {
      try {
        const token = getToken();
        if (token) {
          const response = await fetch('https://naija-repair-api.onrender.com/api/taskers/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentTasker(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch current tasker:', error);
      } finally {
        setLoadingTasker(false);
      }
    };
    fetchCurrentTasker();
  }, [getToken]);

  const handleMessageClient = (booking) => {
    navigate('/messages', { 
      state: { 
        taskerEmail: booking.userEmail || booking.createdByEmail, 
        taskerName: booking.userName || booking.createdByName || booking.userEmail,
        taskerId: booking.userId
      } 
    });
  };

  const handleStartJob = async (bookingId) => {
    try {
      setLoadingId(bookingId);
      const token = getToken();
      const response = await fetch(`https://naija-repair-api.onrender.com/api/bookings/${bookingId}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await refreshBookings();
        alert('Job started successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start job');
      }
    } catch (error) {
      console.error('Start job error:', error);
      alert('Failed to start job');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCompleteJob = async (bookingId) => {
    try {
      setLoadingId(bookingId);
      const token = getToken();
      const response = await fetch(`https://naija-repair-api.onrender.com/api/bookings/${bookingId}/tasker-complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await refreshBookings();
        alert('Job completed successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to complete job');
      }
    } catch (error) {
      console.error('Complete job error:', error);
      alert('Failed to complete job');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnassignJob = async (bookingId) => {
    if (!confirm('Are you sure you want to unassign this job?')) return;
    
    try {
      setLoadingId(bookingId);
      const token = getToken();
      const response = await fetch(`https://naija-repair-api.onrender.com/api/bookings/${bookingId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Unassigned by tasker' })
      });
      
      if (response.ok) {
        await refreshBookings();
        alert('Job unassigned successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to unassign job');
      }
    } catch (error) {
      console.error('Unassign job error:', error);
      alert('Failed to unassign job');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeclineJob = async (bookingId) => {
    const reason = prompt('Please provide a reason for declining this job:');
    if (!reason) return;
    
    try {
      setLoadingId(bookingId);
      const token = getToken();
      const response = await fetch(`https://naija-repair-api.onrender.com/api/bookings/${bookingId}/decline`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        await refreshBookings();
        alert('Job declined successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to decline job');
      }
    } catch (error) {
      console.error('Decline job error:', error);
      alert('Failed to decline job');
    } finally {
      setLoadingId(null);
    }
  };

  const showVerificationBanner = !loadingTasker && !currentTasker?.verified && (!currentTasker?.verificationStatus || currentTasker?.verificationStatus === 'rejected');
  const showPendingBanner = !loadingTasker && !currentTasker?.verified && currentTasker?.verificationStatus === 'pending';

  const available = bookings.filter(b => !b.assignedTo && (b.status === 'pending' || b.status === 'upcoming'));
  const mine = bookings.filter(b => b.assignedTo === user?.email || b.taskerId === (user?._id || user?.id));
  const completed = mine.filter(b => b.status === 'completed').length;
  const inProgress = mine.filter(b => b.status === 'in-progress').length;

  console.log('📊 Tasker Dashboard Data:', {
    totalBookings: bookings.length,
    available: available.length,
    mine: mine.length,
    completed,
    inProgress,
    userEmail: user?.email,
    userId: user?._id || user?.id
  });
  console.log('📋 Available bookings:', available.map(b => ({ id: b._id, service: b.service, status: b.status })));
  console.log('📋 My bookings:', mine.map(b => ({ id: b._id, service: b.service, status: b.status, assignedTo: b.assignedTo })));

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tasker Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>

        {showVerificationBanner && (
          <div className="mb-6">
            <TaskerVerification tasker={currentTasker} onSuccess={async () => {
              setCurrentTasker(prev => ({ ...prev, verificationStatus: 'pending' }));
              await refreshTaskers();
            }} />
          </div>
        )}

        {showPendingBanner && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-bold text-yellow-900">Under Review</h3>
            </div>
          </div>
        )}

        <div className="mb-6 flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'earnings'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => navigate('/tasker-wallet')}
            className="px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-gray-600 hover:text-gray-900"
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Calendar
          </button>
        </div>

        {activeTab === 'jobs' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{available.length}</p>
              </div>
              <div className="bg-teal-100 rounded-full p-3">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{inProgress}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completed}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Available Jobs</h3>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">{available.length} new</span>
            </div>
            {available.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-500">No available jobs right now</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {available.map(b => (
                  <div key={b._id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-4 hover:border-teal-200 transition-all">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{b.service}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{b.description}</p>
                        <p className="text-xs text-gray-500 mt-1">User: {b.userName} | Amount: ₦{b.totalAmount?.toLocaleString()}</p>
                      </div>
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-medium self-start">New</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => assignBooking(b._id, user.email)} 
                        disabled={loadingId === b._id}
                        className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-teal-700 transition-all disabled:opacity-50"
                      >
                        {loadingId === b._id ? 'Processing...' : 'Accept Job'}
                      </button>
                      <button 
                        onClick={() => handleDeclineJob(b._id)} 
                        disabled={loadingId === b._id}
                        className="px-4 bg-red-50 text-red-600 rounded-lg text-sm sm:text-base font-medium hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">My Assigned Jobs</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">{mine.length} total</span>
            </div>
            {mine.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No assigned jobs yet</p>
                <p className="text-sm text-gray-400 mt-1">Accept jobs from the available list</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                {mine.map(b => (
                  <div key={b._id} className="border-2 border-gray-100 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{b.service}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{b.description}</p>
                        <p className="text-xs text-gray-500 mt-2 truncate">Client: {b.userName || b.userEmail}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium self-start flex-shrink-0 ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {b.status === 'in-progress' ? 'In Progress' : b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleMessageClient(b)}
                        className="px-2 sm:px-3 py-2 bg-teal-50 text-teal-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-100 transition-all flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Message</span><span className="sm:hidden">Msg</span>
                      </button>
                      {b.status === 'assigned' && (
                        <>
                          <button 
                            onClick={() => handleStartJob(b._id)} 
                            disabled={loadingId === b._id}
                            className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-100 transition-all disabled:opacity-50"
                          >
                            {loadingId === b._id ? 'Starting...' : 'Start Job'}
                          </button>
                          <button 
                            onClick={() => handleCompleteJob(b._id)} 
                            disabled={loadingId === b._id}
                            className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-100 transition-all disabled:opacity-50"
                          >
                            {loadingId === b._id ? 'Completing...' : 'Complete'}
                          </button>
                        </>
                      )}
                      {b.status === 'in-progress' && (
                        <button 
                          onClick={() => handleCompleteJob(b._id)} 
                          disabled={loadingId === b._id}
                          className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-100 transition-all disabled:opacity-50"
                        >
                          {loadingId === b._id ? 'Completing...' : 'Mark Complete'}
                        </button>
                      )}
                      {b.status !== 'completed' && (
                        <button 
                          onClick={() => handleUnassignJob(b._id)} 
                          disabled={loadingId === b._id}
                          className="px-3 sm:px-4 bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                          {loadingId === b._id ? 'Processing...' : 'Unassign'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          </>
        )}

        {activeTab === 'earnings' && <EarningsDashboard />}

        {activeTab === 'calendar' && <CalendarView />}
      </div>
    </main>
  );
}
