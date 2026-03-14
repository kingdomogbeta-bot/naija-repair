const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');

const transporter = nodemailer.createTransport({
  host: 'smtp.kepler.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.KEPLER_USER,
    pass: process.env.KEPLER_PASS
  }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });
    console.log('💾 OTP saved to database');
    console.log('📧 Sending email to:', email);

    await transporter.sendMail({
      from: '"Naija Repair" <kingdomogbeta@gmail.com>',
      to: email,
      subject: 'Naija-Repair Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Naija-Repair Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0fdfa; border: 2px solid #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0d9488; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666;">This code expires in 10 minutes.</p>
        </div>
      `
    });

    console.log('✅ Email sent successfully via Kepler');
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ Send OTP error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const stored = await OTP.findOne({ email });
    if (!stored) return res.status(400).json({ message: 'OTP not found or expired' });

    if (Date.now() > stored.expiresAt.getTime()) {
      await OTP.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    await OTP.deleteOne({ email });
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};
