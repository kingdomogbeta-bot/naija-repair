const User = require('./user.schema');
const UserPreferences = require('./userPreferences.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:8000/api/email';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWTSECRET, { expiresIn: '30d' });
};

const sendOTP = async (email) => {
  try {
    console.log('\n🔄 Sending OTP request to email service...');
    console.log('📧 Email:', email);
    console.log('🌐 Service URL:', EMAIL_SERVICE_URL);
    
    const response = await fetch(`${EMAIL_SERVICE_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('✅ Response OK:', response.ok);
    
    if (response.ok) {
      const result = await response.text();
      console.log('📨 Email service response:', result);
      console.log('✅ OTP sent successfully!');
    } else {
      const error = await response.text();
      console.log('❌ Email service error:', error);
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Failed to send OTP:', error);
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

    console.log('\n🔔 SEND VERIFICATION CODE REQUEST');
    console.log('📧 Email requested:', email);

    if (!email || !email.trim()) {
      console.log('❌ Email validation failed');
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🚀 Calling email service...');
    const sent = await sendOTP(email.trim());
    
    if (!sent) {
      console.log('❌ Email service failed');
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    console.log('✅ Verification code sent successfully!');
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('❌ Send verification error:', error);
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

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        phone: 'N/A',
        password: await bcrypt.hash(Math.random().toString(36), 10),
        photoUrl: picture || '',
        googleAuth: true
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photoUrl: user.photoUrl || picture,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    console.log('POST /register:', { name, email, phone, password: '***' });

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

    const userExists = await User.findOne({ email: email.trim() });
    if (userExists) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name: name.trim(), 
      email: email.trim(), 
      phone: phone.trim(), 
      password: hashedPassword 
    });

    console.log('User created successfully:', user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photoUrl: user.photoUrl,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const photoUrl = req.file.path;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { photoUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, photoUrl, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log('Delete photo request received for user:', userId);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { photoUrl: 1 } },
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User photo deleted successfully:', user._id);
    res.json({ success: true, message: 'Photo deleted successfully', data: user });
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

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let prefs = await UserPreferences.findOne({ userId });
    if (!prefs) {
      prefs = await UserPreferences.create({ userId });
    }
    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId },
      req.body,
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
