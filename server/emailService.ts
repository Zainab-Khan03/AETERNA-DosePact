// server/emailService.ts
import 'dotenv/config';
import nodemailer from 'nodemailer';

// ============================================================
// CONFIGURATION
// ============================================================

const EMAIL_USER = process.env.EMAIL_USER?.trim() || '';
const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || '';
const SMTP_HOST = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);



const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// ============================================================
// GENERATE VERIFICATION CODE
// ============================================================

export function generateVerificationCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// ============================================================
// VERIFY SMTP CONNECTION
// ============================================================

export async function verifyEmailConnection(): Promise<boolean> {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('[EMAIL ERROR] EMAIL_USER or EMAIL_PASS is missing from .env');
    return false;
  }

  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] SMTP connection failed:', error);
    return false;
  }
}

// ============================================================
// GENERIC SEND EMAIL FUNCTION
// ============================================================

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('[EMAIL ERROR] EMAIL_USER or EMAIL_PASS is not configured');
    return false;
  }

  if (!to) {
    console.error('[EMAIL ERROR] Recipient email address is missing');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"AETERNA DosePact" <${EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html,
    });

    console.log(`[EMAIL SUCCESS] Sent email to ${to}, Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error);
    return false;
  }
}

// ============================================================
// WELCOME EMAIL
// ============================================================

export async function sendWelcomeEmail(
  to: string,
  firstName: string
): Promise<boolean> {
  const subject = 'Welcome to AETERNA DosePact';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AETERNA DosePact</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f2ed;
  font-family: Arial, Helvetica, sans-serif;
">

  <div style="
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
  ">

    <!-- Header -->
    <div style="
      background-color: #292521;
      padding: 32px;
      text-align: center;
    ">
      <h1 style="
        margin: 0;
        color: #ffffff;
        font-size: 28px;
      ">
        AETERNA DosePact
      </h1>

      <p style="
        margin: 8px 0 0;
        color: #d9d2c8;
        font-size: 14px;
      ">
        Medication Adherence Hub
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">

      <h2 style="
        margin-top: 0;
        color: #292521;
      ">
        Welcome, ${firstName}!
      </h2>

      <p style="
        font-size: 16px;
        line-height: 1.6;
        color: #444;
      ">
        Thank you for creating your AETERNA DosePact account.
      </p>

      <p style="
        font-size: 16px;
        line-height: 1.6;
        color: #444;
      ">
        AETERNA DosePact helps you keep track of your medications,
        schedules, reminders, and adherence.
      </p>

      <div style="
        margin: 32px 0;
        padding: 20px;
        background-color: #f5f2ed;
        border-radius: 10px;
      ">
        <p style="
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          color: #444;
        ">
          Your account is now ready to use.
        </p>
      </div>

      <p style="
        font-size: 14px;
        line-height: 1.6;
        color: #6b655f;
      ">
        If you did not create this account, please contact support.
      </p>

    </div>

    <!-- Footer -->
    <div style="
      padding: 24px 32px;
      background-color: #f5f2ed;
      text-align: center;
    ">
      <p style="
        margin: 0;
        font-size: 12px;
        color: #77716b;
      ">
        AETERNA DosePact — Medication Adherence Hub
      </p>

      <p style="
        margin: 8px 0 0;
        font-size: 12px;
        color: #77716b;
      ">
        This is an automated message. Please do not reply.
      </p>
    </div>

  </div>

</body>
</html>
`;

  const text = `
AETERNA DosePact

Welcome, ${firstName}!

Thank you for creating your AETERNA DosePact account.

Your account is now ready to use.

AETERNA DosePact — Medication Adherence Hub
`;

  return sendEmail(to, subject, html, text);
}

// ============================================================
// ACCOUNT DELETION VERIFICATION CODE EMAIL
// ============================================================

