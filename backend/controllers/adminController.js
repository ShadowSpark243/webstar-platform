const prisma = require('../utils/db');
const { generatePresignedUrl } = require('../utils/s3');

// ----------------------------------------------------
// 1. GLOBAL METRICS (10k User Limit & Funding)
// ----------------------------------------------------
exports.getGlobalStats = async (req, res) => {
      try {
            const totalUsers = await prisma.user.count({ where: { role: 'USER' } });

            // Sum of all APPROVED DEPOSITS minus APPROVED WITHDRAWALS
            const totalDeposits = await prisma.transaction.aggregate({
                  _sum: { amount: true },
                  where: { type: 'DEPOSIT', status: 'APPROVED' }
            });

            const totalInvestments = await prisma.investment.aggregate({
                  _sum: { amount: true },
                  where: { status: 'ACTIVE' }
            });

            // 6-Month Funding Data
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1); // Start of that month

            const recentDeposits = await prisma.transaction.findMany({
                  where: { type: 'DEPOSIT', status: 'APPROVED', createdAt: { gte: sixMonthsAgo } },
                  select: { amount: true, createdAt: true }
            });

            const recentInvestments = await prisma.investment.findMany({
                  where: { status: 'ACTIVE', createdAt: { gte: sixMonthsAgo } },
                  select: { amount: true, createdAt: true }
            });

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const fundingDataMap = {};

            for (let i = 5; i >= 0; i--) {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i);
                  fundingDataMap[`${months[d.getMonth()]}`] = { name: months[d.getMonth()], deposits: 0, investments: 0, monthOffset: d.getMonth() + d.getFullYear() * 12 };
            }

            recentDeposits.forEach(tx => {
                  const m = months[new Date(tx.createdAt).getMonth()];
                  if (fundingDataMap[m]) fundingDataMap[m].deposits += tx.amount;
            });

            recentInvestments.forEach(inv => {
                  const m = months[new Date(inv.createdAt).getMonth()];
                  if (fundingDataMap[m]) fundingDataMap[m].investments += inv.amount;
            });

            const fundingData = Object.values(fundingDataMap).sort((a, b) => a.monthOffset - b.monthOffset).map(d => ({ name: d.name, deposits: d.deposits, investments: d.investments }));

            // 4-Week User Growth Data
            const fourWeeksAgo = new Date();
            fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

            const recentUsers = await prisma.user.findMany({
                  where: { role: 'USER', createdAt: { gte: fourWeeksAgo } },
                  select: { createdAt: true }
            });

            const userGrowthDataMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
            const nowTime = new Date().getTime();

            recentUsers.forEach(u => {
                  const diffDays = Math.floor((nowTime - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays <= 7) userGrowthDataMap['Week 4']++;
                  else if (diffDays <= 14) userGrowthDataMap['Week 3']++;
                  else if (diffDays <= 21) userGrowthDataMap['Week 2']++;
                  else if (diffDays <= 28) userGrowthDataMap['Week 1']++;
            });

            const userGrowthData = [
                  { name: 'Week 1', users: userGrowthDataMap['Week 1'] },
                  { name: 'Week 2', users: userGrowthDataMap['Week 2'] },
                  { name: 'Week 3', users: userGrowthDataMap['Week 3'] },
                  { name: 'Week 4', users: userGrowthDataMap['Week 4'] }
            ];

            res.status(200).json({
                  success: true,
                  users: {
                        total: totalUsers,
                        limit: 10000,
                        remaining: 10000 - totalUsers
                  },
                  funding: {
                        totalDeposited: totalDeposits._sum.amount || 0,
                        totalInvested: totalInvestments._sum.amount || 0
                  },
                  analytics: {
                        fundingData,
                        userGrowthData
                  }
            });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// ----------------------------------------------------
// 2. USER MANAGEMENT
// ----------------------------------------------------
exports.getAllUsers = async (req, res) => {
      try {
            const users = await prisma.user.findMany({
                  where: { role: 'USER' },
                  select: {
                        id: true,
                        fullName: true,
                        email: true,
                        username: true,
                        phone: true,
                        status: true,
                        kycStatus: true,
                        walletBalance: true,
                        teamVolume: true,
                        referralCode: true,
                        inviter: true,
                        createdAt: true
                  },
                  orderBy: { createdAt: 'desc' }
            });
            res.status(200).json({ success: true, users });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.getUserDetails = async (req, res) => {
      try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({
                  where: { id: parseInt(id) },
                  include: {
                        kycDocuments: true,
                        investments: {
                              include: {
                                    project: {
                                          select: { title: true, status: true, genre: true }
                                    }
                              },
                              orderBy: { createdAt: 'desc' }
                        },
                        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
                        networkLevelStats: { orderBy: { level: 'asc' } },
                        referrals: { select: { id: true, fullName: true, status: true, teamVolume: true } },
                        referredBy: { select: { fullName: true, username: true } }
                  }
            });

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // kycDocuments is a one-to-one relation (single object or null)
            // Wrap it into an array so the frontend can always use .map()
            let kycDocsArray = [];
            if (user.kycDocuments) {
                  const doc = user.kycDocuments;
                  if (doc.documentUrl) {
                        try {
                              const keyMatch = doc.documentUrl.split(`${process.env.S3_BUCKET_NAME}/`);
                              if (keyMatch.length > 1) {
                                    doc.presignedUrl = await generatePresignedUrl(keyMatch[1]);
                              }
                        } catch (e) {
                              console.error('Failed to presign KYC doc:', e);
                        }
                  }
                  kycDocsArray = [doc];
            }

            // Replace the single object with an array for frontend compatibility
            user.kycDocuments = kycDocsArray;

            // Calculate unique projects count for reporting
            const uniqueProjects = new Set(user.investments.map(inv => inv.projectId));
            user.uniqueProjectsCount = uniqueProjects.size;

            res.status(200).json({ success: true, user });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// "God Mode" Deep Edit
exports.updateUserWallet = async (req, res) => {
      try {
            const { id } = req.params;
            const { newBalance, reason } = req.body;

            const updatedUser = await prisma.user.update({
                  where: { id: parseInt(id) },
                  data: { walletBalance: parseFloat(newBalance) }
            });

            // Log this artificial intervention
            await prisma.transaction.create({
                  data: {
                        userId: parseInt(id),
                        type: 'DEPOSIT',
                        amount: parseFloat(newBalance), // Not totally accurate math-wise, but logs the change
                        status: 'APPROVED',
                        description: `Admin Override: ${reason || 'Manual Adjustment'}`
                  }
            });

            res.status(200).json({ success: true, user: updatedUser });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.updateUserStatus = async (req, res) => {
      try {
            const { id } = req.params;
            const { status } = req.body; // e.g., 'ACTIVE', 'BANNED'

            if (!['ACTIVE', 'BANNED'].includes(status)) {
                  return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updatedUser = await prisma.user.update({
                  where: { id: parseInt(id) },
                  data: { status }
            });

            res.status(200).json({ success: true, message: `User marked as ${status}`, user: updatedUser });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// ----------------------------------------------------
// 3. KYC PROCESSING
// ----------------------------------------------------
exports.getAllKyc = async (req, res) => {
      try {
            // Use a raw-safe approach: query docs first, then include user data
            // This prevents Prisma's "Inconsistent query result" crash on orphaned records
            const documents = await prisma.kycDocument.findMany({
                  orderBy: { createdAt: 'desc' }
            });

            // Manually attach user data and presigned URLs
            const enrichedDocs = [];
            for (const doc of documents) {
                  // Fetch user safely (may be null if orphaned)
                  const user = await prisma.user.findUnique({
                        where: { id: doc.userId },
                        select: { fullName: true, email: true, username: true, phone: true }
                  });

                  // Skip orphaned docs with no matching user
                  if (!user) continue;

                  // Generate presigned URL for the document
                  if (doc.documentUrl) {
                        try {
                              const keyMatch = doc.documentUrl.split(`${process.env.S3_BUCKET_NAME}/`);
                              if (keyMatch.length > 1) {
                                    doc.presignedUrl = await generatePresignedUrl(keyMatch[1]);
                              }
                        } catch (e) {
                              console.error('Failed to presign global KYC doc:', e);
                        }
                  }

                  doc.user = user;
                  enrichedDocs.push(doc);
            }

            res.status(200).json({ success: true, documents: enrichedDocs });
      } catch (error) {
            console.error('getAllKyc Error:', error);
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.reviewKyc = async (req, res) => {
      try {
            const { docId, status, rejectionReason } = req.body; // status must be 'VERIFIED' or 'REJECTED'

            const document = await prisma.kycDocument.update({
                  where: { id: parseInt(docId) },
                  data: {
                        status,
                        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                        reviewedBy: req.user.id,
                        reviewedAt: new Date()
                  }
            });

            // Also update the global User state
            await prisma.user.update({
                  where: { id: document.userId },
                  data: { kycStatus: status }
            });

            res.status(200).json({ success: true, message: `KYC ${status}` });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// ----------------------------------------------------
// 4. DEPOSIT APPROVALS (GLOBAL LEDGER)
// ----------------------------------------------------
exports.getPendingDeposits = async (req, res) => {
      try {
            const deposits = await prisma.transaction.findMany({
                  where: { type: 'DEPOSIT', status: 'PENDING' },
                  include: { user: { select: { fullName: true, email: true } } },
                  orderBy: { createdAt: 'asc' }
            });

            // Add presigned URLs for receipts
            for (const dep of deposits) {
                  if (dep.receiptUrl) {
                        try {
                              const keyMatch = dep.receiptUrl.split(`${process.env.S3_BUCKET_NAME}/`);
                              if (keyMatch.length > 1) {
                                    dep.receiptUrl = await generatePresignedUrl(keyMatch[1]);
                              }
                        } catch (e) {
                              console.error('Failed to presign deposit receipt:', e);
                        }
                  }
            }

            res.status(200).json({ success: true, deposits });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.reviewDeposit = async (req, res) => {
      try {
            const { transactionId, status, rejectionReason } = req.body; // 'APPROVED' or 'REJECTED'

            const tx = await prisma.transaction.update({
                  where: { id: parseInt(transactionId) },
                  data: {
                        status,
                        rejectionReason: status === 'REJECTED' ? rejectionReason : null
                  }
            });

            // If approved, actually fund the wallet and activate user
            if (status === 'APPROVED') {
                  const user = await prisma.user.findUnique({ where: { id: tx.userId } });

                  const newBalance = user.walletBalance + tx.amount;
                  const becomesActive = newBalance >= 100000 && user.status !== 'ACTIVE';

                  await prisma.user.update({
                        where: { id: tx.userId },
                        data: {
                              walletBalance: newBalance,
                              status: becomesActive ? 'ACTIVE' : user.status
                        }
                  });

                  if (becomesActive) {
                        const networkStats = require('../utils/networkStats');
                        await networkStats.updateUpliners(tx.userId, { isNewlyActive: true });
                  }
            }

            res.status(200).json({ success: true, message: `Deposit ${status}` });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// ----------------------------------------------------
// 5. GLOBAL NETWORK TREE
// ----------------------------------------------------
exports.getGlobalNetworkTree = async (req, res) => {
      try {
            const users = await prisma.user.findMany({
                  select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        referredById: true,
                        totalInvested: true,
                        teamVolume: true,
                        rank: true,
                        status: true,
                        kycStatus: true,
                        createdAt: true
                  }
            });

            const userMap = {};
            users.forEach(u => {
                  userMap[u.id] = { ...u, children: [] };
            });

            const tree = [];
            users.forEach(u => {
                  if (u.referredById && userMap[u.referredById]) {
                        userMap[u.referredById].children.push(userMap[u.id]);
                  } else {
                        tree.push(userMap[u.id]);
                  }
            });

            res.status(200).json({ success: true, tree });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.getAllTransactions = async (req, res) => {
      try {
            const transactions = await prisma.transaction.findMany({
                  include: { user: { select: { fullName: true, email: true, username: true } } },
                  orderBy: { createdAt: 'desc' },
                  take: 500 // Limit to prevent massive payload
            });

            // Add presigned URLs for receipts in ledger
            for (const tx of transactions) {
                  if (tx.receiptUrl) {
                        try {
                              const keyMatch = tx.receiptUrl.split(`${process.env.S3_BUCKET_NAME}/`);
                              if (keyMatch.length > 1) {
                                    tx.receiptUrl = await generatePresignedUrl(keyMatch[1]);
                              }
                        } catch (e) {
                              console.error('Failed to presign ledger receipt:', e);
                        }
                  }
            }

            res.status(200).json({ success: true, transactions });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// ----------------------------------------------------
// 6. PROJECT MANAGEMENT
// ----------------------------------------------------
exports.getAllProjects = async (req, res) => {
      try {
            const projects = await prisma.project.findMany({
                  include: {
                        _count: { select: { investments: true } },
                        investments: {
                              include: {
                                    user: {
                                          select: { id: true, fullName: true, username: true, email: true }
                                    }
                              },
                              orderBy: { createdAt: 'desc' }
                        }
                  },
                  orderBy: { createdAt: 'desc' }
            });
            res.status(200).json({ success: true, projects });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.createProject = async (req, res) => {
      try {
            const { title, description, genre, imageUrl, targetAmount, minInvestment, roiPercentage, durationMonths, status } = req.body;

            // Validation
            if (!title || !description || !genre || !targetAmount || !minInvestment || !roiPercentage || !durationMonths) {
                  return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
            }

            const project = await prisma.project.create({
                  data: {
                        title,
                        description,
                        genre,
                        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop',
                        targetAmount: parseFloat(targetAmount),
                        minInvestment: parseFloat(minInvestment),
                        roiPercentage: parseFloat(roiPercentage),
                        durationMonths: parseInt(durationMonths),
                        status: status || 'COMING_SOON'
                  }
            });

            res.status(201).json({ success: true, project, message: 'Project created successfully.' });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.updateProject = async (req, res) => {
      try {
            const { id } = req.params;
            const updateData = {};
            const allowed = ['title', 'description', 'genre', 'imageUrl', 'targetAmount', 'minInvestment', 'roiPercentage', 'durationMonths', 'status', 'raisedAmount'];

            for (const key of allowed) {
                  if (req.body[key] !== undefined) {
                        if (['targetAmount', 'minInvestment', 'roiPercentage', 'raisedAmount'].includes(key)) {
                              updateData[key] = parseFloat(req.body[key]);
                        } else if (key === 'durationMonths') {
                              updateData[key] = parseInt(req.body[key]);
                        } else {
                              updateData[key] = req.body[key];
                        }
                  }
            }

            const project = await prisma.project.update({
                  where: { id: parseInt(id) },
                  data: updateData
            });

            res.status(200).json({ success: true, project, message: 'Project updated successfully.' });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.deleteProject = async (req, res) => {
      try {
            const { id } = req.params;

            // Check if project has any investments
            const investmentCount = await prisma.investment.count({
                  where: { projectId: parseInt(id) }
            });

            if (investmentCount > 0) {
                  return res.status(400).json({
                        success: false,
                        message: `Cannot delete project — ${investmentCount} active investment(s) exist. Change status to COMPLETED instead.`
                  });
            }

            await prisma.project.delete({ where: { id: parseInt(id) } });
            res.status(200).json({ success: true, message: 'Project deleted successfully.' });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};
