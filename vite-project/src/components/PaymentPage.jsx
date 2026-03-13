import { useNavigate, useLocation } from 'react-router-dom';
import { useBookings } from '../context/BookingsContext';
import PaymentModal from './PaymentModal';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No booking selected</h2>
          <button onClick={() => navigate('/my-bookings')} className="px-6 py-2 bg-teal-600 text-white rounded-lg">Go to Bookings</button>
        </div>
      </div>
    );
  }

  return (
    <PaymentModal 
      booking={booking} 
      onClose={() => navigate('/my-bookings')} 
      onSuccess={() => navigate('/my-bookings')} 
    />
  );
};

export default PaymentPage;
