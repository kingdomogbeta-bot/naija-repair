import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useMessages } from '../context/MessagesContext';
import EarningsDashboard from './EarningsDashboard';
import CalendarView from './CalendarView';
import TaskerVerification from './TaskerVerification';
import { Shield, AlertCircle, CheckCircle, Clock, MessageCircle } from 'lucide-react';

export default function TaskerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings, assignBooking, updateBookingStatus, unassignBooking } = useBookings();
  const { taskers } = useTaskers();
  const [activeTab, setActiveTab] = useState('jobs');
  const [showVerification, setShowVerification] = useState(false);

  const handleMessageClient = (booking) => {
    navigate('/messages', { state: { taskerEmail: booking.createdByEmail, taskerName: booking.createdByName || booking.createdByEmail } });
  };

  const currentTasker = taskers.find(t => t.email === user?.email);
  const verificationRequests = JSON.parse(localStorage.getItem('naija_verification_requests') || '[]');
  const myVerification = verificationRequests.find(v => v.taskerEmail === user?.email);
  const verificationStatus = currentTasker?.verified ? 'verified' : myVerification?.status || 'unverified';

  const available = bookings.filter(b => !b.assignedTo && b.status === 'upcoming');
  const mine = bookings.filter(b => b.assignedTo === user?.email);
  const completed = mine.filter(b => b.status === 'completed').length;
  const inProgress = mine.filter(b => b.status === 'in-progress').length;

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tasker Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>

        {verificationStatus === 'unverified' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Get Verified</h3>
                  <p className="text-sm text-yellow-700 mt-1">Verify your account to build trust and get more bookings</p>
                </div>
              </div>
              <button
                onClick={() => setShowVerification(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 whitespace-nowrap"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}

        {verificationStatus === 'pending' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800">Verification Pending</h3>
                <p className="text-sm text-blue-700 mt-1">Your documents are under review. We'll notify you within 24-48 hours.</p>
              </div>
            </div>
          </div>
        )}

        {verificationStatus === 'verified' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Verified Account</h3>
                <p className="text-sm text-green-700 mt-1">Your account is verified. Clients can trust your services.</p>
              </div>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Available Jobs</h3>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">{available.length} new</span>
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {available.map(b => (
                  <div key={b.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-teal-200 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{b.service}</h4>
                        <p className="text-sm text-gray-600 mt-1">{b.details}</p>
                      </div>
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-medium">New</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => assignBooking(b.id, user.email)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-all">Accept Job</button>
                      <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">My Assigned Jobs</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{mine.length} total</span>
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {mine.map(b => (
                  <div key={b.id} className="border-2 border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{b.service}</h4>
                        <p className="text-sm text-gray-600 mt-1">{b.details}</p>
                        <p className="text-xs text-gray-500 mt-2">Client: {b.createdByName || b.createdByEmail}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {b.status === 'in-progress' ? 'In Progress' : b.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMessageClient(b)}
                        className="px-3 py-2 bg-teal-50 text-teal-600 rounded-lg font-medium hover:bg-teal-100 transition-all flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                      {b.status === 'assigned' && (
                        <>
                          <button onClick={() => updateBookingStatus(b.id, 'in-progress')} className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg font-medium hover:bg-yellow-100 transition-all">Start Job</button>
                          <button onClick={() => updateBookingStatus(b.id, 'completed')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-medium hover:bg-green-100 transition-all">Complete</button>
                        </>
                      )}
                      {b.status === 'in-progress' && (
                        <button onClick={() => updateBookingStatus(b.id, 'completed')} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-medium hover:bg-green-100 transition-all">Mark Complete</button>
                      )}
                      {b.status !== 'completed' && (
                        <button onClick={() => unassignBooking(b.id)} className="px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all">Unassign</button>
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

      {showVerification && (
        <TaskerVerification
          taskerEmail={user?.email}
          currentStatus={verificationStatus}
          onClose={() => setShowVerification(false)}
        />
      )}
    </main>
  );
}
