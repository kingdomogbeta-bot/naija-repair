const Notification = require('./notification.schema');

exports.createNotification = async (req, res) => {
  try {
    const { userId, userEmail, type, title, message, bookingId } = req.body;

    if (!userId || !userEmail || !type || !title || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const notification = await Notification.create({
      userId,
      userEmail,
      type,
      title,
      message,
      bookingId
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
