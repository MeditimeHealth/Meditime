import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL?.trim(),
    pass: process.env.SMTP_PASSWORD?.trim(),
  },
});

console.log("Email Transporter initialized with user:", process.env.SMTP_EMAIL?.trim());
if (!process.env.SMTP_PASSWORD) {
  console.error("CRITICAL: SMTP_PASSWORD is not defined in .env");
}

export const sendOTP = async (to: string, otp: string, name: string) => {
  const mailOptions = {
    from: `"Medi Time" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "Your Password Reset Code - Medi Time",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background-color: #019A98;
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .content {
            padding: 40px 32px;
            color: #334155;
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .otp-container {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 32px;
            border: 1px dashed #cbd5e1;
          }
          .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #019A98;
            letter-spacing: 8px;
            margin: 0;
          }
          .warning {
            font-size: 14px;
            color: #64748b;
            text-align: center;
            line-height: 1.5;
            background-color: #fffbeb;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #fbbf24;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MEDI TIME</h1>
          </div>
          <div class="content">
            <div class="greeting">Hello, ${name}!</div>
            <div class="message">
              We received a request to reset your password for your Medi Time account. 
              Please use the verification code below to complete the process.
            </div>
            
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> This code will expire in 10 minutes. 
              If you did not request a password reset, please ignore this email or contact support immediately.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Medi Time. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
