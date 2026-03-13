import { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { NIGERIA_STATES, STATE_LGAS } from '../data/locations';
import { combineDateTimeISO, isPastDateTime, isWithinBusinessHours, formatLocalDateTime, todayDateString } from '../utils/dateUtils';

function BookingFormModal({ open, onClose, service }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [state, setState] = useState(user?.state || 'Lagos');
  const [lga, setLga] = useState(user?.lga || 'Ikeja');
  const [address, setAddress] = useState(user?.address || '');
  const [landmark, setLandmark] = useState(user?.landmark || '');
  const [payNow, setPayNow] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addBooking, updateBooking } = useBookings();

  if (!open) return null;

  const scheduledAtStr = date && time ? formatLocalDateTime(combineDateTimeISO(date, time)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-teal-600 text-2xl"
          onClick={onClose}
          aria-label="Close booking form"
        >
          ×
        </button>
        {submitted ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-teal-700 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-700">Your booking for <span className="font-bold">{service}</span> is scheduled for <span className="font-semibold">{scheduledAtStr ?? (date ? `${date} ${time}` : '—')}</span>.</p>
            <p className="text-gray-700 mt-2">Payment status: <span className="font-semibold text-teal-700">{payNow ? 'Paid (sandbox)' : 'Pending'}</span></p>
            {!payNow && (
              <div className="mt-4">
                <button onClick={() => {
                  setTimeout(() => {
                    const raw = localStorage.getItem('naija_bookings');
                    if (!raw) return;
                    const arr = JSON.parse(raw);
                    const found = arr.reverse().find(b => b.service === service && (b.createdByEmail === user?.email || b.email === email));
                    if (found) updateBooking(found.id, { paymentStatus: 'paid' });
                    setPayNow(true);
                  }, 300);
                }} className="px-4 py-2 bg-teal-600 text-white rounded">Pay now (sandbox)</button>
              </div>
            )}
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={e => {
              e.preventDefault();
              setError('');
              // Validation
              if (date && !time) {
                setError('Please select a time for the chosen date.');
                return;
              }
              if (isPastDateTime(date, time)) {
                setError('Selected date/time is in the past. Please choose a future time.');
                return;
              }
              if (!isWithinBusinessHours(time)) {
                setError('Please pick a time between 07:00 and 20:00.');
                return;
              }

              const scheduledAt = date && time ? combineDateTimeISO(date, time) : null;
              const booking = {
                id: Date.now(),
                service,
                name: name || user?.name || '',
                email: email || user?.email || '',
                phone: phone || user?.phone || '',
                details,
                status: 'upcoming',
                createdAt: new Date().toISOString(),
                createdByEmail: user?.email || email || null,
                createdByName: user?.name || name || null,
                assignedTo: null,
                scheduledAt,
                paymentStatus: payNow ? 'paid' : 'pending'
              };
              addBooking(booking);
              setSubmitted(true);
              // Auto-close after short delay
              setTimeout(() => {
                setSubmitted(false);
                onClose();
              }, 1100);
            }}
          >
            <h2 className="text-xl font-bold text-teal-700 mb-2">Book {service}</h2>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" type="text" placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" type="tel" placeholder="Enter your phone number" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1 font-medium">Date</label>
                <input value={date} onChange={e => setDate(e.target.value)} type="date" min={todayDateString()} className="w-full border rounded px-3 py-2" aria-invalid={!!error} />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-1 font-medium">Time</label>
                <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full border rounded px-3 py-2" aria-invalid={!!error} />
              </div>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="text-xs text-gray-500">Preferred hours: 07:00 - 20:00. Leave blank to request anytime.</div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Describe Your Task</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" rows={3} placeholder="Tell us more about your needs" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1 font-medium">State</label>
                <select value={state} onChange={e => { setState(e.target.value); setLga(''); }} className="w-full border rounded px-3 py-2">
                  {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-1 font-medium">LGA</label>
                <select value={lga} onChange={e => setLga(e.target.value)} className="w-full border rounded px-3 py-2">
                  {(STATE_LGAS[state] || []).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Address</label>
              <input value={address} onChange={e => setAddress(e.target.value)} required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" type="text" placeholder="Your full address" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Landmark</label>
              <input value={landmark} onChange={e => setLandmark(e.target.value)} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400" type="text" placeholder="Nearby landmark" />
            </div>
            <div className="flex items-center gap-3">
              <input id="payNow" type="checkbox" checked={payNow} onChange={e => setPayNow(e.target.checked)} />
              <label htmlFor="payNow" className="text-sm text-gray-700">Pay now (sandbox)</label>
            </div>
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded font-semibold hover:bg-teal-700 transition">Submit Booking</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingFormModal;
