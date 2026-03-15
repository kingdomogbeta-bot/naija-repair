const Payment = require('./payment.schema');
const axios = require('axios');

const PAYSTACK_SECRET = process.env.PSSECRET;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

console.log('Payment controller loaded');
console.log('Paystack Secret:', PAYSTACK_SECRET ? 'SET' : 'NOT SET');
console.log('Secret starts with:', PAYSTACK_SECRET?.substring(0, 8));

exports.initializePayment = async (req, res) => {
  try {
    const { bookingId, taskerId, amount, email, metadata } = req.body;
    const userId = req.user._id || req.user.id; // Get userId from authenticated user

    console.log('Payment initialization request:', { bookingId, userId, taskerId, amount, email });
    console.log('Paystack Secret Key:', PAYSTACK_SECRET ? `${PAYSTACK_SECRET.substring(0, 10)}...` : 'NOT SET');

    if (!bookingId || !taskerId || !amount || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!PAYSTACK_SECRET) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    const reference = `NR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      bookingId,
      userId,
      taskerId,
      amount,
      reference,
      metadata
    });

    await payment.save();
    console.log('Payment record saved:', reference);

    const paymentData = {
      email,
      amount: amount * 100,
      reference,
      callback_url: `${process.env.FRONTEND_URL || 'https://naija-repair-rd5j.onrender.com'}/payment/verify`,
      metadata: { bookingId, userId, taskerId, ...metadata }
    };

    console.log('Paystack request data:', paymentData);

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Paystack response:', response.data);

    res.json({
      success: true,
      data: response.data.data,
      reference
    });
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment initialization failed', details: error.response?.data || error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      // Update payment record
      await Payment.findOneAndUpdate(
        { reference },
        { 
          status: 'success',
          paystackResponse: data
        }
      );

      const payment = await Payment.findOne({ reference });
      
      if (payment && payment.metadata) {
        // Create the actual booking in the database
        const Booking = require('../booking/booking.schema');
        const Tasker = require('../tasker/tasker.schema');
        
        try {
          // Fetch tasker details to get photo
          const tasker = await Tasker.findById(payment.taskerId).select('photoUrl');
          
          const bookingData = {
            userId: payment.userId,
            taskerId: payment.taskerId,
            service: payment.metadata.service || 'General Service',
            description: payment.metadata.details || payment.metadata.description || 'Service booking',
            location: payment.metadata.address || 'Location not specified',
            scheduledDate: payment.metadata.date || new Date(),
            scheduledTime: payment.metadata.time || '09:00',
            estimatedHours: parseInt(payment.metadata.duration) || 2,
            totalAmount: payment.amount,
            status: 'pending',
            paymentStatus: 'paid',
            paymentReference: reference,
            userEmail: payment.metadata.userEmail,
            userName: payment.metadata.userName,
            userPhone: payment.metadata.userPhone,
            taskerName: payment.metadata.taskerName,
            taskerPhoto: tasker?.photoUrl || null,
            city: payment.metadata.city || 'Lagos'
          };

          const booking = await Booking.create(bookingData);
          console.log('✅ Booking created successfully after payment:', booking._id);
          console.log('📊 Booking details:', {
            id: booking._id,
            service: booking.service,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            userId: booking.userId,
            taskerId: booking.taskerId
          });

          // Emit socket event for new booking - notify all taskers
          if (global.io) {
            global.io.emit('new_booking', booking);
            global.io.to(payment.userId).emit('booking_created', booking);
            console.log('📡 Broadcasted new paid booking to all taskers and user');
          }
        } catch (bookingError) {
          console.error('❌ Failed to create booking:', bookingError);
        }

        // Credit tasker wallet — look up by ID first, fall back to metadata email
        try {
          let taskerEmail = payment.metadata?.taskerEmail;
          const taskerForWallet = await Tasker.findById(payment.taskerId).select('email').catch(() => null);
          if (taskerForWallet) taskerEmail = taskerForWallet.email;

          if (taskerEmail) {
            await axios.post(`${process.env.BACKEND_URL || 'https://naija-repair-api.onrender.com'}/api/wallet/credit`, {
              taskerEmail,
              amount: payment.amount,
              bookingId: payment.bookingId,
              paymentReference: reference,
              description: `Payment for booking ${payment.bookingId}`
            });
            console.log('✅ Wallet credited for tasker:', taskerEmail);
          } else {
            console.error('❌ No tasker email found for wallet credit, taskerId:', payment.taskerId);
          }
        } catch (walletError) {
          console.error('Wallet credit error:', walletError.message);
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data
      });
    } else {
      await Payment.findOneAndUpdate(
        { reference },
        { status: 'failed', paystackResponse: data }
      );

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment verification failed', details: error.response?.data || error.message });
  }
};

exports.getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Get payment error:', error.message);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get all payments error:', error.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
