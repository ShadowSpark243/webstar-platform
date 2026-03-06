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
            const role = referralCode === process.env.ADMIN_SECRET_CODE || referralCode === 'ITRAM_WEBPRO_ADMIN_XYZ' ? 'ADMIN' : 'USER';
            const kycStatus = role === 'ADMIN' ? 'VERIFIED' : 'UNVERIFIED';

            // 6. Create the User or Admin in the respective table
            let newUser;

            if (role === 'ADMIN') {
                  newUser = await prisma.admin.create({
                        data: {
                              fullName,
                              email,
                              username,
                              phone,
                              password: hashedPassword,
                              referralCode: newReferralCode
                        }
                  });
            } else {
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

            // 1. Find User or Admin by email or username
            let user = await prisma.user.findFirst({
                  where: {
                        OR: [
                              { email: loginId },
                              { username: loginId }
                        ]
                  }
            });

            if (!user) {
                  user = await prisma.admin.findFirst({
                        where: {
                              OR: [
                                    { email: loginId },
                                    { username: loginId }
                              ]
                        }
                  });
            }

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
                        [user.role === 'ADMIN' ? 'adminId' : 'userId']: user.id,
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
            let user = await prisma.user.findFirst({
                  where: {
                        OR: [
                              { email: loginId },
                              { username: loginId }
                        ]
                  }
            });

            let isUserAdmin = false;
            if (!user) {
                  user = await prisma.admin.findFirst({
                        where: {
                              OR: [
                                    { email: loginId },
                                    { username: loginId }
                              ]
                        }
                  });
                  isUserAdmin = !!user;
            }

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

            if (isUserAdmin) {
                  await prisma.admin.update({
                        where: { id: user.id },
                        data: {
                              resetPasswordToken,
                              resetPasswordExpires
                        }
                  });
            } else {
                  await prisma.user.update({
                        where: { id: user.id },
                        data: {
                              resetPasswordToken,
                              resetPasswordExpires
                        }
                  });
            }

            // 5. Create reset url
            // IMPORTANT: Ensure FRONTEND_URL is set to your live domain (e.g., https://vidzonaa.in) in your production dashboard (Railway/Render)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            const message = `
                  <div style="font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050608; padding: 60px 20px; color: #f8fafc; line-height: 1.5;">
                        <div style="max-width: 540px; margin: 0 auto; background-color: #0a0b0e; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);">
                              
                              <!-- Header Accent -->
                              <div style="height: 6px; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
                              
                              <div style="padding: 45px 35px;">
                                    <!-- Brand Logo/Name -->
                                    <div style="margin-bottom: 35px; text-align: center;">
                                          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1.5px; color: #ffffff; text-transform: uppercase;">
                                                ITRAM <span style="color: #f59e0b;">WEBPRO</span>
                                          </h1>
                                          <div style="width: 40px; height: 2px; background: #f59e0b; margin: 15px auto 0;"></div>
                                    </div>

                                    <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 20px; text-align: center;">Secure Account Recovery</h2>
                                    
                                    <p style="font-size: 15px; color: #94a3b8; margin-bottom: 30px; text-align: center;">
                                          We received a request to reset your password. To proceed with setting up a new one, click the secure verification button below.
                                    </p>

                                    <!-- Action Button -->
                                    <div style="text-align: center; margin-bottom: 35px;">
                                          <a href="${resetUrl}" style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 15px; font-weight: 700; text-decoration: none; padding: 18px 45px; border-radius: 12px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.35); transition: transform 0.2s;">
                                                Reset My Password
                                          </a>
                                    </div>

                                    <!-- Fallback Link -->
                                    <div style="background-color: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                                          <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Direct Link</p>
                                          <a href="${resetUrl}" style="font-size: 13px; color: #3b82f6; text-decoration: none; word-break: break-all; opacity: 0.8;">
                                                ${resetUrl}
                                          </a>
                                    </div>

                                    <p style="font-size: 13px; color: #475569; text-align: center; margin-bottom: 0;">
                                          If you didn't request this, you can safely ignore this email. This link will expire in <b>10 minutes</b>.
                                    </p>
                              </div>

                              <!-- Footer Text -->
                              <div style="background-color: #050608; padding: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                                    <p style="margin: 0; font-size: 12px; color: #4b5563; font-weight: 500;">
                                          &copy; ${new Date().getFullYear()} ITRAM WEBPRO. All rights reserved.
                                    </p>
                              </div>
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
                  if (isUserAdmin) {
                        await prisma.admin.update({
                              where: { id: user.id },
                              data: {
                                    resetPasswordToken: null,
                                    resetPasswordExpires: null
                              }
                        });
                  } else {
                        await prisma.user.update({
                              where: { id: user.id },
                              data: {
                                    resetPasswordToken: null,
                                    resetPasswordExpires: null
                              }
                        });
                  }

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
            let user = await prisma.user.findFirst({
                  where: {
                        resetPasswordToken,
                        resetPasswordExpires: { gt: new Date() }
                  }
            });

            let isUserAdmin = false;
            if (!user) {
                  user = await prisma.admin.findFirst({
                        where: {
                              resetPasswordToken,
                              resetPasswordExpires: { gt: new Date() }
                        }
                  });
                  isUserAdmin = !!user;
            }

            if (!user) {
                  return res.status(400).json({ success: false, message: 'Invalid token or token expired' });
            }

            // 3. Set new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            if (isUserAdmin) {
                  await prisma.admin.update({
                        where: { id: user.id },
                        data: {
                              password: hashedPassword,
                              resetPasswordToken: null,
                              resetPasswordExpires: null
                        }
                  });
            } else {
                  await prisma.user.update({
                        where: { id: user.id },
                        data: {
                              password: hashedPassword,
                              resetPasswordToken: null,
                              resetPasswordExpires: null
                        }
                  });
            }

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

            const admin = await prisma.admin.create({
                  data: {
                        fullName: 'Super Admin',
                        email: 'admin@itramwebpro.com',
                        password: hashedPassword,
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        referralCode: 'WS-ADMINX'
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
            let user;
            if (req.user.role === 'ADMIN') {
                  user = await prisma.admin.findUnique({
                        where: { id: req.user.id },
                        select: {
                              id: true,
                              fullName: true,
                              email: true,
                              username: true,
                              phone: true,
                              role: true,
                              status: true,
                              referralCode: true,
                              createdAt: true
                        }
                  });
            } else {
                  user = await prisma.user.findUnique({
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
            }

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

            let user;
            if (req.user.role === 'ADMIN') {
                  user = await prisma.admin.findUnique({ where: { id: req.user.id } });
            } else {
                  user = await prisma.user.findUnique({ where: { id: req.user.id } });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                  return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            if (req.user.role === 'ADMIN') {
                  await prisma.admin.update({
                        where: { id: req.user.id },
                        data: { password: hashedPassword }
                  });
            } else {
                  await prisma.user.update({
                        where: { id: req.user.id },
                        data: { password: hashedPassword }
                  });
            }

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
                  where: { [req.user.role === 'ADMIN' ? 'adminId' : 'userId']: req.user.id },
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

            const isOwner = req.user.role === 'ADMIN' ? session?.adminId === req.user.id : session?.userId === req.user.id;
            if (!session || !isOwner) {
                  return res.status(404).json({ success: false, message: 'Session not found.' });
            }

            await prisma.session.delete({ where: { id: parseInt(sessionId) } });
            res.status(200).json({ success: true, message: 'Session revoked.' });
      } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to revoke session.' });
      }
};

