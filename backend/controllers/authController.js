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
                  return res.status(400).json({ success: false, message: 'Email, Phone, or Username already registered.' });
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
                        `INSERT INTO User (id, fullName, email, username, phone, password, referralCode, referredById, inviterCode, inviter, role, status, kycStatus, walletBalance, totalInvested, teamVolume, \`rank\`, updatedAt)
                         VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE', 'VERIFIED', 0, 0, 0, 'Starter', NOW())`,
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
            const { email, password } = req.body;

            // 1. Find User
            const user = await prisma.user.findUnique({
                  where: { email }
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
                        totalInvested: true,
                        teamVolume: true,
                        rank: true,
                        referralCode: true,
                        createdAt: true
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
