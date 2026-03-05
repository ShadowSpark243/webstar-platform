const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
      // Check if SMTP is configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.warn(`[DEVELOPMENT MODE] Email not sent to ${options.email}. Logged below:`);
            console.log(`================ EMAIL CONTENT ================`);
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`\n${options.message}`);
            console.log(`===============================================`);
            return;
      }

      const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS
            }
      });

      const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
      };

      await transporter.sendMail(message);
};

module.exports = sendEmail;
