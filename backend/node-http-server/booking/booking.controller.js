const Booking = require('./booking.schema');
const Tasker = require('../tasker/tasker.schema');

exports.createBooking = async (req, res) => {
  try {
    const { service, description, location, scheduledDate, scheduledTime, estimatedHours, totalAmount } = req.body;
    const userId = req.user._id || req.user.id;

    console.log('📝 Creating booking request from user:', userId, req.user.email);
    console.log('📊 Request data:', { service, description, location, scheduledDate, scheduledTime, estimatedHours, totalAmount });

    if (!service || !description || !location || !scheduledDate || !scheduledTime || !totalAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const booking = await Booking.create({
      userId: userId.toString(),
      userEmail: req.user.email,
      userName: req.user.name,
      userPhone: req.user.phone,
      service,
      description,
      location,
      scheduledDate,
      scheduledTime,
      estimatedHours: estimatedHours || 1,
      totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    console.log('✅ New booking created:', booking._id, 'for service:', service);
    console.log('📊 Booking details:', {
      id: booking._id,
      userId: booking.userId,
      service: booking.service,
      status: booking.status,
      paymentStatus: booking.paymentStatus
    });

    // Notify all taskers about new booking
    if (global.io) {
      console.log('📡 Broadcasting new booking to all connected users...');
      global.io.emit('new_booking', booking);
      console.log('✅ Broadcasted new booking event');
      
      // Also log connected sockets
      const connectedSockets = global.io.sockets.sockets.size;
      console.log('🔌 Connected sockets:', connectedSockets);
      
      // List all rooms
      const rooms = Array.from(global.io.sockets.adapter.rooms.keys());
      console.log('🏠 Active rooms:', rooms);
    } else {
      console.log('❌ global.io is not available!');
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    // Populate tasker photos for bookings that don't have them
    const updatedBookings = await Promise.all(bookings.map(async (booking) => {
      if (booking.taskerId && !booking.taskerPhoto) {
        try {
          const tasker = await Tasker.findById(booking.taskerId).select('photoUrl');
          if (tasker && tasker.photoUrl) {
            booking.taskerPhoto = tasker.photoUrl;
            await booking.save();
          }
        } catch (error) {
          console.log('Error fetching tasker photo for booking:', booking._id);
        }
      }
      return booking;
    }));
    
    res.json({ success: true, data: updatedBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskerBookings = async (req, res) => {
  try {
    const taskerId = req.tasker._id || req.tasker.id;
    console.log('🔍 Fetching bookings for tasker:', taskerId, req.tasker.email);
    
    const bookings = await Booking.find({
      $or: [
        { taskerId: taskerId.toString() },
        { taskerEmail: req.tasker.email },
        { status: 'pending' } // Show all pending bookings to all taskers
      ]
    }).sort({ createdAt: -1 });
    
    console.log('📊 Found', bookings.length, 'bookings for tasker');
    console.log('Booking statuses:', bookings.map(b => ({ id: b._id, status: b.status, service: b.service })));
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get tasker bookings error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not available' });
    }

    const taskerId = req.tasker._id || req.tasker.id;
    
    booking.status = 'assigned';
    booking.taskerId = taskerId.toString();
    booking.taskerEmail = req.tasker.email;
    booking.taskerName = req.tasker.name;
    booking.taskerPhoto = req.tasker.photoUrl || null;
    booking.assignedTo = req.tasker.email;
    booking.assignedAt = new Date();
    await booking.save();

    console.log('✅ Booking accepted:', booking._id, 'by tasker:', req.tasker.name);

    if (global.io) {
      global.io.to(booking.userId).emit('booking_updated', booking);
      global.io.emit('booking_updated', booking); // Notify all users about booking update
      console.log('📡 Notified user about booking acceptance');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.declineBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'declined';
    booking.cancelReason = reason || 'Declined by tasker';
    booking.cancelledAt = new Date();
    await booking.save();

    // Auto-refund to user wallet if booking was paid
    if (booking.paymentStatus === 'paid' && booking.totalAmount && booking.userEmail) {
      try {
        const { UserWallet, UserTransaction } = require('../wallet/wallet.schema');
        const User = require('../user/user.schema');
        const Notification = require('../notification/notification.schema');

        let userWallet = await UserWallet.findOne({ userEmail: booking.userEmail });
        if (!userWallet) userWallet = new UserWallet({ userEmail: booking.userEmail, balance: 0, totalRefunds: 0 });

        const balanceBefore = userWallet.balance;
        userWallet.balance += booking.totalAmount;
        userWallet.totalRefunds += booking.totalAmount;
        await userWallet.save();

        await UserTransaction.create({
          userEmail: booking.userEmail,
          type: 'refund',
          amount: booking.totalAmount,
          description: `Refund — tasker declined your ${booking.service} booking`,
          bookingId: booking._id.toString(),
          balanceBefore,
          balanceAfter: userWallet.balance
        });

        booking.paymentStatus = 'refunded';
        await booking.save();

        const user = await User.findOne({ email: booking.userEmail });
        if (user) {
          await Notification.create({
            userId: user._id.toString(),
            userEmail: booking.userEmail,
            type: 'payment',
            title: 'Refund Issued',
            message: `Your ${booking.service} booking was declined. ₦${booking.totalAmount.toLocaleString()} has been refunded to your wallet.`,
            bookingId: booking._id.toString()
          });
          if (global.io) global.io.to(user._id.toString()).emit('notification', { title: 'Refund Issued', message: `₦${booking.totalAmount.toLocaleString()} refunded to your wallet.` });
        }
        console.log('✅ Auto-refunded ₦' + booking.totalAmount + ' to user wallet:', booking.userEmail);
      } catch (refundErr) {
        console.error('Auto-refund error on decline:', refundErr.message);
      }
    }

    if (global.io) {
      global.io.to(booking.userId).emit('booking_updated', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.taskerId !== req.tasker.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'assigned') {
      return res.status(400).json({ message: 'Booking must be assigned first' });
    }

    booking.status = 'in-progress';
    await booking.save();

    if (global.io) {
      global.io.to(booking.userId).emit('booking_updated', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.taskerCompleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const taskerId = req.tasker._id || req.tasker.id;
    if (booking.taskerId !== taskerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['assigned', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking must be assigned or in progress' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // Update tasker's completed tasks count
    await Tasker.findByIdAndUpdate(taskerId, {
      $inc: { completedTasks: 1 }
    });

    // Credit tasker wallet now that job is complete
    try {
      const axios = require('axios');
      const Payment = require('../payment/payment.schema');
      const payment = await Payment.findOne({ bookingId: booking._id.toString(), status: 'success' });
      const taskerForWallet = await Tasker.findById(taskerId).select('email');
      if (taskerForWallet && booking.totalAmount) {
        await axios.post(`${process.env.BACKEND_URL || 'https://naija-repair-api.onrender.com'}/api/wallet/credit`, {
          taskerEmail: taskerForWallet.email,
          amount: booking.totalAmount,
          bookingId: booking._id.toString(),
          paymentReference: payment?.reference || null,
          description: `Payment for completed booking - ${booking.service}`
        });
        console.log('✅ Wallet credited after job completion for:', taskerForWallet.email);
      }
    } catch (walletError) {
      console.error('Wallet credit error after completion:', walletError.message);
    }

    // Notify user about completion
    if (global.io) {
      global.io.to(booking.userId).emit('booking_updated', booking);
      console.log('📡 Notified user about job completion');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Tasker complete booking error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'in-progress') {
      return res.status(400).json({ message: 'Booking must be in progress' });
    }

    if (!booking.assignedTo) {
      return res.status(400).json({ message: 'No tasker assigned' });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    if (booking.taskerId) {
      await Tasker.findByIdAndUpdate(booking.taskerId, {
        $inc: { completedTasks: 1 }
      });
      if (global.io) {
        global.io.to(booking.taskerId).emit('booking_updated', booking);
      }
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    booking.cancelReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    if (global.io && booking.taskerId) {
      global.io.to(booking.taskerId).emit('booking_updated', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['cancelled', 'declined'].includes(booking.status)) {
      return res.status(400).json({ message: 'Can only delete cancelled or declined bookings' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    if (global.io) {
      global.io.to(booking.userId).emit('booking_status_updated', booking);
      if (booking.taskerId) {
        global.io.to(booking.taskerId).emit('booking_status_updated', booking);
      }
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    
    // Populate tasker photos for bookings that don't have them
    const updatedBookings = await Promise.all(bookings.map(async (booking) => {
      if (booking.taskerId && !booking.taskerPhoto) {
        try {
          const tasker = await Tasker.findById(booking.taskerId).select('photoUrl');
          if (tasker && tasker.photoUrl) {
            booking.taskerPhoto = tasker.photoUrl;
            await booking.save();
          }
        } catch (error) {
          console.log('Error fetching tasker photo for booking:', booking._id);
        }
      }
      return booking;
    }));
    
    res.json({ success: true, data: updatedBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.reportNoShow = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['assigned', 'on-the-way'].includes(booking.status)) {
      return res.status(400).json({ message: 'Can only report no-show for assigned bookings' });
    }

    // Check if it's past the scheduled time + 30 minutes grace period
    const scheduledDate = new Date(booking.scheduledDate);
    const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const graceTime = new Date(scheduledDateTime.getTime() + 30 * 60000); // 30 minutes
    const now = new Date();

    if (now < graceTime) {
      const timeUntilGrace = Math.ceil((graceTime - now) / (1000 * 60)); // minutes
      return res.status(400).json({ 
        message: `Please wait ${timeUntilGrace} minutes after scheduled time (${booking.scheduledTime} on ${scheduledDate.toDateString()}) before reporting no-show` 
      });
    }

    booking.status = 'no-show';
    booking.noShowReported = true;
    booking.noShowReportedAt = new Date();
    booking.refundReason = reason || 'Tasker did not show up';
    booking.paymentStatus = 'refunded'; // Auto-refund for no-shows
    await booking.save();

    // Notify tasker about no-show report
    if (global.io && booking.taskerId) {
      global.io.to(booking.taskerId).emit('no_show_reported', booking);
    }

    res.json({ 
      success: true, 
      data: booking,
      message: 'No-show reported. Refund will be processed within 24 hours.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmArrival = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.taskerId !== req.tasker.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'assigned') {
      return res.status(400).json({ message: 'Booking must be assigned' });
    }

    booking.status = 'arrived';
    booking.arrivalConfirmed = true;
    booking.arrivalConfirmedAt = new Date();
    await booking.save();

    // Notify user about arrival
    if (global.io) {
      global.io.to(booking.userId).emit('tasker_arrived', booking);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'No payment to refund' });
    }

    if (booking.refundRequested) {
      return res.status(400).json({ message: 'Refund already requested' });
    }

    booking.refundRequested = true;
    booking.refundRequestedAt = new Date();
    booking.refundReason = reason;
    booking.paymentStatus = 'held'; // Hold payment until review
    await booking.save();

    res.json({ 
      success: true, 
      data: booking,
      message: 'Refund request submitted. We will review and respond within 24 hours.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate if booking is overdue
    const scheduledDate = new Date(booking.scheduledDate);
    const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const graceTime = new Date(scheduledDateTime.getTime() + 30 * 60000); // 30 minutes
    const now = new Date();
    
    const isOverdue = now > graceTime && ['assigned', 'on-the-way'].includes(booking.status);
    const canReportNoShow = isOverdue;
    const minutesOverdue = isOverdue ? Math.floor((now - graceTime) / (1000 * 60)) : 0;
    
    // Check if booking is upcoming (within next 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60000);
    const isUpcoming = scheduledDateTime > now && scheduledDateTime <= twoHoursFromNow;
    
    res.json({ 
      success: true, 
      data: {
        ...booking.toObject(),
        isOverdue,
        canReportNoShow,
        minutesOverdue,
        isUpcoming,
        scheduledDateTime: scheduledDateTime.toISOString(),
        graceTime: graceTime.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOverdueBookings = async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      status: { $in: ['assigned', 'on-the-way'] },
      scheduledDate: { $lte: now }
    });

    const overdueBookings = bookings.filter(booking => {
      const scheduledDate = new Date(booking.scheduledDate);
      const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      const graceTime = new Date(scheduledDateTime.getTime() + 30 * 60000);
      return now > graceTime;
    });

    res.json({ success: true, data: overdueBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Automatic booking status updates
exports.updateBookingStatuses = async () => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60000);
    
    // Find bookings that are starting within 2 hours
    const upcomingBookings = await Booking.find({
      status: 'assigned',
      scheduledDate: { $lte: twoHoursFromNow, $gte: now }
    });

    for (const booking of upcomingBookings) {
      const scheduledDate = new Date(booking.scheduledDate);
      const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      // If booking is within 2 hours, notify both parties
      if (scheduledDateTime <= twoHoursFromNow && scheduledDateTime > now) {
        if (global.io) {
          global.io.to(booking.userId).emit('booking_reminder', {
            ...booking.toObject(),
            message: 'Your booking is starting soon!'
          });
          
          if (booking.taskerId) {
            global.io.to(booking.taskerId).emit('booking_reminder', {
              ...booking.toObject(),
              message: 'You have an upcoming booking!'
            });
          }
        }
      }
    }

    // Auto-mark overdue bookings (optional - for admin visibility)
    const overdueBookings = await Booking.find({
      status: { $in: ['assigned', 'on-the-way'] }
    });

    for (const booking of overdueBookings) {
      const scheduledDate = new Date(booking.scheduledDate);
      const [hours, minutes] = booking.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      const graceTime = new Date(scheduledDateTime.getTime() + 30 * 60000);
      
      // If more than 2 hours overdue, mark as potentially problematic
      const twoHoursOverdue = new Date(graceTime.getTime() + 2 * 60 * 60000);
      if (now > twoHoursOverdue) {
        // Could add a flag or send admin notification
        console.log(`Booking ${booking._id} is significantly overdue`);
      }
    }

  } catch (error) {
    console.error('Error updating booking statuses:', error);
  }
};

// Call this function periodically (e.g., every 15 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(exports.updateBookingStatuses, 15 * 60 * 1000); // Every 15 minutes
}