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
      subject: 'Your Naija Repair Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f0fdfa;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,148,136,0.10);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#14b8a6 0%,#0d9488 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:1px;">🔧 Naija Repair</h1>
                      <p style="margin:8px 0 0;color:#ccfbf1;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Verification Code</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 24px;color:#134e4a;font-size:16px;text-align:center;">Use the code below to verify your account. It expires in <strong>10 minutes</strong>.</p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <div style="display:inline-block;background:linear-gradient(135deg,#f0fdfa,#ccfbf1);border:2px solid #14b8a6;border-radius:12px;padding:28px 48px;margin:8px 0;">
                              <p style="margin:0 0 6px;color:#0d9488;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your OTP</p>
                              <p style="margin:0;color:#0d9488;font-size:44px;font-weight:900;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;text-align:center;">If you didn't request this, please ignore this email.</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f0fdfa;padding:20px 40px;text-align:center;border-top:1px solid #99f6e4;">
                      <p style="margin:0;color:#0d9488;font-size:12px;">© 2024 Naija Repair · Your trusted repair platform in Nigeria</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
