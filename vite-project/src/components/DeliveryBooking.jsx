import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initializePayment } from '../services/api';
import { NIGERIA_STATES, STATE_LGAS } from '../data/locations';
import { Package, MapPin, Calendar, Clock, Phone, User, ArrowRight, Check, AlertTriangle, ChevronDown } from 'lucide-react';

const SIZES = [
  { key: 'small', label: 'Small', desc: 'Documents, small parcels', example: 'e.g. envelope, small box', price: 1500, icon: '📦' },
  { key: 'medium', label: 'Medium', desc: 'Bags, medium boxes', example: 'e.g. shopping bag, laptop bag', price: 3000, icon: '🗃️' },
  { key: 'large', label: 'Large', desc: 'Large boxes, luggage', example: 'e.g. suitcase, large carton', price: 5000, icon: '📫' },
  { key: 'xl', label: 'Extra Large', desc: 'Bulky or heavy items', example: 'e.g. appliance, multiple boxes', price: 8000, icon: '🏗️' },
];

const TIME_SLOTS = ['07:00 AM','08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'];

export default function DeliveryBooking() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [error, setError] = useState('');

  // Step 1 — Package
  const [size, setSize] = useState('small');
  const [itemDesc, setItemDesc] = useState('');
  const [fragile, setFragile] = useState(false);

  // Step 2 — Addresses & Schedule
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupState, setPickupState] = useState('Lagos');
  const [pickupLga, setPickupLga] = useState('Ikeja');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffState, setDropoffState] = useState('Lagos');
  const [dropoffLga, setDropoffLga] = useState('Ikeja');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const selectedSize = SIZES.find(s => s.key === size);
  const totalAmount = selectedSize.price;

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!itemDesc.trim()) { setError('Please describe the item'); return; }
    setError('');
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!pickupAddress.trim()) { setError('Please enter pickup address'); return; }
    if (!dropoffAddress.trim()) { setError('Please enter dropoff address'); return; }
    if (!receiverName.trim()) { setError('Please enter receiver name'); return; }
    if (!receiverPhone.trim()) { setError('Please enter receiver phone'); return; }
    if (!date) { setError('Please select a date'); return; }
    if (!time) { setError('Please select a time'); return; }
    setError('');
    setStep(3);
  };

  const handleConfirm = async () => {
    setPayLoading(true);
    setPayError('');
    try {
      const token = getToken();
      const response = await initializePayment(token, {
        bookingId: Date.now().toString(),
        taskerId: 'delivery',
        amount: totalAmount,
        email: user.email,
        metadata: {
          service: 'Moving & Delivery',
          details: `Delivery — ${selectedSize.label} package${fragile ? ' (Fragile)' : ''}: ${itemDesc}`,
          date,
          time,
          address: `Pickup: ${pickupAddress}, ${pickupLga}, ${pickupState}`,
          dropoffAddress: `${dropoffAddress}, ${dropoffLga}, ${dropoffState}`,
          receiverName,
          receiverPhone,
          packageSize: selectedSize.label,
          fragile,
          userEmail: user.email,
          userName: user.name,
        }
      });
      if (response.success && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setPayError('Failed to initialize payment. Please try again.');
        setPayLoading(false);
      }
    } catch (err) {
      setPayError(err.message || 'Payment failed. Please try again.');
      setPayLoading(false);
    }
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-xl p-2">
                <Package className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Delivery Service</h1>
            </div>
            <p className="text-teal-100 text-sm">Fast, reliable delivery across Nigeria</p>
          </div>

          {/* Progress */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between mb-1">
              {['Package', 'Addresses', 'Confirm'].map((label, idx) => {
                const num = idx + 1;
                return (
                  <div key={num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step > num ? 'bg-teal-600 text-white' :
                        step === num ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step > num ? <Check className="w-4 h-4" /> : num}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${step === num ? 'text-teal-600' : 'text-gray-400'}`}>{label}</span>
                    </div>
                    {idx < 2 && <div className={`flex-1 h-1 mx-2 mb-4 rounded-full transition-all ${step > num ? 'bg-teal-600' : 'bg-gray-100'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1 — Package Details */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Package Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {SIZES.map(s => (
                    <button key={s.key} type="button" onClick={() => setSize(s.key)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        size === s.key ? 'border-teal-600 bg-teal-50 shadow-md' : 'border-gray-200 hover:border-teal-300'
                      }`}>
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="font-bold text-gray-900">{s.label}</div>
                      <div className="text-xs text-gray-500 mb-2">{s.desc}</div>
                      <div className="text-xs text-gray-400 italic mb-2">{s.example}</div>
                      <div className="text-lg font-bold text-teal-600">₦{s.price.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Item Description</label>
                <textarea
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  placeholder="What are you sending? e.g. 2 cartons of drinks, a laptop bag..."
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <button type="button" onClick={() => setFragile(!fragile)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  fragile ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}>
                <AlertTriangle className={`w-5 h-5 ${fragile ? 'text-orange-500' : 'text-gray-400'}`} />
                <div className="text-left flex-1">
                  <div className={`font-semibold ${fragile ? 'text-orange-700' : 'text-gray-700'}`}>Fragile Item</div>
                  <div className="text-xs text-gray-500">Mark if item needs extra care during handling</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${fragile ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                  {fragile && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

              <button type="submit"
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-base hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Step 2 — Addresses & Schedule */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="p-6 sm:p-8 space-y-6">

              {/* Pickup */}
              <div className="bg-teal-50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-teal-600" />
                  <span className="font-bold text-gray-900">Pickup Location</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">State</label>
                    <div className="relative">
                      <select value={pickupState} onChange={e => { setPickupState(e.target.value); setPickupLga(''); }}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                        {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">LGA</label>
                    <div className="relative">
                      <select value={pickupLga} onChange={e => setPickupLga(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                        {(STATE_LGAS[pickupState] || []).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-medium mb-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-teal-500" />
                    <input type="text" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)}
                      placeholder="House number, street name..."
                      className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              </div>

              {/* Dropoff */}
              <div className="bg-orange-50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="font-bold text-gray-900">Dropoff Location</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">State</label>
                    <div className="relative">
                      <select value={dropoffState} onChange={e => { setDropoffState(e.target.value); setDropoffLga(''); }}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                        {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">LGA</label>
                    <div className="relative">
                      <select value={dropoffLga} onChange={e => setDropoffLga(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                        {(STATE_LGAS[dropoffState] || []).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-medium mb-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-orange-400" />
                    <input type="text" value={dropoffAddress} onChange={e => setDropoffAddress(e.target.value)}
                      placeholder="House number, street name..."
                      className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div className="space-y-3">
                <label className="block text-gray-900 font-semibold">Receiver Details</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)}
                    placeholder="Receiver's full name"
                    className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="tel" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                    placeholder="Receiver's phone number"
                    className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2 text-sm">
                    <Calendar className="w-4 h-4 text-teal-600" /> Pickup Date
                  </label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2 text-sm">
                    <Clock className="w-4 h-4 text-teal-600" /> Pickup Time
                  </label>
                  <div className="relative">
                    <select value={time} onChange={e => setTime(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                  Review <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Summary */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              {/* Package */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Package</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size</span>
                  <span className="font-semibold">{selectedSize.label} — {selectedSize.desc}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item</span>
                  <span className="font-semibold text-right max-w-xs">{itemDesc}</span>
                </div>
                {fragile && (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-700 font-medium">Fragile — Handle with care</span>
                  </div>
                )}
              </div>

              {/* Route */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Route</p>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-teal-600" />
                    <div className="w-0.5 h-8 bg-gray-300 my-1" />
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Pickup</p>
                      <p className="text-sm font-semibold text-gray-900">{pickupAddress}, {pickupLga}, {pickupState}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Dropoff</p>
                      <p className="text-sm font-semibold text-gray-900">{dropoffAddress}, {dropoffLga}, {dropoffState}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receiver & Schedule */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver & Schedule</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receiver</span>
                  <span className="font-semibold">{receiverName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-semibold">{receiverPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pickup Date</span>
                  <span className="font-semibold">{new Date(date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pickup Time</span>
                  <span className="font-semibold">{time}</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-teal-600 rounded-2xl p-4 flex items-center justify-between text-white">
                <span className="font-semibold text-teal-100">Total Amount</span>
                <span className="text-3xl font-black">₦{totalAmount.toLocaleString()}</span>
              </div>

              {payError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{payError}</div>}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button onClick={handleConfirm} disabled={payLoading}
                  className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg">
                  {payLoading ? 'Processing...' : <><span>Confirm & Pay</span> <ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
