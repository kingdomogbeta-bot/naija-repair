import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaystackPayment from './PaystackPayment';
import { useBookings } from '../context/BookingsContext';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateBooking } = useBookings();
  const booking = location.state?.booking;

  const handlePaymentSuccess = (reference) => {
    updateBooking(booking.id, {
      paymentStatus: 'paid',
      paymentReference: reference
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600">Complete your booking payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <PaystackPayment booking={booking} onSuccess={handlePaymentSuccess} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              {booking && (
                <>
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service</span>
                      <span className="font-medium">{booking.service}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{booking.duration}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate</span>
                      <span className="font-medium">₦{booking.hourlyRate}/hr</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-teal-600">₦{booking.totalPrice.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
