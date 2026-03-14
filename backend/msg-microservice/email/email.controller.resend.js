const { Resend } = require('resend');
const OTP = require('./otp.schema');

console.log('🔥 EMAIL CONTROLLER LOADED - USING RESEND');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Test Resend connection on startup
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend API key configured');
} else {
  console.error('❌ RESEND_API_KEY not found in environment variables');
}

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

    console.log('📧 SENDING EMAIL VIA RESEND TO:', email);

    try {
      const { data, error } = await resend.emails.send({
        from: 'Naija Repair <noreply@resend.dev>', // Use resend.dev domain for testing
        to: [email],
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
      });

      if (error) {
        console.error('❌ RESEND ERROR:', error);
        console.log('🔑 OTP available in logs:', otp);
        return res.status(500).json({ 
          message: 'Failed to send email, but OTP generated. Check server logs.',
          otp: otp // Remove this in production
        });
      }

      console.log('✅ EMAIL SENT SUCCESSFULLY VIA RESEND!');
      console.log('📨 Email ID:', data.id);
      
    } catch (emailError) {
      console.error('❌ EMAIL SENDING ERROR:', emailError.message);
      console.log('🔑 OTP available in logs:', otp);
      return res.status(500).json({ 
        message: 'Failed to send email, but OTP generated. Check server logs.',
        otp: otp // Remove this in production
      });
    }

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