const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

// Registration Logic
exports.register = async (req, res) => {
      try {
            const { fullName, email, phone, password, username, referralCode } = req.body;

            // 1. Check if user already exists
            const existingUser = await prisma.user.findFirst({
                  where: {
                        OR: [{ email }, { phone }, { username }]
                  }
            });

            if (existingUser) {
                  const errors = [];
                  if (existingUser.email === email) errors.push({ path: 'email', msg: 'This email is already registered.' });
                  if (existingUser.phone === phone) errors.push({ path: 'phone', msg: 'This phone number is already attached to another account.' });
                  if (existingUser.username === username) errors.push({ path: 'username', msg: 'This username is already taken. Please choose another.' });

                  return res.status(400).json({
                        success: false,
                        message: 'Please fix the errors below.',
                        fieldErrors: errors
                  });
            }

            // 2. Hash Password securely using bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 3. Generate unique Referral Code based on Username
            const newReferralCode = username.toUpperCase();

            // 4. Handle MLM Upliner logic if referralCode was submitted
            let referredById = null;
            let inviterCode = null;
            let inviter = null;

            if (referralCode && referralCode.trim() !== '') {
                  const upliner = await prisma.user.findUnique({
                        where: { referralCode }
                  });
                  if (upliner) {
                        referredById = upliner.id;
                        inviterCode = upliner.referralCode;
                        inviter = `${upliner.fullName} (@${upliner.username})`;
                  }
            }

            // 5. Determine Role based on Secret Referral Code
            const role = referralCode === process.env.ADMIN_SECRET_CODE || referralCode === 'WEBSTAR_ADMIN_XYZ' ? 'ADMIN' : 'USER';
            const kycStatus = role === 'ADMIN' ? 'VERIFIED' : 'UNVERIFIED';

            // 6. Create the User in Railway MySQL
            let newUser;

            if (role === 'ADMIN') {
                  // Admin accounts are always assigned ID 0 via raw SQL
                  await prisma.$executeRawUnsafe(`SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO'`);
                  await prisma.$executeRawUnsafe(
                        `INSERT INTO User (id, fullName, email, username, phone, password, referralCode, referredById, inviterCode, inviter, role, status, kycStatus, walletBalance, incomeBalance, totalInvested, teamVolume, \`rank\`, updatedAt)
                         VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE', 'VERIFIED', 0, 0, 0, 0, 'Starter', NOW())`,
                        fullName, email, username, phone, hashedPassword, newReferralCode,
                        referredById, inviterCode, inviter
                  );
                  newUser = await prisma.user.findUnique({ where: { email } });
            } else {
                  // Regular users get sequential auto-increment IDs starting from 1
                  newUser = await prisma.user.create({
                        data: {
                              fullName,
                              email,
                              username,
                              phone,
                              password: hashedPassword,
                              referralCode: newReferralCode,
                              referredById,
                              inviterCode,
                              inviter,
                              role,
                              kycStatus
                        }
                  });
            }

            // --- Trigger initial Network Level tracking ---
            const networkStats = require('../utils/networkStats');
            await networkStats.updateUpliners(newUser.id, { isNewUser: true });

            // 7. Generate JWT Token
            const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
                  expiresIn: '7d'
            });

            // 7. Remove password before sending to frontend
            const { password: _, ...userWithoutPassword } = newUser;

            res.status(201).json({
                  success: true,
                  token,
                  user: userWithoutPassword
            });

      } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({ success: false, message: 'Server error during registration.' });
      }
};

