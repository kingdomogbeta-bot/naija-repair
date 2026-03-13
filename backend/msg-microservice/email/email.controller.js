const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');

console.log('🔥 EMAIL CONTROLLER LOADED - BACK TO GMAIL');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Simple Gmail transporter with timeout
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILSECRET
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,     // 5 seconds  
  socketTimeout: 10000       // 10 seconds
});

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

    // Save to database
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    console.log('💾 OTP saved to database');

    console.log('📧 SENDING EMAIL TO:', email);
    console.log('🔑 Using email:', process.env.EMAIL);
    console.log('🔐 App password length:', process.env.EMAILSECRET ? process.env.EMAILSECRET.length : 'NOT SET');

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

    console.log('🚀 ATTEMPTING TO SEND EMAIL...');
    console.log('📧 Mail options:', JSON.stringify(mailOptions, null, 2));
    
    try {
      console.log('⏰ Starting email send at:', new Date().toISOString());
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ EMAIL SENT SUCCESSFULLY');
      console.log('📬 Message ID:', info.messageId);
      console.log('📤 Response:', info.response);
    } catch (emailError) {
      console.error('❌ EMAIL SEND FAILED:');
      console.error('Error code:', emailError.code);
      console.error('Error message:', emailError.message);
      console.error('Error response:', emailError.response);
      console.error('Error responseCode:', emailError.responseCode);
      console.error('Command:', emailError.command);
      console.error('Full error:', JSON.stringify(emailError, null, 2));
      console.log('🔑 OTP available in logs:', otp);
    }
    
    console.log('⏰ Email send attempt completed at:', new Date().toISOString());

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