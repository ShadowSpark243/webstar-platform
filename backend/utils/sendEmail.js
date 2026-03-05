const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
      // Production Robustness: Strip accidental quotes, spaces, and ensure types
      const host = (process.env.SMTP_HOST || '').replace(/['"]+/g, '').trim();
      const port = parseInt((process.env.SMTP_PORT || '587').replace(/['"]+/g, '').trim(), 10);
      const user = (process.env.SMTP_USER || '').replace(/['"]+/g, '').trim();
      const pass = (process.env.SMTP_PASS || '').replace(/['"]+/g, '').trim();
      const fromEmail = (process.env.FROM_EMAIL || '').replace(/['"]+/g, '').trim();
      const fromName = (process.env.FROM_NAME || 'Webstar').replace(/['"]+/g, '').trim();

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
            },
            // Timeouts to prevent hanging
            connectionTimeout: 10000, // 10s
            greetingTimeout: 10000,   // 10s
            socketTimeout: 15000      // 15s
      });

      const message = {
            from: `${fromName} <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
      };

      try {
            await transporter.sendMail(message);
            console.log(`[EMAIL] Successfully sent to ${options.email}`);
      } catch (error) {
            console.error(`[EMAIL ERROR] Failed to send to ${options.email}:`, error.message);
            throw error; // Re-throw to be caught by the controller
      }
};

module.exports = sendEmail;
