import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

export default function PaystackPayment({ booking, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  const handlePayment = () => {
    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_4e78c5f7ccb3d61314c7748211ef23f89956166f',
      email: booking.createdByEmail,
      amount: booking.totalPrice * 100,
      currency: 'NGN',
      ref: `NAIJA-${Date.now()}`,
      callback_url: 'https://naija-repair-rd5j.onrender.com/payment/verify',
      metadata: {
        custom_fields: [
          {
            display_name: "Booking ID",
            variable_name: "booking_id",
            value: booking.id
          },
          {
            display_name: "Service",
            variable_name: "service",
            value: booking.service
          }
        ]
      },
      callback: function(response) {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.reference);
          navigate('/my-bookings');
        }, 2000);
      },
      onClose: function() {
        setLoading(false);
      }
    });

    handler.openIframe();
  };

  const handleBankTransfer = () => {
    alert('Bank Transfer: Account details will be sent to your email');
  };

  const handleWallet = () => {
    alert('Wallet payment coming soon');
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`w-full p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${
              paymentMethod === 'card' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
            }`}
          >
            <CreditCard className="w-6 h-6 text-teal-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Card Payment</p>
              <p className="text-sm text-gray-600">Pay with debit/credit card</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('bank')}
            className={`w-full p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${
              paymentMethod === 'bank' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
            }`}
          >
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Bank Transfer</p>
              <p className="text-sm text-gray-600">Transfer to our account</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('wallet')}
            className={`w-full p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${
              paymentMethod === 'wallet' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'
            }`}
          >
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Wallet</p>
              <p className="text-sm text-gray-600">Pay from wallet balance</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Service</span>
          <span className="font-semibold">{booking.service}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold">{booking.duration} hours</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Rate</span>
          <span className="font-semibold">₦{booking.hourlyRate?.toLocaleString()}/hr</span>
        </div>
        <div className="flex justify-between pt-2 border-t text-lg font-bold text-teal-600">
          <span>Total</span>
          <span>₦{booking.totalPrice?.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={paymentMethod === 'card' ? handlePayment : paymentMethod === 'bank' ? handleBankTransfer : handleWallet}
        disabled={loading}
        className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ₦{booking.totalPrice?.toLocaleString()}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        <Lock className="w-3 h-3 inline mr-1" />
        Secured by Paystack • Your payment information is encrypted
      </p>
    </div>
  );
}
