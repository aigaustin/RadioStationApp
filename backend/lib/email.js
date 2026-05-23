const nodemailer = require('nodemailer');

/**
 * Sends an email using SMTP if configured globally, otherwise mocks the email via console.
 * @param {Object} globalConfig - The global tenant configuration object containing SMTP settings.
 * @param {Object} options - Email options { to, subject, text, html }
 */
async function sendEmail(globalConfig, options) {
  const host = globalConfig?.smtpHost;
  const port = globalConfig?.smtpPort;
  const user = globalConfig?.smtpUser;
  const pass = globalConfig?.smtpPassword;
  const from = globalConfig?.smtpFrom || 'noreply@radiostation.app';

  if (host && port && user && pass) {
    // Real SMTP transport
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass }
    });

    try {
      await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      console.log(`[Email] Sent real email to ${options.to}`);
    } catch (err) {
      console.error(`[Email] Failed to send email to ${options.to}:`, err);
    }
  } else {
    // Mock email
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${options.to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html}`);
    console.log('------------------');
  }
}

module.exports = { sendEmail };
