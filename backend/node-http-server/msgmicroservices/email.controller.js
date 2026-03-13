const nodemailer = require('nodemailer');
const OTP = require('./otp.schema');
require('dotenv').config();

console.log('🔥 MAIN SERVER EMAIL CONTROLLER LOADED');
console.log('📧 Email config:', process.env.EMAIL);
console.log('🔑 Password length:', process.env.EMAILSECRET?.length);

// Create transporter with better error handling
let transporter = nodemailer.createTransport({
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

// Test connection after a delay
setTimeout(() => {
  if (transporter) {
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter error:', error.message);
      } else {
        console.log('✅ Main server email transporter ready');
      }
    });
  }
}, 2000);



const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpStore = new Map();

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    console.log('\n=== OTP GENERATED ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('====================\n');
    
    // Store OTP first
    otpStore.set(email, { otp, expiresAt });

    try {
      await OTP.deleteMany({ email });
      await OTP.create({ email, otp, expiresAt: new Date(expiresAt) });
      console.log('💾 OTP saved to database');
    } catch (err) {
      console.log('DB save failed:', err.message);
    }

    // Send response immediately
    res.json({ message: 'OTP sent successfully' });
    
    // Send email in background (non-blocking)
    console.log('📧 SENDING EMAIL TO:', email);
    console.log('🔑 Using email:', process.env.EMAIL);
    
    const mailOptions = {
      from: `"Naija-Repair" <${process.env.EMAIL}>`,
      to: email,
      subject: '🔧 Naija-Repair - Your Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Naija-Repair Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #14b8a6 0%, #059669 50%, #0891b2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: 'Montserrat', 'Poppins', sans-serif;">🔧 Naija•Repair</h1>
              <p style="color: #e6fffa; margin: 10px 0 0 0; font-size: 16px; font-family: 'Inter', sans-serif; letter-spacing: 0.2em; text-transform: uppercase;">Expert Services</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Email Verification</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                Welcome to Naija-Repair! Please use the verification code below to complete your registration:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border: 3px solid #0d9488; border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #0d9488; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Verification Code</p>
                <h1 style="color: #0d9488; font-size: 42px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
              </div>
              
              <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px; text-align: center; font-weight: 500;">
                  ⏰ This code will expire in <strong>10 minutes</strong>
                </p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
                If you didn't request this verification code, please ignore this email or contact our support team.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); padding: 20px 30px; text-align: center; border-top: 1px solid #a7f3d0;">
              <p style="color: #0d9488; margin: 0; font-size: 12px; font-weight: 500;">
                © 2024 Naija-Repair. All rights reserved.<br>
                Your trusted platform for quality repair services in Nigeria.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email asynchronously without blocking the response
    transporter.sendMail(mailOptions)
      .then(info => {
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📤 Response:', info.response);
      })
      .catch(emailError => {
        console.error('❌ EMAIL SENDING FAILED:', emailError.message);
        // Email failed but user can still proceed with OTP from logs/database
      });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('Verifying OTP for', email, '- Received:', otp);

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    let stored = otpStore.get(email);
    console.log('Memory lookup:', stored ? 'Found' : 'Not found');

    if (!stored) {
      try {
        console.log('Querying database for email:', email);
        console.log('OTP Model collection name:', OTP.collection.name);
        console.log('Database name:', OTP.db.name);
        const dbStored = await OTP.findOne({ email }).maxTimeMS(5000);
        console.log('DB query result:', dbStored);
        if (dbStored) {
          stored = { otp: dbStored.otp, expiresAt: dbStored.expiresAt.getTime() };
          console.log('DB lookup: Found - OTP:', dbStored.otp);
        } else {
          console.log('DB lookup: Not found');
          const allOtps = await OTP.find({}).limit(5);
          console.log('All OTPs in collection:', allOtps);
        }
      } catch (dbError) {
        console.log('DB lookup failed:', dbError.message);
      }
    }

    if (!stored) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      OTP.deleteOne({ email }).catch(() => {});
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpStore.delete(email);
    OTP.deleteOne({ email }).catch(() => {});
    console.log('✓ OTP verified');
    
    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};
