const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');

console.log('🔥 EMAIL CONTROLLER LOADED - NEW VERSION');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILSECRET
  },
  tls: {
    rejectUnauthorized: false
  }
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

    // ACTUALLY SEND THE EMAIL
    console.log('📧 ATTEMPTING TO SEND EMAIL...');
    console.log('From:', process.env.EMAIL);
    console.log('To:', email);
    console.log('App Password Length:', process.env.EMAILSECRET?.length);
    
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Naija-Repair Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Naija-Repair Verification</h2>
          <p style="font-size: 16px;">Your verification code is:</p>
          <div style="background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 4px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);

    // Save to database
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    console.log('💾 OTP saved to database');

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ EMAIL SENDING ERROR:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
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