import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingsContext';

export default function PastBookings() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const items = (bookings || []).filter(b => b.createdByEmail === user?.email && (b.status === 'completed' || b.status === 'past' || b.status === 'cancelled'));
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-semibold text-lg">Past Bookings</h3>
      <ul className="mt-3 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-gray-500">No past bookings yet.</li>
        ) : (
          items.map(it => (
            <li key={it.id} className="flex justify-between items-center">
              <div className="flex gap-3">
                {it.taskerPhoto && it.taskerPhoto !== 'undefined' && it.taskerPhoto !== '' ? (
                  <img 
                    src={it.taskerPhoto.startsWith('http') ? it.taskerPhoto : `http://localhost:5000${it.taskerPhoto}`} 
                    alt={it.taskerName} 
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0" 
                    onError={(e) => { 
                      e.target.style.display = 'none'; 
                      e.target.nextSibling.style.display = 'flex'; 
                    }}
                  />
                ) : null}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0" style={{ display: (it.taskerPhoto && it.taskerPhoto !== 'undefined' && it.taskerPhoto !== '') ? 'none' : 'flex' }}>
                  <span className="text-white font-bold text-sm">{it.taskerName?.charAt(0) || 'T'}</span>
                </div>
                <div>
                  <div className="font-medium">{it.service}</div>
                  <div className="text-sm text-gray-500">Tasker: {it.taskerName || 'N/A'}</div>
                  <div className="text-sm text-gray-500">Booked {new Date(it.createdAt).toLocaleDateString()}</div>
                  {it.scheduledAt && <div className="text-sm text-gray-500">Scheduled: {new Date(it.scheduledAt).toLocaleString()}</div>}
                  <div className="text-sm mt-1">Payment: <span className="font-medium">{it.paymentStatus ?? 'pending'}</span></div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{it.status}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
