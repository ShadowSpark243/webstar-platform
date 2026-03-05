const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
      // Clean environment variables
      const smtpHost = (process.env.SMTP_HOST || '').replace(/['"]+/g, '').trim();
      const smtpPort = parseInt((process.env.SMTP_PORT || '587').replace(/['"]+/g, '').trim(), 10);
      const smtpUser = (process.env.SMTP_USER || '').replace(/['"]+/g, '').trim();
      const smtpPass = (process.env.SMTP_PASS || '').replace(/['"]+/g, '').trim();
      const fromEmail = (process.env.FROM_EMAIL || '').replace(/['"]+/g, '').trim();
      const fromName = (process.env.FROM_NAME || 'Webstar').replace(/['"]+/g, '').trim();

      if (!smtpPass && !smtpHost) {
            console.warn(`[DEVELOPMENT MODE] Email not sent to ${options.email}. Logged below:`);
            console.log(`================ EMAIL CONTENT ================`);
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`\n${options.message}`);
            console.log(`===============================================`);
            return;
      }

      // ── Strategy 1: Use Resend HTTP API (Works on Railway/cloud platforms) ──
      // If SMTP_HOST is smtp.resend.com and SMTP_PASS is a Resend API key,
      // use the HTTP API instead of SMTP to bypass blocked ports.
      if (smtpHost === 'smtp.resend.com' && smtpPass.startsWith('re_')) {
            console.log(`[EMAIL] Using Resend HTTP API to send to ${options.email}`);

            const response = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                        'Authorization': `Bearer ${smtpPass}`,
                        'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                        from: `${fromName} <${fromEmail}>`,
                        to: [options.email],
                        subject: options.subject,
                        html: options.message
                  })
            });

            const data = await response.json();

            if (!response.ok) {
                  console.error(`[EMAIL ERROR] Resend API failed:`, data);
                  throw new Error(data.message || 'Resend API error');
            }

            console.log(`[EMAIL] Successfully sent to ${options.email} via Resend API (ID: ${data.id})`);
            return;
      }

      // ── Strategy 2: Fallback to Nodemailer SMTP (Works on local/non-restricted servers) ──
      console.log(`[EMAIL] Using SMTP to send to ${options.email} via ${smtpHost}:${smtpPort}`);

      const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                  user: smtpUser,
                  pass: smtpPass
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
      });

      const message = {
            from: `${fromName} <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
      };

      try {
            await transporter.sendMail(message);
            console.log(`[EMAIL] Successfully sent to ${options.email} via SMTP`);
      } catch (error) {
            console.error(`[EMAIL ERROR] SMTP failed to send to ${options.email}:`, error.message);
            throw error;
      }
};

module.exports = sendEmail;
