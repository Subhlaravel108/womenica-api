import nodemailer from 'nodemailer';
import fs from 'fs'
import path from "path"
import { fileURLToPath } from 'url';

const _filename=fileURLToPath(import.meta.url);
const _dirname= path.dirname(_filename)

const emailHeader=fs.readFileSync(path.join(_dirname,'../templates/header.html'),'utf-8');
const emailFooterTemplate=fs.readFileSync(path.join(_dirname,'../templates/footer.html'),'utf-8');

// Replace placeholder with current year
const emailFooter = emailFooterTemplate.replace('{{CURRENT_YEAR}}', new Date().getFullYear());

export const createTransporter = () => {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
    }

    if(process.env.EMAIL_HOST && process.env.EMAIL_PORT)
    {
    console.log('Using custom SMTP:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER
    });

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })
}
    else {
        console.log("Using Gmail service");
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Womenica" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Verification Code - Womenica',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Womenica</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 0 !important;
              }
              .content {
                padding: 20px !important;
              }
              .otp-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
                padding: 20px !important;
              }
              .otp-container {
                padding: 20px !important;
                margin: 20px 0 !important;
              }
              .security-notice {
                padding: 16px !important;
              }
              .instructions {
                padding: 20px !important;
              }
              .next-steps {
                padding: 20px !important;
              }
              .support-section {
                padding: 16px !important;
              }
              h2 {
                font-size: 22px !important;
              }
              h3 {
                font-size: 18px !important;
              }
              p {
                font-size: 14px !important;
              }
              li {
                margin-bottom: 8px !important;
                font-size: 14px !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-stack {
                display: block !important;
              }
              .mobile-padding {
                padding: 12px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          ${emailHeader}
          <div class="container" style="max-width: 600px; margin: 0 auto; background: white;">
            <div class="content" style="padding: 40px;">

              <!-- Welcome Header -->
              <div style="text-align: center; margin-bottom: 30px;" class="mobile-center">
                <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
                  Verify Your Email Address
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  Welcome to Womenica! Use the code below to complete your registration.
                </p>
              </div>

              <!-- OTP Code Section -->
              <div class="otp-container" style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 32px; margin: 30px 0; text-align: center;">
                <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;" class="mobile-center">
                  Your Verification Code
                </h3>
                <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 28px; border-radius: 16px; display: inline-block; margin: 16px 0; box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3); max-width: 100%;">
                  <div class="otp-code" style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 700; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); word-break: break-all; overflow-wrap: break-word;">
                    ${otp}
                  </div>
                </div>
                <p style="color: #dc2626; margin: 16px 0 0 0; font-size: 14px; font-weight: 600;" class="mobile-center">
                  ⏰ Expires in 10 minutes
                </p>
              </div>

              <!-- Instructions -->
              <div class="instructions" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;" class="mobile-stack mobile-center">
                  <span style="margin-right: 12px;">📱</span>
                  How to Verify Your Account
                </h3>
                <ol style="color: #0369a1; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Return to the verification page</li>
                  <li style="margin-bottom: 8px;">Enter the 6-digit code shown above</li>
                  <li style="margin-bottom: 8px;">Click "Verify Email" to complete registration</li>
                  <li>Start shopping amazing products!</li>
                </ol>
              </div>

              <!-- Security Notice -->
              <div class="security-notice" style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; align-items: start; gap: 12px;" class="mobile-stack">
                  <div style="background: #d97706; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; align-self: center;">
                    <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; text-align: center;" class="mobile-center">
                      Important Security Information
                    </h4>
                    <ul style="color: #92400e; margin: 0; padding-left: 16px; line-height: 1.5; font-size: 14px;">
                      <li style="margin-bottom: 6px;">This code is for your registration only</li>
                      <li style="margin-bottom: 6px;">Never share your verification code with anyone</li>
                      <li style="margin-bottom: 6px;">Our team will never ask for this code</li>
                      <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps" style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                  What's Next After Verification?
                </h4>
                <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">
                  Once verified, you'll get access to exclusive deals,<br class="desktop-only">
                  personalized recommendations, and 24/7 customer support!
                </p>
              </div>

              <!-- Support Section -->
              <div class="support-section" style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                <p style="color: #475569; margin: 0; font-size: 14px;">
                  Need help? Contact us at 
                  <a href="mailto:codermat@gmail.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                    codermat@gmail.com
                  </a>
                </p>
              </div>

            </div>
          </div>
          ${emailFooter}
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};


