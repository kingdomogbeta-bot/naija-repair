import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingsContext';
import ConfirmModal from '../ConfirmModal';
import UndoSnackbar from '../UndoSnackbar';

export default function UpcomingBookings() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const items = (bookings || []).filter(b => b.status === 'upcoming' && b.createdByEmail === user?.email);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [undoOpen, setUndoOpen] = useState(false);
  const [undoData, setUndoData] = useState(null);

  const handleAction = (id, action) => {
    setConfirmData({ id, action });
    setConfirmOpen(true);
  };

  const onConfirm = () => {
    const { id, action } = confirmData;
    const prevStatus = 'upcoming';
    const newStatus = action === 'complete' ? 'completed' : 'cancelled';
    updateBookingStatus(id, newStatus);
    setConfirmOpen(false);
    setUndoData({ id, prevStatus });
    setUndoOpen(true);
  };

  const onUndo = () => {
    if (!undoData) return;
    updateBookingStatus(undoData.id, undoData.prevStatus);
    setUndoOpen(false);
    setUndoData(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg">Upcoming Bookings</h3>
      <ul className="mt-3 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-gray-500">No upcoming bookings yet. Book a service to get started.</li>
        ) : (
          items.map(it => (
            <li key={it.id} className="flex justify-between items-start">
              <div>
                <div className="font-medium">{it.service}</div>
                <div className="text-sm text-gray-500">Booked {new Date(it.createdAt).toLocaleString()}</div>
                {it.scheduledAt && <div className="text-sm text-gray-500">Scheduled: {new Date(it.scheduledAt).toLocaleString()}</div>}
                <div className="text-sm text-gray-500">{it.details}</div>
                <div className="text-sm mt-1">Payment: <span className="font-medium">{it.paymentStatus ?? 'pending'}</span></div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-teal-600 font-semibold">{it.status}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(it.id, 'complete')} className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm">Complete</button>
                  <button onClick={() => handleAction(it.id, 'cancel')} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">Cancel</button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <ConfirmModal
        open={confirmOpen}
        title={confirmData?.action === 'complete' ? 'Mark booking as completed?' : 'Cancel booking?'}
        message={confirmData?.action === 'complete' ? 'This will mark the booking as completed.' : 'This will cancel the booking.'}
        confirmLabel={confirmData?.action === 'complete' ? 'Mark Completed' : 'Cancel Booking'}
        onConfirm={onConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <UndoSnackbar
        open={undoOpen}
        message={'Booking updated.'}
        actionLabel={'Undo'}
        onAction={onUndo}
        onClose={() => setUndoOpen(false)}
      />
    </div>
  );
}
