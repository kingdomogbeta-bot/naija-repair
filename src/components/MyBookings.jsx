import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import UndoSnackbar from './UndoSnackbar';
import { useBookings } from '../context/BookingsContext';
import { useReviews } from '../context/ReviewsContext';
import { useNotifications } from '../context/NotificationsContext';

import ReviewModal from './ReviewModal';
import TipTasker from './TipTasker';
import SafetyTracker from './SafetyTracker';
import { Star, MessageCircle, Shield } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus, updateBooking } = useBookings();
  const { getBookingReview } = useReviews();
  const { markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const items = (bookings || []).filter(b => b.createdByEmail === user?.email);

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

  const handleMessageTasker = (booking) => {
    navigate('/messages', { state: { taskerEmail: booking.taskerId, taskerName: booking.taskerName } });
  };

  const requestAction = (id, action) => {
    setConfirmData({ id, action });
    setConfirmOpen(true);
  };

  const doConfirm = () => {
    const { id, action } = confirmData;
    const prevStatus = 'upcoming';
    const newStatus = action === 'complete' ? 'completed' : 'cancelled';
    updateBookingStatus(id, newStatus);
    setConfirmOpen(false);
    setUndoData({ id, prevStatus });
    setUndoOpen(true);
  };

  const doUndo = () => {
    if (!undoData) return;
    updateBookingStatus(undoData.id, undoData.prevStatus);
    setUndoOpen(false);
    setUndoData(null);
  };

  const handleTipAdded = (bookingId, tipAmount) => {
    updateBooking(bookingId, {
      tip: tipAmount,
      totalPrice: bookings.find(b => b.id === bookingId).totalPrice + tipAmount
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Bookings</h2>
          <button onClick={() => navigate('/services')} className="text-sm text-teal-600">Browse Services</button>
        </div>
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">You have no bookings yet. Browse services to make a booking.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(b => (
              <li key={b.id} className="border rounded p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{Array.isArray(b.service) ? b.service.join(', ') : b.service}</div>
                    <div className="text-sm text-gray-500">Booked {new Date(b.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-gray-700 mt-2">{b.details}</div>
                    <div className="text-sm text-gray-600 mt-1">Tasker: {b.taskerName}</div>
                    <div className="text-sm font-semibold text-teal-600 mt-1">Total: ₦{b.totalPrice?.toLocaleString()}</div>
                  </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-500">{b.status}</div>
                  <button
                    onClick={() => handleMessageTasker(b)}
                    className="px-3 py-1 bg-teal-50 text-teal-600 rounded text-sm flex items-center gap-1 hover:bg-teal-100"
                  >
                    <MessageCircle className="w-4 h-4" /> Message Tasker
                  </button>
                  {b.status === 'upcoming' && b.taskerId && (
                    <button
                      onClick={() => { setSafetyBooking(b); setSafetyTrackerOpen(true); }}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm flex items-center gap-1 hover:bg-green-100"
                    >
                      <Shield className="w-4 h-4" /> Safety Tracker
                    </button>
                  )}
                  {b.status === 'upcoming' && (
                    <div className="flex gap-2">
                      <button onClick={() => requestAction(b.id, 'complete')} className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm">Mark Completed</button>
                      <button onClick={() => requestAction(b.id, 'cancel')} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">Cancel</button>
                      {b.paymentStatus !== 'paid' && (
                        <button onClick={() => { updateBooking(b.id, { paymentStatus: 'paid' }); }} className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm">Pay now (sandbox)</button>
                      )}
                    </div>
                  )}
                  {b.status === 'completed' && !getBookingReview(b.id) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedBooking(b); setReviewModalOpen(true); }}
                        className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded text-sm flex items-center gap-1 hover:bg-yellow-100"
                      >
                        <Star className="w-4 h-4" /> Rate Tasker
                      </button>
                      {!b.tip && <TipTasker booking={b} onTipAdded={handleTipAdded} />}
                    </div>
                  )}
                  {b.status === 'completed' && getBookingReview(b.id) && (
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" /> Rated
                    </span>
                  )}
                </div>
                </div>
              </li>
            ))}
          </ul>
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
    </main>
  );
}
