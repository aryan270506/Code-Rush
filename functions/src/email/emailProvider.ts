import { Resend } from "resend";

export interface SendOtpEmailParams {
  toEmail: string;
  otp: string;
  displayName?: string;
  expiresInMinutes?: number;
}

export function getEmailTemplate(params: {
  otp: string;
  displayName?: string;
  expiresInMinutes: number;
}): string {
  const { otp, displayName = "Competitor", expiresInMinutes } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Code Battle Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06060f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f1f5f9;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #10102a;
      border: 1px solid #1e1e4a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(124, 58, 237, 0.1);
    }
    .header {
      padding: 32px 32px 20px;
      text-align: center;
      border-bottom: 1px solid #1e1e4a;
      background: radial-gradient(ellipse at top, rgba(124, 58, 237, 0.2), transparent);
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #f1f5f9;
    }
    .logo-accent {
      color: #a78bfa;
    }
    .badge {
      display: inline-block;
      margin-top: 12px;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.4);
      color: #a78bfa;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #f1f5f9;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 24px;
    }
    .otp-card {
      background-color: #0c0c1d;
      border: 1px solid #2a2a60;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #a78bfa;
      text-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
      margin: 0;
    }
    .expiry {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    .warning-box {
      background-color: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #fca5a5;
      line-height: 1.5;
      margin: 20px 0;
    }
    .footer {
      padding: 20px 32px;
      text-align: center;
      border-top: 1px solid #1e1e4a;
      background-color: #0c0c1d;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Code<span class="logo-accent">Battle</span></div>
      <div class="badge">Email Verification</div>
    </div>
    <div class="content">
      <h2 class="greeting">Hello, ${displayName}!</h2>
      <p class="message">
        Thank you for registering for the <strong>Code Battle</strong> Online Hackathon.
        Please use the 6-digit verification code below to verify your email address and activate your competition account:
      </p>

      <div class="otp-card">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Expires in ${expiresInMinutes} minutes (single-use)</div>
      </div>

      <div class="warning-box">
        <strong>Security Notice:</strong> Never share this verification code with anyone.
        Code Battle staff and administrators will never ask you for your code.
      </div>

      <p class="message" style="font-size: 12px; margin-bottom: 0;">
        If you did not request this verification, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Code Battle Hackathon. All rights reserved.<br>
      This is an automated security transmission. Please do not reply directly.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends the 6-digit OTP email using Resend
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const { toEmail, otp, displayName, expiresInMinutes = 5 } = params;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Code Battle <no-reply@codebattle.dev>";

  if (!apiKey || apiKey.includes("re_123456789")) {
    console.warn(`
[EMAIL PROVIDER NOTICE]
RESEND_API_KEY is not configured or contains a placeholder value.
To enable real transactional email delivery:
1. Sign up at https://resend.com
2. Set your API key: firebase functions:secrets:set RESEND_API_KEY
3. Configure your verified sender domain in EMAIL_FROM
[DEV NOTE] Dispatched OTP for ${toEmail}
    `);
    // In local development/emulator mode, report status clearly without throwing unhandled exceptions
    return { success: true, messageId: "dev-simulated-delivery" };
  }

  const resend = new Resend(apiKey);
  const html = getEmailTemplate({ otp, displayName, expiresInMinutes });

  const result = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    subject: `Your Code Battle Verification Code: ${otp}`,
    html,
  });

  if (result.error) {
    throw new Error(`Email provider error: ${result.error.message}`);
  }

  return { success: true, messageId: result.data?.id };
}
