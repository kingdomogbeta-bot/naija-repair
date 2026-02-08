import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

export default function DryCleaningBooking() {
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('iron');
  const [itemCount, setItemCount] = useState(1);
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const prices = {
    iron: 300,
    washIron: 500
  };

  const totalPrice = itemCount * prices[serviceType];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    addBooking({
      service: 'Dry Cleaning & Laundry',
      details: `${serviceType === 'iron' ? 'Ironing Only' : 'Wash & Iron'} - ${itemCount} items`,
      pickupAddress,
      deliveryDate,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    navigate('/find-taskers');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Dry Cleaning & Laundry</h1>
            <p className="text-teal-100">Professional cleaning with pickup and delivery</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-3">Select Service Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setServiceType('iron')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    serviceType === 'iron'
                      ? 'border-teal-600 bg-teal-50 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">₦300</div>
                    <div className="font-semibold text-gray-900 mb-1">Ironing Only</div>
                    <div className="text-sm text-gray-600">Per item</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('washIron')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    serviceType === 'washIron'
                      ? 'border-teal-600 bg-teal-50 shadow-lg'
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">₦500</div>
                    <div className="font-semibold text-gray-900 mb-1">Wash & Iron</div>
                    <div className="text-sm text-gray-600">Per item</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-3">Number of Items</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setItemCount(Math.max(1, itemCount - 1))}
                  className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-gray-900">{itemCount}</div>
                  <div className="text-sm text-gray-600">items</div>
                </div>
                <button
                  type="button"
                  onClick={() => setItemCount(itemCount + 1)}
                  className="w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2">Pickup Address</label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your pickup address..."
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-2">Preferred Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Service Type:</span>
                <span className="font-semibold text-gray-900">
                  {serviceType === 'iron' ? 'Ironing Only' : 'Wash & Iron'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Number of Items:</span>
                <span className="font-semibold text-gray-900">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 font-medium">Price per Item:</span>
                <span className="font-semibold text-gray-900">₦{prices[serviceType].toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-teal-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total Price:</span>
                  <span className="text-3xl font-bold text-teal-600">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Continue to Select Tasker
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
