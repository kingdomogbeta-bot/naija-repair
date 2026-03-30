import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';

export default function CalendarView() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Get bookings assigned to this tasker
  const myBookings = bookings.filter(b => 
    (b.assignedTo === user?.email || b.taskerId === (user?._id || user?.id)) &&
    ['assigned', 'in-progress'].includes(b.status)
  );

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const getBookingsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return myBookings.filter(b => {
      // Check both scheduledDate and date fields
      const bookingDate = b.scheduledDate || b.date;
      if (!bookingDate) return false;
      // Handle both date string formats
      const normalizedDate = bookingDate.split('T')[0]; // Remove time if present
      return normalizedDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-teal-600" />
          Task Calendar
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[150px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDate(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const isPast = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0));
          const hasBookings = dayBookings.length > 0;

          return (
            <div
              key={day}
              onClick={() => hasBookings && setSelectedDay({ day, bookings: dayBookings })}
              className={`aspect-square border-2 rounded-lg p-1.5 transition-all ${
                isToday ? 'border-teal-500 bg-teal-50' :
                hasBookings ? 'border-teal-300 bg-teal-50 cursor-pointer hover:border-teal-500' :
                isPast ? 'border-gray-100 bg-gray-50' :
                'border-gray-200 hover:border-teal-200'
              }`}
            >
              <div className="flex flex-col h-full">
                <span className={`text-sm font-semibold ${
                  isToday ? 'text-teal-600' :
                  hasBookings ? 'text-teal-700' :
                  isPast ? 'text-gray-300' :
                  'text-gray-900'
                }`}>
                  {day}
                </span>
                <div className="flex-1 mt-1 space-y-1">
                  {dayBookings.slice(0, 2).map((booking, idx) => {
                    const time = booking.scheduledTime || booking.time || 'TBD';
                    return (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-teal-100 text-teal-700'
                        }`}
                        title={`${booking.service} - ${time}`}
                      >
                        {time}
                      </div>
                    );
                  })}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-teal-600 font-semibold">+{dayBookings.length - 2}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ background: '#ccfbf1' }}></div>
          <span className="text-gray-600">Assigned ({myBookings.filter(b => b.status === 'assigned').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-gray-600">In Progress ({myBookings.filter(b => b.status === 'in-progress').length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">Completed</span>
        </div>
      </div>

      {/* Day details popup */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#0f172a' }}>
                {monthNames[month]} {selectedDay.day}, {year}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {selectedDay.bookings.map((booking, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-base" style={{ color: '#0f172a' }}>{booking.service}</h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      booking.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {booking.status === 'in-progress' ? 'In Progress' : 'Assigned'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                      <Clock className="w-4 h-4" style={{ color: '#0d9488' }} />
                      <span>{booking.scheduledTime || booking.time || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                      <User className="w-4 h-4" style={{ color: '#0d9488' }} />
                      <span>{booking.userName || 'Client'}</span>
                    </div>
                    {booking.location && (
                      <div className="flex items-start gap-2" style={{ color: '#64748b' }}>
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0d9488' }} />
                        <span className="line-clamp-2">{booking.location}</span>
                      </div>
                    )}
                    {booking.description && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: '#94a3b8' }}>{booking.description}</p>
                    )}
                    <div className="pt-2 mt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <span className="text-base font-bold" style={{ color: '#0d9488' }}>₦{booking.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