// Login Logic
exports.login = async (req, res) => {
      try {
            const { loginId, password } = req.body;

            // 1. Find User by email or username
            const user = await prisma.user.findFirst({
                  where: {
                        OR: [
                              { email: loginId },
                              { username: loginId }
                        ]
                  }
            });

            if (!user) {
                  return res.status(404).json({ success: false, message: 'Invalid credentials. User not found.' });
            }

            // 2. Check Password (bcrypt only — plaintext passwords are not supported)
            let isMatch = false;
            isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                  return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
            }

            // 3. Generate JWT Token
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
                  expiresIn: '7d'
            });

            // 4. Create Session record
            await prisma.session.create({
                  data: {
                        userId: user.id,
                        token,
                        ip: req.ip || req.headers['x-forwarded-for'],
                        device: req.headers['user-agent']
                  }
            }).catch(e => console.error('Session creation failed:', e.message));

            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json({
                  success: true,
                  token,
                  user: userWithoutPassword
            });

      } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ success: false, message: 'Server error during login.' });
      }
};

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Forgot Password Logic
exports.forgotPassword = async (req, res) => {
      try {
            const { loginId } = req.body;

            // 1. Find the user by email or username
            const user = await prisma.user.findFirst({
                  where: {
                        OR: [
                              { email: loginId },
                              { username: loginId }
                        ]
                  }
            });

            if (!user) {
                  return res.status(404).json({ success: false, message: 'User not found with that email or username.' });
            }

            // 2. Generate Reset Token
            const resetToken = crypto.randomBytes(20).toString('hex');

            // 3. Hash token and set to resetPasswordToken field
            const resetPasswordToken = crypto
                  .createHash('sha256')
                  .update(resetToken)
                  .digest('hex');

            // 4. Set token expire (10 mins)
            const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.user.update({
                  where: { id: user.id },
                  data: {
                        resetPasswordToken,
                        resetPasswordExpires
                  }
            });

            // 5. Create reset url
            // IMPORTANT: Ensure FRONTEND_URL is set to your live domain (e.g., https://vidzonaa.in) in your production dashboard (Railway/Render)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            const message = `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0A0D14; color: #f8fafc; padding: 40px 20px; text-align: center; line-height: 1.6;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 40px 30px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin-bottom: 10px; letter-spacing: 2px;">WEB<span style="color: #f59e0b;">STAR</span></h1>
                              <p style="color: #9ca3af; font-size: 16px; margin-bottom: 30px;">Secure Account Recovery</p>
                              
                              <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 15px; text-align: left; margin-bottom: 30px; border-radius: 4px;">
                                    <p style="margin: 0; color: #d1d5db; font-size: 15px;">We received a request to reset the password for your WEBSTAR account. If you made this request, click the secure link below to create a new password.</p>
                              </div>

                              <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">Reset My Password</a>

                              <p style="color: #9ca3af; font-size: 13px; margin-bottom: 30px; word-break: break-all;">
                                    Or copy and paste this link into your browser:<br>
                                    <a href="${resetUrl}" style="color: #3b82f6; text-decoration: underline;">${resetUrl}</a>
                              </p>

                              <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
                              <p style="color: #4b5563; font-size: 12px; margin-top: 30px; border-top: 1px solid #1f2937; padding-top: 20px;">
                                    This link will expire in 10 minutes for your security.<br>
                                    &copy; ${new Date().getFullYear()} WEBSTAR. All rights reserved.
                              </p>
                        </div>
                  </div>
            `;

            try {
                  await sendEmail({
                        email: user.email,
                        subject: 'Password reset token',
                        message
                  });

                  res.status(200).json({ success: true, message: 'Email sent' });
            } catch (err) {
                  console.error(err);
                  await prisma.user.update({
                        where: { id: user.id },
                        data: {
                              resetPasswordToken: null,
                              resetPasswordExpires: null
                        }
                  });

                  return res.status(500).json({ success: false, message: 'Email could not be sent' });
            }
      } catch (error) {
            console.error('Forgot Password Error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
      }
};

// Reset Password
exports.resetPassword = async (req, res) => {
      try {
            // 1. Get hashed token
            const resetPasswordToken = crypto
                  .createHash('sha256')
                  .update(req.params.resetToken)
                  .digest('hex');

            // 2. Find user by token and check expiry
            const user = await prisma.user.findFirst({
                  where: {
                        resetPasswordToken,
                        resetPasswordExpires: { gt: new Date() }
                  }
            });

            if (!user) {
                  return res.status(400).json({ success: false, message: 'Invalid token or token expired' });
            }

            // 3. Set new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            await prisma.user.update({
                  where: { id: user.id },
                  data: {
                        password: hashedPassword,
                        resetPasswordToken: null,
                        resetPasswordExpires: null
                  }
            });

            res.status(200).json({
                  success: true,
                  message: 'Password has been reset successfully. Please login with your new password.',
            });

      } catch (error) {
            console.error('Reset Password Error:', error);
            res.status(500).json({ success: false, message: 'Server error resetting password.' });
      }
};

// Setup the Super Admin First Run function
exports.createSuperAdmin = async (req, res) => {
      try {
            const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            if (existingAdmin) {
                  return res.status(400).json({ message: 'Super Admin already exists.' });
            }

            // Must use bcrypt to hash the default password!
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);

            const admin = await prisma.user.create({
                  data: {
                        fullName: 'Super Admin',
                        email: 'admin@webstar.com',
                        password: hashedPassword,
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        kycStatus: 'VERIFIED',
                        referralCode: 'WS-ADMINX',
                        walletBalance: 100000000 // 100 Million for testing
                  }
            });

            res.status(201).json({ success: true, message: 'Super Admin created.', admin });
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
}

// Fetch Current Logged-in User Profile
exports.getMe = async (req, res) => {
      try {
            const user = await prisma.user.findUnique({
                  where: { id: req.user.id },
                  select: {
                        id: true,
                        fullName: true,
                        email: true,
                        username: true,
                        phone: true,
                        role: true,
                        status: true,
                        kycStatus: true,
                        walletBalance: true,
                        incomeBalance: true,
                        totalInvested: true,
                        teamVolume: true,
                        rank: true,
                        referralCode: true,
                        createdAt: true,
                        referredById: true,
                        inviterCode: true,
                        inviter: true,
                        kycDocuments: {
                              select: {
                                    status: true,
                                    rejectionReason: true
                              }
                        }
                  }
            });

            if (!user) {
                  return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ success: true, user });
      } catch (error) {
            res.status(500).json({ success: false, message: 'Server Error Fetching User' });
      }
};

// ── Change Password (from Profile) ──
exports.changePassword = async (req, res) => {
      try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                  return res.status(400).json({ success: false, message: 'Current and new password are required.' });
            }
            if (newPassword.length < 8) {
                  return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
            }

            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                  return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await prisma.user.update({
                  where: { id: req.user.id },
                  data: { password: hashedPassword }
            });

            res.status(200).json({ success: true, message: 'Password changed successfully.' });
      } catch (error) {
            console.error('Change Password Error:', error);
            res.status(500).json({ success: false, message: 'Failed to change password.' });
      }
};

// ── Get Active Sessions ──
exports.getSessions = async (req, res) => {
      try {
            const sessions = await prisma.session.findMany({
                  where: { userId: req.user.id },
                  orderBy: { lastActive: 'desc' }
            });
            res.status(200).json({ success: true, sessions });
      } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch sessions.' });
      }
};

// ── Revoke a Session ──
exports.revokeSession = async (req, res) => {
      try {
            const { sessionId } = req.params;
            const session = await prisma.session.findUnique({ where: { id: parseInt(sessionId) } });

            if (!session || session.userId !== req.user.id) {
                  return res.status(404).json({ success: false, message: 'Session not found.' });
            }

            await prisma.session.delete({ where: { id: parseInt(sessionId) } });
            res.status(200).json({ success: true, message: 'Session revoked.' });
      } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to revoke session.' });
      }
};

