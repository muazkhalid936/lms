require("dotenv").config();
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

exports.generateOTP = () => crypto.randomInt(100000, 999999).toString();

exports.sendOTPViaEmail = async (email, otp) => {
  try {
    //console.log("🔄 Creating SMTP transporter...");

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT),
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    });

    // Verify connection configuration
    await transporter.verify();
    //console.log("✅ SMTP connection verified");

    const mailOptions = {
      from: `Dreams LMS <${EMAIL_FROM || EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #FF9800; text-align: center; margin: 20px 0; padding: 15px; background: #FFF3E0; border-radius: 5px; letter-spacing: 5px; border: 2px dashed #FFB74D; }
            .content { color: #333; line-height: 1.6; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
            .warning { color: #FF9800; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your OTP Verification Code</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Use the following One-Time Password (OTP) to verify your identity:</p>
              <div class="otp-code">${otp}</div>
              <p>This code is valid for <strong class="warning">5 minutes</strong>. Please do not share this code with anyone.</p>
              <p>If you didn't request this verification, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>For security reasons, this code will expire shortly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    //console.log("📤 Sending OTP email...");
    const result = await transporter.sendMail(mailOptions);
    //console.log("✅ OTP email sent successfully");
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    return { success: false, error: error.message };
  }
};