export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Womenica" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔒 Password Reset Code - Womenica',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Womenica</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 0 !important;
              }
              .content {
                padding: 20px !important;
              }
              .reset-code {
                font-size: 28px !important;
                letter-spacing: 6px !important;
                padding: 20px !important;
              }
              .reset-container {
                padding: 20px !important;
                margin: 20px 0 !important;
              }
              .instructions {
                padding: 20px !important;
              }
              .security-warning {
                padding: 16px !important;
              }
              .support-info {
                padding: 16px !important;
              }
              h2 {
                font-size: 22px !important;
              }
              h3 {
                font-size: 18px !important;
              }
              h4 {
                font-size: 16px !important;
              }
              p {
                font-size: 14px !important;
              }
              li {
                margin-bottom: 8px !important;
                font-size: 14px !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-stack {
                display: block !important;
              }
              .mobile-full-width {
                width: 100% !important;
                display: block !important;
              }
              .mobile-padding {
                padding: 12px !important;
              }
              .mobile-margin {
                margin: 8px 0 !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          ${emailHeader}
          <div class="container" style="max-width: 600px; margin: 0 auto; background: white;">
            <div class="content" style="padding: 40px;">

              <!-- Security Header -->
              <div style="text-align: center; margin-bottom: 30px;" class="mobile-center">
                <h2 style="color: #1e293b; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
                  Password Reset Request
                </h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  We received a request to reset your password for your Womenica account.
                </p>
              </div>

              <!-- Reset Code Section -->
              <div class="reset-container" style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 32px; margin: 30px 0; text-align: center;">
                <h3 style="color: #475569; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;" class="mobile-center">
                  Your Security Code
                </h3>
                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 24px; border-radius: 12px; display: inline-block; margin: 16px 0; max-width: 100%; box-sizing: border-box;">
                  <div class="reset-code" style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: white; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); word-break: break-all; overflow-wrap: break-word;">
                    ${resetToken}
                  </div>
                </div>
                <p style="color: #ef4444; margin: 16px 0 0 0; font-size: 14px; font-weight: 600;" class="mobile-center">
                  ⏰ Expires in 10 minutes
                </p>
              </div>

              <!-- Instructions -->
              <div class="instructions" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;" class="mobile-stack mobile-center">
                  <span style="margin-right: 12px;">📝</span>
                  How to Use This Code
                </h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Return to the password reset page</li>
                  <li style="margin-bottom: 8px;">Enter the 6-digit code above</li>
                  <li style="margin-bottom: 8px;">Create your new password</li>
                  <li>Login with your new credentials</li>
                </ol>
              </div>

              <!-- Security Warning -->
              <div class="security-warning" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <div style="display: flex; align-items: start; gap: 12px;" class="mobile-stack">
                  <div style="background: #dc2626; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; align-self: center;">
                    <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
                  </div>
                  <div style="flex: 1;">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; text-align: center;" class="mobile-center">
                      Security Alert
                    </h4>
                    <ul style="color: #b91c1c; margin: 0; padding-left: 16px; line-height: 1.5; font-size: 14px;">
                      <li style="margin-bottom: 6px;">Never share this code with anyone</li>
                      <li style="margin-bottom: 6px;">Our team will never ask for your code</li>
                      <li style="margin-bottom: 6px;">This code expires in 15 minutes for security</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Support Info -->
              <div class="support-info" style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 12px;">
                <p style="color: #475569; margin: 0; font-size: 14px;">
                  Need help? Contact our support team at 
                  <a href="mailto:codermat@gmail.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                    codermat@gmail.com
                  </a>
                </p>
              </div>

            </div>
          </div>
          ${emailFooter}
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending reset password email:", error);
    return { success: false, error: error.message };
  }
};