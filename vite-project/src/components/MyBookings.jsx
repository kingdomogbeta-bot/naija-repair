import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import UndoSnackbar from './UndoSnackbar';
import { useBookings } from '../context/BookingsContext';
import { useReviews } from '../context/ReviewsContext';
import { useNotifications } from '../context/NotificationsContext';

import ReviewModal from './ReviewModal';
import SafetyTracker from './SafetyTracker';
import PaymentModal from './PaymentModal';
import { Star, MessageCircle, Shield, Flag, User, Calendar, Clock, MapPin, CheckCircle, CreditCard } from 'lucide-react';
import { createReport } from '../services/api';

export default function MyBookings() {
  const { user, getToken } = useAuth();
  const { bookings, updateBookingStatus, updateBooking, deleteBooking, completeBooking, cancelBooking } = useBookings();
  const { getBookingReview } = useReviews();
  const { markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const items = (bookings || []).filter(b => b.userEmail === user?.email);

  useEffect(() => {
    markAllAsRead();
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoData, setUndoData] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [safetyTrackerOpen, setSafetyTrackerOpen] = useState(false);
  const [safetyBooking, setSafetyBooking] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportBooking, setReportBooking] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportSubmitting(true);
    try {
      const token = getToken();
      await createReport(token, {
        bookingId: reportBooking._id,
        taskerEmail: reportBooking.taskerEmail || reportBooking.assignedTo,
        taskerName: reportBooking.taskerName,
        service: reportBooking.service,
        refundAmount: reportBooking.totalAmount,
        reason: reportReason,
        description: reportReason,
        reportedUserId: reportBooking.taskerId || '',
        reportedUserEmail: reportBooking.taskerEmail || '',
      });
      setReportDone(true);
    } catch (e) {
      alert(e.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleMessageTasker = (booking) => {
    console.log('Messaging tasker with booking:', booking);
    navigate('/messages', { 
      state: { 
        taskerId: booking.taskerId,
        taskerEmail: booking.taskerEmail || booking.taskerId, 
        taskerName: booking.taskerName 
      } 
    });
  };

  const requestAction = (id, action) => {
    setConfirmData({ id, action });
    setConfirmOpen(true);
  };

  const doConfirm = async () => {
    const { id, action } = confirmData;
    try {
      if (action === 'complete') {
        await completeBooking(id);
      } else {
        await cancelBooking(id, 'Cancelled by user');
      }
      setConfirmOpen(false);
      setUndoOpen(true);
    } catch (error) {
      alert(error.message || 'Action failed');
      setConfirmOpen(false);
    }
  };

  const doUndo = () => {
    setUndoOpen(false);
    setUndoData(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your service bookings</p>
          </div>
          <button onClick={() => navigate('/services')} className="bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-teal-700 transition-all whitespace-nowrap">+ New Booking</button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="mx-auto mb-6 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-gradient-to-br from-teal-50 to-white rounded-full">
              <svg className="w-20 h-20 text-teal-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 20h48v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V20z" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 12h24v8H20z" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 36h24" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">You don't have any bookings yet — find a Tasker and book a service in minutes.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/services')} className="bg-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-teal-700">Browse Services</button>
              <button onClick={() => navigate('/find-taskers')} className="border border-teal-200 text-teal-600 px-5 py-2 rounded-xl text-sm hover:bg-teal-50">Find Taskers</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {items.map(b => (
              <div key={b._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div className="flex gap-3 sm:gap-4 flex-1 w-full">
                    {b.taskerPhoto && b.taskerPhoto !== 'undefined' && b.taskerPhoto !== '' ? (
                      <img 
                        src={b.taskerPhoto.startsWith('http') ? b.taskerPhoto : `https://naija-repair-api.onrender.com${b.taskerPhoto}`} 
                        alt={b.taskerName} 
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          e.target.nextSibling.style.display = 'flex'; 
                        }} 
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100" 
                      />
                    ) : null}
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 border border-gray-100" style={{ display: (b.taskerPhoto && b.taskerPhoto !== 'undefined' && b.taskerPhoto !== '') ? 'none' : 'flex' }}>
                      <span className="text-white font-bold text-lg sm:text-2xl">{b.taskerName?.charAt(0) || 'T'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{b.service}</h3>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold self-start ${b.status === 'completed' ? 'bg-green-100 text-green-700' : b.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{b.status === 'in-progress' ? 'In Progress' : b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-2">{b.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1 truncate"><User className="w-3 h-3" /> {b.taskerName || 'Pending'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(b.scheduledDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.scheduledTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-1">
                    <p className="text-lg sm:text-2xl font-bold text-teal-600">₦{b.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{b.estimatedHours}h</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t">
                  <div className="flex flex-wrap items-center gap-2">
                    {b.status === 'pending' && b.paymentStatus === 'unpaid' && <button onClick={() => { setPaymentBooking(b); setPaymentModalOpen(true); }} className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-700">Pay Now</button>}
                    {b.paymentStatus === 'paid' && <span className="px-3 sm:px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>}
                    <button onClick={() => handleMessageTasker(b)} className="px-3 sm:px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-teal-100 flex items-center gap-2"><MessageCircle className="w-4 h-4" /> <span className="hidden sm:inline">Message</span></button>
                    {(b.status === 'assigned' || b.status === 'in-progress') && b.taskerId && <button onClick={() => { setSafetyBooking(b); setSafetyTrackerOpen(true); }} className="px-3 sm:px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-100 flex items-center gap-2"><Shield className="w-4 h-4" /> <span className="hidden sm:inline">Safety</span></button>}
                    {b.status === 'completed' && !getBookingReview(b._id) && <button onClick={() => { setSelectedBooking(b); setReviewModalOpen(true); }} className="px-3 sm:px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-100 flex items-center gap-2"><Star className="w-4 h-4" /> <span className="hidden sm:inline">Rate</span></button>}
                    {b.status === 'completed' && getBookingReview(b._id) && <span className="px-3 sm:px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2"><Star className="w-4 h-4 fill-current" /> Reviewed</span>}
                    {b.status === 'completed' && <button onClick={() => { setReportBooking(b); setReportReason(''); setReportDone(false); setReportModalOpen(true); }} className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 flex items-center gap-2"><Flag className="w-4 h-4" /> <span className="hidden sm:inline">Report</span></button>}
                  </div>

                  <div className="flex gap-2">
                    {(b.status === 'cancelled' || b.status === 'declined') && (
                      <button onClick={async () => { if(confirm('Delete this booking?')) await deleteBooking(b._id); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Delete</button>
                    )}
                    {b.status === 'pending' && b.paymentStatus === 'unpaid' && (
                      <button onClick={() => { setPaymentBooking(b); setPaymentModalOpen(true); }} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">Complete Payment</button>
                    )}
                    {b.status === 'in-progress' && b.assignedTo && (
                      <>
                        <button onClick={() => requestAction(b._id, 'complete')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Mark complete</button>
                        <button onClick={() => requestAction(b._id, 'cancel')} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50">Cancel</button>
                      </>
                    )}
                    {b.status === 'pending' && !b.assignedTo && (
                      <button onClick={() => requestAction(b._id, 'cancel')} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={confirmData?.action === 'complete' ? 'Mark booking as completed?' : 'Cancel booking?'}
        message={confirmData?.action === 'complete' ? 'This will mark the booking as completed.' : 'This will cancel the booking.'}
        confirmLabel={confirmData?.action === 'complete' ? 'Mark Completed' : 'Cancel Booking'}
        onConfirm={doConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <UndoSnackbar
        open={undoOpen}
        message={'Booking updated.'}
        actionLabel={'Undo'}
        onAction={doUndo}
        onClose={() => setUndoOpen(false)}
      />

      {reviewModalOpen && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => { setReviewModalOpen(false); setSelectedBooking(null); }}
          onSubmit={() => { setReviewModalOpen(false); setSelectedBooking(null); }}
        />
      )}

      {safetyTrackerOpen && safetyBooking && (
        <SafetyTracker
          booking={safetyBooking}
          onClose={() => { setSafetyTrackerOpen(false); setSafetyBooking(null); }}
        />
      )}

      {paymentModalOpen && paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => { setPaymentModalOpen(false); setPaymentBooking(null); }}
          onSuccess={() => { setPaymentModalOpen(false); setPaymentBooking(null); }}
        />
      )}

      {reportModalOpen && reportBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {reportDone ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-gray-600 mb-2">Our team will review your report within 24 hours.</p>
                <p className="text-gray-600 mb-6">If a refund is approved, <span className="font-semibold text-teal-600">₦{reportBooking.totalAmount?.toLocaleString()}</span> will be added to your wallet.</p>
                <button onClick={() => { setReportModalOpen(false); setReportBooking(null); }} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700">Close</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Report an Issue</h3>
                <p className="text-sm text-gray-500 mb-4">{reportBooking.service} • {reportBooking.taskerName}</p>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Describe the issue (e.g. tasker never showed up, poor service...)"
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
                />
                <p className="text-xs text-gray-500 mb-4">Refund amount if approved: <span className="font-semibold text-teal-600">₦{reportBooking.totalAmount?.toLocaleString()}</span></p>
                <div className="flex gap-3">
                  <button onClick={() => setReportModalOpen(false)} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleReport} disabled={reportSubmitting || !reportReason.trim()} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300">{reportSubmitting ? 'Submitting...' : 'Submit Report'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
