import { useState } from 'react';
import { initializePayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, getToken } = useAuth();

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();

      if (!token) {
        setError('Please login to continue');
        setLoading(false);
        return;
      }

      console.log('User object:', user);
      console.log('User email:', user.email);
      
      const paymentData = {
        bookingId: booking.id,
        taskerId: booking.taskerId,
        amount: booking.totalPrice,
        email: user.email,
        metadata: {
          service: booking.service,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          address: booking.address,
          city: booking.city,
          details: booking.details,
          userEmail: user.email,
          userName: user.name,
          userPhone: user.phone,
          taskerName: booking.taskerName,
          taskerEmail: booking.taskerEmail,
          description: booking.details
        }
      };

      const response = await initializePayment(token, paymentData);

      if (response.success && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError('Failed to initialize payment');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-semibold">{booking.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">{booking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-semibold">{booking.time}</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-3">
            <span className="font-bold">Total Amount:</span>
            <span className="font-bold text-teal-600">₦{booking.totalPrice?.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
