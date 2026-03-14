const { SafetyReport, Tracking } = require('./safety.schema');
const Notification = require('../notification/notification.schema');
const User = require('../user/user.schema');

const notifyAdmin = async (title, message, bookingId) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Notification.create({
        userId: admin._id.toString(),
        userEmail: admin.email,
        type: 'system',
        title,
        message,
        bookingId,
        read: false
      });
    }
  } catch (e) {
    console.error('Failed to notify admin:', e.message);
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await SafetyReport.create({
      ...req.body,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      userPhone: req.user.phone
    });
    if (global.io) global.io.emit('safety_report_created', report);
    await notifyAdmin(
      '⚠️ New Safety Report',
      `${req.user.name} (${req.user.phone || req.user.email}) reported an issue for booking #${req.body.bookingId}`,
      req.body.bookingId
    );
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await SafetyReport.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await SafetyReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (global.io) {
      global.io.emit('safety_report_updated', report);
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startTracking = async (req, res) => {
  try {
    const tracking = await Tracking.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ bookingId: req.params.bookingId });
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.endTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findOneAndUpdate(
      { bookingId: req.params.bookingId },
      { status: 'completed', endTime: new Date() },
      { new: true }
    );
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendEmergencyAlert = async (req, res) => {
  try {
    const { bookingId, location, message } = req.body;
    const report = await SafetyReport.create({
      bookingId,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      userPhone: req.user.phone,
      type: 'EMERGENCY',
      description: message || 'Emergency alert triggered',
      location,
      priority: 'high',
      status: 'emergency'
    });
    if (global.io) global.io.emit('emergency_alert', report);
    await notifyAdmin(
      '🚨 EMERGENCY ALERT',
      `EMERGENCY from ${req.user.name} (${req.user.phone || req.user.email}) - Booking #${bookingId}`,
      bookingId
    );
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