export async function sendAccountDeletionCodeEmail(
  to: string,
  code: number
): Promise<boolean> {
  console.log('[EMAIL] Sending account deletion code to:', to);
  console.log('[EMAIL] Verification code:', code);

  const subject = '[ACTION REQUIRED] Account Deletion Verification Code — AETERNA DosePact';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deletion Verification</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f2ed;
  font-family: Arial, Helvetica, sans-serif;
  color: #292521;
">

  <div style="
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  ">

    <!-- Header -->
    <div style="
      background-color: #292521;
      padding: 32px;
      text-align: center;
    ">
      <h1 style="
        margin: 0;
        color: #ffffff;
        font-size: 28px;
        letter-spacing: 1px;
      ">
        AETERNA DosePact
      </h1>

      <p style="
        margin: 8px 0 0;
        color: #d9d2c8;
        font-size: 14px;
      ">
        Medication Adherence Hub
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">

      <h2 style="
        margin-top: 0;
        font-size: 22px;
        color: #292521;
      ">
        Account Deletion Verification
      </h2>

      <p style="
        font-size: 16px;
        line-height: 1.6;
        color: #444;
      ">
        We received a request to permanently delete your
        AETERNA DosePact account.
      </p>

      <p style="
        font-size: 16px;
        line-height: 1.6;
        color: #444;
      ">
        To verify this action, please enter the 6-digit code below:
      </p>

      <!-- Verification Code Box -->
      <div style="
        margin: 32px 0;
        padding: 24px;
        background-color: #f5f2ed;
        border-radius: 10px;
        text-align: center;
        border: 2px dashed #292521;
      ">
        <p style="
          margin: 0 0 10px;
          font-size: 13px;
          color: #77716b;
          text-transform: uppercase;
          letter-spacing: 2px;
        ">
          Your Verification Code
        </p>

        <div style="
          font-size: 48px;
          font-weight: bold;
          letter-spacing: 15px;
          color: #292521;
          font-family: 'Courier New', monospace;
        ">
          ${code.toString().padStart(6, '0')}
        </div>

        <p style="
          margin: 10px 0 0;
          font-size: 12px;
          color: #77716b;
        ">
          This code expires in 10 minutes
        </p>
      </div>

      <div style="
        margin-top: 24px;
        padding: 16px;
        background-color: #fff4e5;
        border-radius: 8px;
        border-left: 4px solid #d89b45;
      ">
        <strong style="color: #292521;">⚠️ Security Notice</strong>

        <p style="
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: #555;
        ">
          If you did not request account deletion, please ignore
          this email. Your account will remain active.
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="
      padding: 24px 32px;
      background-color: #f5f2ed;
      text-align: center;
    ">
      <p style="
        margin: 0;
        font-size: 12px;
        color: #77716b;
      ">
        This is an automated message from AETERNA DosePact.
      </p>

      <p style="
        margin: 8px 0 0;
        font-size: 12px;
        color: #77716b;
      ">
        Please do not reply to this email.
      </p>
    </div>

  </div>

</body>
</html>
  `;

  const text = `
AETERNA DosePact

ACCOUNT DELETION VERIFICATION

Your verification code is:

${code.toString().padStart(6, '0')}

Enter this code in the AETERNA DosePact app to confirm
account deletion.

If you did not request account deletion, you can safely
ignore this email.

This is an automated message. Please do not reply.
  `;

  return sendEmail(to, subject, html, text);
}

// ============================================================
// ACCOUNT DELETION CONFIRMATION EMAIL
// ============================================================

export async function sendAccountDeletionConfirmationEmail(
  to: string
): Promise<boolean> {
  const subject = 'Account Deletion Confirmed — AETERNA DosePact';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deleted</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f5f2ed;
  font-family: Arial, Helvetica, sans-serif;
  color: #292521;
">

  <div style="
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
  ">

    <div style="
      background-color: #292521;
      padding: 32px;
      text-align: center;
    ">
      <h1 style="
        margin: 0;
        color: #ffffff;
      ">
        AETERNA DosePact
      </h1>
    </div>

    <div style="padding: 40px 32px;">

      <h2>Account Successfully Deleted</h2>

      <p style="
        font-size: 16px;
        line-height: 1.6;
      ">
        Your AETERNA DosePact account has been permanently deleted
        as requested.
      </p>

      <p style="
        font-size: 16px;
        line-height: 1.6;
      ">
        All your medication data, schedules, and personal
        information have been removed from our system.
      </p>

      <div style="
        margin: 24px 0;
        padding: 16px;
        background-color: #f5f2ed;
        border-radius: 8px;
        border-left: 4px solid #d89b45;
      ">
        <strong>Important</strong>

        <p style="
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.5;
        ">
          If you did not request this deletion, please contact
          support immediately.
        </p>
      </div>

    </div>

    <div style="
      padding: 24px 32px;
      background-color: #f5f2ed;
      text-align: center;
    ">
      <p style="
        margin: 0;
        font-size: 12px;
        color: #77716b;
      ">
        AETERNA DosePact — Medication Adherence Hub
      </p>
    </div>

  </div>

</body>
</html>
  `;

  const text = `
AETERNA DosePact

ACCOUNT DELETED

Your AETERNA DosePact account has been permanently deleted
as requested.

All your medication data, schedules, and personal information
have been removed from our system.

If you did not request this deletion, please contact support
immediately.
  `;

  return sendEmail(to, subject, html, text);
}

