const Tasker = require('./tasker.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Notification = require('../notification/notification.schema');

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:8000/api/email';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRET, { expiresIn: '30d' });
};

const sendOTP = async (email) => {
  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
};

const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch(`${EMAIL_SERVICE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
};

exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const sent = await sendOTP(email.trim());
    if (!sent) {
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!otp) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const verified = await verifyOTP(email.trim(), otp);
    if (!verified) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.json({ message: 'Verification code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, bio, services, hourlyRate, location, otp } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!bio || !bio.trim()) {
      return res.status(400).json({ message: 'Bio is required' });
    }
    if (!services || services.length === 0) {
      return res.status(400).json({ message: 'At least one service is required' });
    }
    if (!otp) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const taskerExists = await Tasker.findOne({ email: email.trim() });
    if (taskerExists) {
      return res.status(400).json({ message: 'Tasker already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const tasker = await Tasker.create({ 
      name: name.trim(), 
      email: email.trim(), 
      phone: phone.trim(), 
      password: hashedPassword,
      bio: bio.trim(),
      services,
      hourlyRate: hourlyRate || 3000,
      location: location || 'Lagos',
      approved: true, // Auto-approve new taskers
      verified: false // They can verify later
    });

    console.log('Tasker created successfully:', tasker._id);

    res.status(201).json({
      _id: tasker._id,
      name: tasker.name,
      email: tasker.email,
      phone: tasker.phone,
      bio: tasker.bio,
      services: tasker.services,
      hourlyRate: tasker.hourlyRate,
      location: tasker.location,
      verified: tasker.verified,
      approved: tasker.approved,
      token: generateToken(tasker._id)
    });
  } catch (error) {
    console.error('Tasker registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const tasker = await Tasker.findOne({ email });
    if (!tasker) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, tasker.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!tasker.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.json({
      _id: tasker._id,
      name: tasker.name,
      email: tasker.email,
      phone: tasker.phone,
      bio: tasker.bio,
      services: tasker.services,
      hourlyRate: tasker.hourlyRate,
      rating: tasker.rating,
      reviewCount: tasker.reviewCount,
      completedTasks: tasker.completedTasks,
      location: tasker.location,
      verified: tasker.verified,
      approved: tasker.approved,
      availability: tasker.availability,
      suspended: tasker.suspended,
      suspensionReason: tasker.suspensionReason,
      photoUrl: tasker.photoUrl,
      token: generateToken(tasker._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findById(taskerId).select('-password');
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }
    res.json(tasker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, services, hourlyRate, location, availability } = req.body;
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { name, phone, bio, services, hourlyRate, location, availability },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json(tasker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTaskers = async (req, res) => {
  try {
    const { state, lga, includeUnapproved } = req.query;
    let query = { isActive: { $ne: false }, suspended: { $ne: true } };
    
    // Only filter by approved status if not explicitly including unapproved
    if (!includeUnapproved || includeUnapproved !== 'true') {
      query.approved = { $ne: false };
    }
    
    if (state) {
      query.$or = [
        { state: state },
        { serviceStates: state }
      ];
    }
    
    if (lga && state) {
      query.$and = [
        { $or: [{ state: state }, { serviceStates: state }] },
        { $or: [{ lga: lga }, { serviceLGAs: lga }] }
      ];
    }
    
    const taskers = await Tasker.find(query).select('-password');
    console.log(`Found ${taskers.length} taskers with query:`, query, 'includeUnapproved:', includeUnapproved);
    console.log('Taskers:', taskers.map(t => ({ id: t._id, name: t.name, approved: t.approved, suspended: t.suspended, isActive: t.isActive })));
    res.json(taskers);
  } catch (error) {
    console.error('Get all taskers error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTaskersAdmin = async (req, res) => {
  try {
    console.log('Admin getAllTaskers called by user:', req.user._id || req.user.id);
    const taskers = await Tasker.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Admin: Found ${taskers.length} total taskers:`, taskers.map(t => ({ id: t._id, name: t.name, email: t.email, approved: t.approved, suspended: t.suspended })));
    res.json(taskers);
  } catch (error) {
    console.error('Get all taskers admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findById(taskerId).select('-password');
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }
    res.json(tasker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveTasker = async (req, res) => {
  try {
    const tasker = await Tasker.findByIdAndUpdate(
      req.params.id,
      { approved: true, verified: true },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ message: 'Tasker approved successfully', tasker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTasker = async (req, res) => {
  try {
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findByIdAndDelete(taskerId);
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }
    res.json({ message: 'Tasker account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.suspendTasker = async (req, res) => {
  try {
    const { reason } = req.body;
    const tasker = await Tasker.findByIdAndUpdate(
      req.params.id,
      { 
        suspended: true, 
        suspendedAt: new Date(),
        suspensionReason: reason || 'Suspended by admin'
      },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ success: true, message: 'Tasker suspended successfully', data: tasker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unsuspendTasker = async (req, res) => {
  try {
    const tasker = await Tasker.findByIdAndUpdate(
      req.params.id,
      { 
        suspended: false, 
        suspendedAt: null,
        suspensionReason: null
      },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ success: true, message: 'Tasker unsuspended successfully', data: tasker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const photoUrl = req.file.path;
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { photoUrl },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ success: true, photoUrl, data: tasker });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    console.log('Delete photo request received for tasker:', req.user._id || req.user.id);
    
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { $unset: { photoUrl: 1 } },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      console.log('Tasker not found:', taskerId);
      return res.status(404).json({ message: 'Tasker not found' });
    }

    console.log('Tasker photo deleted successfully:', tasker._id);
    res.json({ success: true, message: 'Photo deleted successfully', data: tasker });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findById(taskerId);
    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, tasker.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    tasker.password = await bcrypt.hash(newPassword, 10);
    await tasker.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitVerification = async (req, res) => {
  try {
    const { nin } = req.body;
    
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ message: 'Valid 11-digit NIN is required' });
    }
    
    if (!req.files || !req.files.ninPhoto || !req.files.passportPhoto) {
      return res.status(400).json({ message: 'Both NIN card photo and passport photo are required' });
    }

    const ninPhotoUrl = `/uploads/${req.files.ninPhoto[0].filename}`;
    const passportPhotoUrl = `/uploads/${req.files.passportPhoto[0].filename}`;
    const taskerId = req.user._id || req.user.id;
    const tasker = await Tasker.findByIdAndUpdate(
      taskerId,
      { nin, ninPhotoUrl, passportPhotoUrl, verificationStatus: 'pending' },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ success: true, message: 'Verification submitted successfully', data: tasker });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.approveVerification = async (req, res) => {
  try {
    const tasker = await Tasker.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'approved', verified: true },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    await Notification.create({
      userId: tasker._id.toString(),
      userEmail: tasker.email,
      type: 'verification',
      title: '🎉 Congratulations! Account Verified',
      message: 'After reviewing your details, your account has been approved. You are now a verified tasker on Naija Repair!'
    });

    res.json({ success: true, message: 'Verification approved', data: tasker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectVerification = async (req, res) => {
  try {
    const { reason } = req.body;
    const tasker = await Tasker.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', verified: false, verificationRejectionReason: reason },
      { returnDocument: 'after' }
    ).select('-password');

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.json({ success: true, message: 'Verification rejected', data: tasker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPendingTaskers = async (req, res) => {
  try {
    const taskers = await Tasker.find({ 
      approved: false, 
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });
    
    console.log(`Found ${taskers.length} pending taskers`);
    res.json(taskers);
  } catch (error) {
    console.error('Get pending taskers error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentTaskers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const taskers = await Tasker.find({ 
      isActive: true,
      suspended: false 
    }).select('-password')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`Found ${taskers.length} recent taskers`);
    res.json(taskers);
  } catch (error) {
    console.error('Get recent taskers error:', error);
    res.status(500).json({ message: error.message });
  }
};