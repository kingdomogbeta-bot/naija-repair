import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useNotifications } from '../context/NotificationsContext';
import { SERVICE_NAMES } from '../config/services';
import ImageUpload from './ImageUpload';
import RecurringBooking from './RecurringBooking';

export default function BookingFlow() {
  const { taskerId } = useParams();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const { taskers } = useTaskers();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    duration: '2',
    address: '',
    city: 'Lagos',
    details: '',
    taskerId: taskerId || '',
    images: [],
    isRecurring: false,
    recurringData: null
  });

  const tasker = taskers.find(t => t.id === bookingData.taskerId);
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City'];
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const calculateTotal = () => {
    if (!tasker) return 0;
    return tasker.hourlyRate * parseInt(bookingData.duration);
  };

  const handleSubmit = () => {
    const totalPrice = calculateTotal();
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      taskerName: tasker?.name,
      taskerPhoto: tasker?.photoUrl,
      hourlyRate: tasker?.hourlyRate,
      totalPrice,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      createdByEmail: user?.email,
      createdByName: user?.name,
      paymentStatus: 'pending',
    };
    addBooking(booking);
    
    addNotification({
      type: 'booking',
      title: 'Task Confirmed',
      message: `Your task with ${tasker?.name} for ${bookingData.service} has been confirmed.`,
      link: '/my-bookings'
    });
    
    navigate('/payment', { state: { booking } });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Service', 'Schedule', 'Location', 'Details', 'Review'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > idx + 1 ? 'bg-teal-600 text-white' :
                  step === idx + 1 ? 'bg-teal-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                {idx < 4 && <div className={`w-full h-1 mx-2 ${step > idx + 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {['Service', 'Schedule', 'Location', 'Details', 'Review'].map((label, idx) => (
              <span key={idx} className={step === idx + 1 ? 'font-bold text-teal-600' : ''}>{label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What service do you need?</h2>
              {tasker && tasker.services.length > 1 && (
                <p className="text-gray-600 mb-6">This tasker offers multiple services. Select all that apply.</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {(tasker?.services || SERVICE_NAMES).map(service => (
                  <button
                    key={service}
                    onClick={() => {
                      if (tasker && tasker.services.length > 1) {
                        const currentServices = Array.isArray(bookingData.service) ? bookingData.service : bookingData.service ? [bookingData.service] : [];
                        const isSelected = currentServices.includes(service);
                        const newServices = isSelected
                          ? currentServices.filter(s => s !== service)
                          : [...currentServices, service];
                        setBookingData({...bookingData, service: newServices});
                      } else {
                        setBookingData({...bookingData, service: [service]});
                      }
                    }}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      (Array.isArray(bookingData.service) ? bookingData.service.includes(service) : bookingData.service === service)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{service}</p>
                    {tasker && tasker.services.length > 1 && (
                      <div className="mt-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(bookingData.service) && bookingData.service.includes(service)}
                          readOnly
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={nextStep}
                disabled={!bookingData.service || (Array.isArray(bookingData.service) && bookingData.service.length === 0)}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">When do you need it?</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={e => setBookingData({...bookingData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Time</label>
                  <select
                    value={bookingData.time}
                    onChange={e => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Duration (hours)</label>
                  <select
                    value={bookingData.duration}
                    onChange={e => setBookingData({...bookingData, duration: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {[1,2,3,4,5,6,7,8].map(h => (
                      <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!bookingData.date || !bookingData.time}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where should the tasker go?</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Street Address</label>
                  <input
                    type="text"
                    value={bookingData.address}
                    onChange={e => setBookingData({...bookingData, address: e.target.value})}
                    placeholder="Enter your address"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">City</label>
                  <select
                    value={bookingData.city}
                    onChange={e => setBookingData({...bookingData, city: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!bookingData.address}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us more about your task</h2>
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Task Details</label>
                  <textarea
                    value={bookingData.details}
                    onChange={e => setBookingData({...bookingData, details: e.target.value})}
                    placeholder="Describe what you need done..."
                    rows={6}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Upload Photos (Optional)</label>
                  <ImageUpload
                    onUpload={(images) => setBookingData({...bookingData, images})}
                    existingImages={bookingData.images}
                    maxFiles={5}
                  />
                </div>

                <RecurringBooking
                  bookingData={bookingData}
                  onUpdate={(recurringData) => setBookingData({...bookingData, ...recurringData})}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300">
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!bookingData.details}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review your booking</h2>
              <div className="space-y-4 mb-6">
                {tasker && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img src={tasker.photoUrl} alt={tasker.name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-gray-900">{tasker.name}</p>
                      <p className="text-sm text-gray-600">⭐ {tasker.rating} ({tasker.reviewCount} reviews)</p>
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2"><span className="text-gray-600">Service{Array.isArray(bookingData.service) && bookingData.service.length > 1 ? 's' : ''}:</span> <span className="font-semibold">{Array.isArray(bookingData.service) ? bookingData.service.join(', ') : bookingData.service}</span></div>
                    <div><span className="text-gray-600">Date:</span> <span className="font-semibold">{new Date(bookingData.date).toLocaleDateString()}</span></div>
                    <div><span className="text-gray-600">Time:</span> <span className="font-semibold">{bookingData.time}</span></div>
                    <div><span className="text-gray-600">Duration:</span> <span className="font-semibold">{bookingData.duration} hours</span></div>
                    <div className="col-span-2"><span className="text-gray-600">Location:</span> <span className="font-semibold">{bookingData.address}, {bookingData.city}</span></div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold">₦{tasker?.hourlyRate.toLocaleString()}/hr</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{bookingData.duration} hours</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-teal-600 pt-2 border-t">
                    <span>Total:</span>
                    <span>₦{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
