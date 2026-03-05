const prisma = require('../utils/db');

// ── Export User Transaction History as CSV ──
exports.exportTransactionsCSV = async (req, res) => {
      try {
            const transactions = await prisma.transaction.findMany({
                  where: { userId: req.user.id },
                  orderBy: { createdAt: 'desc' }
            });

            const header = 'ID,Type,Amount,Status,Description,Date\n';
            const rows = transactions.map(t =>
                  `${t.id},${t.type},${t.amount},${t.status},"${(t.description || '').replace(/"/g, '""')}",${t.createdAt.toISOString()}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
            res.send(header + rows);
      } catch (error) {
            console.error('Export Transactions Error:', error);
            res.status(500).json({ success: false, message: 'Export failed' });
      }
};

// ── Export Admin Ledger as CSV ──
exports.exportAdminLedgerCSV = async (req, res) => {
      try {
            const transactions = await prisma.transaction.findMany({
                  include: { user: { select: { fullName: true, username: true, email: true } } },
                  orderBy: { createdAt: 'desc' }
            });

            const header = 'ID,User,Username,Email,Type,Amount,Status,Bank Reference,Date\n';
            const rows = transactions.map(t =>
                  `${t.id},"${t.user.fullName}",${t.user.username},${t.user.email},${t.type},${t.amount},${t.status},"${t.bankReference || ''}",${t.createdAt.toISOString()}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=admin-ledger.csv');
            res.send(header + rows);
      } catch (error) {
            console.error('Export Admin Ledger Error:', error);
            res.status(500).json({ success: false, message: 'Export failed' });
      }
};

// ── Export Admin User List as CSV ──
exports.exportUsersCSV = async (req, res) => {
      try {
            const users = await prisma.user.findMany({
                  select: {
                        id: true, fullName: true, username: true, email: true, phone: true,
                        walletBalance: true, totalInvested: true, rank: true, role: true,
                        status: true, kycStatus: true, createdAt: true
                  },
                  orderBy: { createdAt: 'desc' }
            });

            const header = 'ID,Full Name,Username,Email,Phone,Wallet Balance,Total Invested,Rank,Role,Status,KYC Status,Created At\n';
            const rows = users.map(u =>
                  `${u.id},"${u.fullName}",${u.username},${u.email},${u.phone || ''},${u.walletBalance},${u.totalInvested},${u.rank},${u.role},${u.status},${u.kycStatus},${u.createdAt.toISOString()}`
            ).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
            res.send(header + rows);
      } catch (error) {
            console.error('Export Users Error:', error);
            res.status(500).json({ success: false, message: 'Export failed' });
      }
};