// ============================================================
// ACCOUNT DELETED FINAL EMAIL (alias for confirmation)
// ============================================================

export async function sendAccountDeletedFinalEmail(
  to: string
): Promise<boolean> {
  return sendAccountDeletionConfirmationEmail(to);
}

// ============================================================
// PASSWORD RESET EMAIL
// ============================================================

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  const subject = 'Reset Your AETERNA DosePact Password';

  const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Password Reset</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f5f2ed;
    font-family: Arial, Helvetica, sans-serif;
    color: #292521;
  "
>

  <div
    style="
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    "
  >

    <div
      style="
        background: #292521;
        padding: 32px;
        text-align: center;
      "
    >
      <h1
        style="
          margin: 0;
          color: #ffffff;
        "
      >
        AETERNA DosePact
      </h1>
    </div>

    <div style="padding: 40px 32px;">

      <h2>Reset Your Password</h2>

      <p
        style="
          font-size: 16px;
          line-height: 1.6;
        "
      >
        We received a request to reset the password associated
        with your AETERNA DosePact account.
      </p>

      <div
        style="
          text-align: center;
          margin: 32px 0;
        "
      >

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background: #292521;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>

      </div>

      <p
        style="
          font-size: 14px;
          line-height: 1.6;
          color: #6b655f;
        "
      >
        If you did not request a password reset, you can safely
        ignore this email.
      </p>

    </div>

    <div
      style="
        padding: 24px;
        background: #f5f2ed;
        text-align: center;
      "
    >
      <p
        style="
          margin: 0;
          font-size: 12px;
          color: #77716b;
        "
      >
        AETERNA DosePact — Medication Adherence Hub
      </p>
    </div>

  </div>

</body>
</html>
`;

  const text = `
AETERNA DosePact

RESET YOUR PASSWORD

We received a request to reset your password.

Use the following link:

${resetUrl}

If you did not request this password reset, you can safely ignore this email.
`;

  return sendEmail(to, subject, html, text);
}

// ============================================================
// EMAIL VERIFICATION EMAIL
// ============================================================

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<boolean> {
  const subject = 'Verify Your AETERNA DosePact Account';

  const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Verify Email</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f5f2ed;
    font-family: Arial, Helvetica, sans-serif;
    color: #292521;
  "
>

  <div
    style="
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    "
  >

    <div
      style="
        background: #292521;
        padding: 32px;
        text-align: center;
      "
    >

      <h1
        style="
          margin: 0;
          color: #ffffff;
        "
      >
        AETERNA DosePact
      </h1>

    </div>

    <div style="padding: 40px 32px;">

      <h2>Verify Your Email Address</h2>

      <p
        style="
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Thank you for creating an AETERNA DosePact account.
        Please verify your email address to activate your account.
      </p>

      <div
        style="
          text-align: center;
          margin: 32px 0;
        "
      >

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background: #292521;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Verify Email Address
        </a>

      </div>

      <p
        style="
          font-size: 14px;
          line-height: 1.6;
          color: #6b655f;
        "
      >
        If you did not create this account, you can safely ignore
        this email.
      </p>

    </div>

    <div
      style="
        padding: 24px;
        background: #f5f2ed;
        text-align: center;
      "
    >

      <p
        style="
          margin: 0;
          font-size: 12px;
          color: #77716b;
        "
      >
        AETERNA DosePact — Medication Adherence Hub
      </p>

    </div>

  </div>

</body>
</html>
`;

  const text = `
AETERNA DosePact

VERIFY YOUR EMAIL

Thank you for creating an AETERNA DosePact account.

Verify your email address here:

${verificationUrl}

If you did not create this account, you can safely ignore this email.
`;

  return sendEmail(to, subject, html, text);
}

// ============================================================
// EXPORT TRANSPORTER
// ============================================================

export { transporter };