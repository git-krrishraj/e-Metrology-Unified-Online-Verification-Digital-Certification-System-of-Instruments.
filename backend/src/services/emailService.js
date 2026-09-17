import nodemailer from 'nodemailer';

let transporter = null;

export const initEmailTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate test Ethereal account if no production credentials
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✉️  Ethereal Test Mailer initialized: ${testAccount.user}`);
    } catch (err) {
      console.warn('⚠️  Could not initialize Ethereal mailer, falling back to console logger.');
    }
  }
};

/**
 * Dispatches an instrument verification expiry alert email
 */
export const sendExpiryAlertEmail = async ({ toEmail, ownerName, instrumentName, serialNumber, certId, validTill, daysRemaining }) => {
  const formattedDate = new Date(validTill).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const subject = `⚠️ Legal Metrology Notice: Certificate for ${instrumentName} (${serialNumber}) expires in ${daysRemaining} days`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #002b49; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">DIRECTORATE OF LEGAL METROLOGY</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">Government of India • e-Verification Portal</p>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Dear <strong>${ownerName || 'Instrument Owner'}</strong>,</p>
        <p>This is an automated statutory compliance reminder that the Legal Metrology Verification Certificate for your weighing/measuring instrument is approaching its expiry date.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Instrument:</strong> ${instrumentName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Serial Number:</strong> ${serialNumber}</p>
          <p style="margin: 0 0 8px 0;"><strong>Certificate Number:</strong> ${certId}</p>
          <p style="margin: 0 0 8px 0;"><strong>Expiry Date:</strong> <span style="color: #dc2626; font-weight: bold;">${formattedDate}</span></p>
          <p style="margin: 0;"><strong>Days Remaining:</strong> <span style="color: #dc2626; font-weight: bold;">${daysRemaining} Days</span></p>
        </div>

        <p style="color: #475569; font-size: 13px;">
          <strong>Important Statutory Warning:</strong> Under Section 24 & 30 of the Legal Metrology Act, 2009, using an unverified or expired measuring instrument in commercial transactions is a non-compoundable offence and may attract monetary penalties and seizure.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/consumer/instruments" 
             style="background-color: #0052cc; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Apply for Periodic Re-Verification
          </a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b;">
        This is a system generated notification. Please do not reply to this email.
      </div>
    </div>
  `;

  if (!transporter) {
    await initEmailTransporter();
  }

  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || '"e-Metrology Portal" <no-reply@metrology.gov.in>',
        to: toEmail,
        subject,
        html
      });
      console.log(`📧 Expiry email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
  }

  // Fallback log
  console.log(`[EMAIL DISPATCH SIMULATION] Subject: "${subject}" to ${toEmail}`);
  return { success: true, simulated: true };
};
