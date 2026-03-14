import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useTaskers } from '../context/TaskersContext';
import { useNotifications } from '../context/NotificationsContext';
import { useSettings } from '../context/SettingsContext';
import { getServices } from '../config/services';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../utils/taskerPhoto';
import { Calendar, Clock, MapPin, FileText, Check, ArrowRight, Star } from 'lucide-react';

export default function BookingFlow() {
  const { taskerId } = useParams();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const { taskers } = useTaskers();
  const { addNotification } = useNotifications();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [serviceNames, setServiceNames] = useState([]);
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
  });

  useEffect(() => {
    const loadServices = async () => {
      const services = await getServices();
      setServiceNames(services.map(s => s.name));
    };
    loadServices();
  }, []);

  const tasker = taskers.find(t => t.id === bookingData.taskerId);
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City'];
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const calculateTotal = () => {
    if (!tasker) return 0;
    const baseAmount = tasker.hourlyRate * parseInt(bookingData.duration);
    const commission = (baseAmount * (settings.commissionRate || 15)) / 100;
    return baseAmount + commission;
  };

  const handleSubmit = () => {
    const totalPrice = calculateTotal();
    const booking = {
      id: Date.now().toString(),
      ...bookingData,
      taskerName: tasker?.name,
      taskerPhoto: tasker ? resolveTaskerPhoto(tasker) : '',
      hourlyRate: tasker?.hourlyRate,
      totalPrice,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      createdByEmail: user?.email,
      createdByName: user?.name,
      paymentStatus: 'pending',
    };
    navigate('/payment', { state: { booking } });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            {[1, 2].map((num, idx) => (
              <div key={num} className="flex items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  step > num ? 'bg-teal-600 text-white' :
                  step === num ? 'bg-teal-600 text-white shadow-lg' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-6 h-6" /> : num}
                </div>
                {idx < 1 && (
                  <div className={`w-32 h-1 mx-4 transition-all ${step > num ? 'bg-teal-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-40 text-sm">
            <span className={`font-medium ${step === 1 ? 'text-teal-600' : 'text-gray-500'}`}>Select Service</span>
            <span className={`font-medium ${step === 2 ? 'text-teal-600' : 'text-gray-500'}`}>Booking Details</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {step === 1 && (
            <div className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">What service do you need?</h2>
                <p className="text-gray-600 mb-8">Select the service you'd like to book</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {(tasker?.services || serviceNames).map(service => (
                    <button
                      key={service}
                      onClick={() => setBookingData({...bookingData, service})}
                      className={`group p-6 border-2 rounded-2xl text-left transition-all ${
                        bookingData.service === service 
                          ? 'border-teal-500 bg-teal-50 shadow-lg' 
                          : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-lg">{service}</p>
                        {bookingData.service === service && (
                          <div className="bg-teal-600 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  disabled={!bookingData.service}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-5 gap-0">
              {/* Form Section */}
              <div className="md:col-span-3 p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete your booking</h2>
                <p className="text-gray-600 mb-8">Fill in the details for your service</p>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        Date
                      </label>
                      <input 
                        type="date" 
                        value={bookingData.date} 
                        onChange={e => setBookingData({...bookingData, date: e.target.value})} 
                        min={new Date().toISOString().split('T')[0]} 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                        <Clock className="w-5 h-5 text-teal-600" />
                        Time
                      </label>
                      <select 
                        value={bookingData.time} 
                        onChange={e => setBookingData({...bookingData, time: e.target.value})} 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Duration
                    </label>
                    <select 
                      value={bookingData.duration} 
                      onChange={e => setBookingData({...bookingData, duration: e.target.value})} 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      {[1,2,3,4,5,6,7,8].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      Address
                    </label>
                    <input 
                      type="text" 
                      value={bookingData.address} 
                      onChange={e => setBookingData({...bookingData, address: e.target.value})} 
                      placeholder="Enter your full address" 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      City
                    </label>
                    <select 
                      value={bookingData.city} 
                      onChange={e => setBookingData({...bookingData, city: e.target.value})} 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-900 mb-3 font-medium">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Task Details
                    </label>
                    <textarea 
                      value={bookingData.details} 
                      onChange={e => setBookingData({...bookingData, details: e.target.value})} 
                      placeholder="Describe what you need in detail..." 
                      rows={4} 
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => setStep(1)} 
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={!bookingData.date || !bookingData.time || !bookingData.address || !bookingData.details} 
                    className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Confirm & Pay
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Summary Section */}
              <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-12">
                <div className="sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>
                  
                  {tasker && (
                    <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={resolveTaskerPhoto(tasker)}
                          alt={tasker.name}
                          onError={(event) => setTaskerFallbackOnError(event, tasker)}
                          className="w-16 h-16 rounded-xl object-cover ring-4 ring-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{tasker.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{tasker.rating}</span>
                            <span>({tasker.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="space-y-4 mb-5">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service</span>
                        <span className="font-semibold text-gray-900">{bookingData.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hourly Rate</span>
                        <span className="font-semibold text-gray-900">₦{tasker?.hourlyRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-gray-900">{bookingData.duration}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-semibold text-gray-900">{settings.commissionRate || 15}%</span>
                      </div>
                    </div>
                    
                    <div className="pt-5 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-teal-600">₦{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
