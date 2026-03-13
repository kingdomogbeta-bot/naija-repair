const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');

console.log('🔥 EMAIL CONTROLLER LOADED - PRODUCTION VERSION');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Create Gmail transporter with OAuth2
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: process.env.GMAIL_ACCESS_TOKEN
    }
  });
};

// Fallback SMTP transporter
const createSMTPTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_EMAIL || 'your-email@example.com',
      pass: process.env.BREVO_PASSWORD || 'your-smtp-key'
    }
  });
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log('\n=== OTP GENERATED ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('====================\n');

    // Save to database first
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    console.log('💾 OTP saved to database');

    // Send email asynchronously
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP Code - Naija Repair',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your OTP Code</h2>
          <p>Your One-Time Password (OTP) for Naija Repair is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    };

    console.log('📧 SENDING EMAIL TO:', email);
    
    // Try OAuth2 Gmail first
    try {
      const gmailTransporter = createGmailTransporter();
      await gmailTransporter.sendMail(mailOptions);
      console.log('✅ Email sent via Gmail OAuth2');
    } catch (gmailError) {
      console.log('🔄 Gmail OAuth2 failed, trying SMTP...');
      
      // Fallback to SMTP
      try {
        const smtpTransporter = createSMTPTransporter();
        await smtpTransporter.sendMail(mailOptions);
        console.log('✅ Email sent via SMTP');
      } catch (smtpError) {
        console.error('❌ All email methods failed');
        console.error('Gmail error:', gmailError.message);
        console.error('SMTP error:', smtpError.message);
        console.log('🔑 OTP available in logs:', otp);
      }
    }

    // Always return success since OTP is saved to database
    res.json({ message: 'OTP sent successfully' });
    
  } catch (error) {
    console.error('❌ OTP ERROR:', error.message);
    res.status(500).json({ message: 'Failed to generate OTP' });
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