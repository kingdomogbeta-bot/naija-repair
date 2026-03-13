const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');

console.log('🔥 EMAIL CONTROLLER LOADED - NEW VERSION');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create transporter with IPv4 fix
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILSECRET
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

exports.sendOTP = async (req, res) => {
  console.log('🚨 SEND OTP FUNCTION CALLED - THIS IS THE NEW VERSION');
  
  try {
    const { email } = req.body;
    console.log('📧 Email received:', email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('\n=== OTP GENERATED ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('====================\n');

    // For now, skip email sending and just save OTP to database
    // This allows testing while we fix email issues
    console.log('⚠️ SKIPPING EMAIL SEND - SAVING OTP TO DATABASE ONLY');
    console.log('🔑 Your OTP is:', otp, '(Check server logs)');
    
    // Save to database
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    console.log('💾 OTP saved to database');

    res.json({ 
      message: 'OTP generated successfully. Check server logs for OTP code.',
      debug: process.env.NODE_ENV !== 'production' ? { otp } : undefined
    });
  } catch (error) {
    console.error('❌ OTP GENERATION ERROR:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ message: 'Failed to generate OTP: ' + error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const stored = await OTP.findOne({ email });
    if (!stored) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (Date.now() > stored.expiresAt.getTime()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await OTP.deleteOne({ email });
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};