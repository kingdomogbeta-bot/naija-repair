import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NIGERIA_STATES, STATE_LGAS } from '../data/locations';
import { Plus, Minus, Check, ArrowRight } from 'lucide-react';

const PRICES = { iron: 300, wash: 500 };

export default function DryCleaningBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('iron');
  const [clothCount, setClothCount] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');

  const totalAmount = clothCount * PRICES[serviceType];
  const serviceLabel = serviceType === 'iron' ? 'Ironing Only' : 'Wash & Iron';

  const handleContinue = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!date || !time) { setError('Please select a date and time'); return; }
    if (!address) { setError('Please enter your address'); return; }
    setError('');
    setStep(2);
  };

  const handleConfirm = () => {
    const booking = {
      service: 'Dry Cleaning & Laundry',
      description: `${serviceLabel} - ${clothCount} cloth${clothCount > 1 ? 'es' : ''}`,
      location: `${state}, ${lga}`,
      state,
      lga,
      address,
      landmark,
      scheduledDate: date,
      scheduledTime: time,
      estimatedHours: Math.ceil(clothCount / 5) || 1,
      totalAmount,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
    };
    navigate('/payment', { state: { booking } });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Dry Cleaning & Laundry</h1>
            <p className="text-teal-100">Professional cleaning service</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-4 py-4 border-b">
            {[1, 2].map((num, idx) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step > num ? 'bg-teal-600 text-white' :
                  step === num ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {idx < 1 && <div className={`w-16 h-1 mx-2 ${step > 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-24 text-xs text-gray-500 pb-2">
            <span className={step === 1 ? 'text-teal-600 font-semibold' : ''}>Details</span>
            <span className={step === 2 ? 'text-teal-600 font-semibold' : ''}>Confirm</span>
          </div>

          {step === 1 && (
            <form onSubmit={handleContinue} className="p-6 space-y-6">

              {/* Service Type */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Select Service Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'iron', label: 'Ironing Only', price: 300 },
                    { key: 'wash', label: 'Wash & Iron', price: 500 },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setServiceType(opt.key)}
                      className={`p-5 rounded-xl border-2 transition-all text-center ${
                        serviceType === opt.key
                          ? 'border-teal-600 bg-teal-50 shadow-lg'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="text-2xl font-bold text-teal-600 mb-1">₦{opt.price}</div>
                      <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-1">per cloth</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cloth Count */}
              <div>
                <label className="block text-gray-900 font-semibold mb-3">Number of Clothes</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setClothCount(Math.max(1, clothCount - 1))}
                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center">
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-gray-900">{clothCount}</div>
                    <div className="text-sm text-gray-500">cloth{clothCount > 1 ? 'es' : ''}</div>
                  </div>
                  <button type="button" onClick={() => setClothCount(clothCount + 1)}
                    className="w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">State</label>
                  <select value={state} onChange={e => { setState(e.target.value); setLga(''); }}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">LGA</label>
                  <select value={lga} onChange={e => setLga(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {(STATE_LGAS[state] || []).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} required
                  placeholder="Your full address"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Landmark <span className="text-gray-400 font-normal text-sm">(optional)</span></label>
                <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Shoprite Mall"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

              <button type="submit"
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">Dry Cleaning & Laundry</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">{serviceLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clothes</span>
                  <span className="font-semibold">{clothCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per cloth</span>
                  <span className="font-semibold">₦{PRICES[serviceType].toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">{time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Address</span>
                  <span className="font-semibold text-right max-w-xs">{address}, {lga}, {state}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                  Confirm & Pay <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
