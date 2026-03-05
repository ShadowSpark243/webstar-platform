const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
      // Production Robustness: Strip accidental quotes and ensure types
      const host = (process.env.SMTP_HOST || '').replace(/['"]+/g, '');
      const port = parseInt((process.env.SMTP_PORT || '587').replace(/['"]+/g, ''), 10);
      const user = (process.env.SMTP_USER || '').replace(/['"]+/g, '');
      const pass = (process.env.SMTP_PASS || '').replace(/['"]+/g, '');
      const fromEmail = (process.env.FROM_EMAIL || '').replace(/['"]+/g, '');
      const fromName = (process.env.FROM_NAME || 'Webstar').replace(/['"]+/g, '');

      if (!host || !user) {
            console.warn(`[DEVELOPMENT MODE] Email not sent to ${options.email}. Logged below:`);
            console.log(`================ EMAIL CONTENT ================`);
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`\n${options.message}`);
            console.log(`===============================================`);
            return;
      }

      console.log(`[EMAIL] Attempting to send to ${options.email} via ${host}:${port} (Secure: ${port === 465})`);

      const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for 587/others
            auth: {
                  user,
                  pass
            }
      });

      const message = {
            from: `${fromName} <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
      };

      await transporter.sendMail(message);
      console.log(`[EMAIL] Successfully sent to ${options.email}`);
};

module.exports = sendEmail;
