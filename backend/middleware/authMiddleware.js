const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

exports.protect = async (req, res, next) => {
      let token;

      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                  token = req.headers.authorization.split(' ')[1];

                  // Verify token
                  const decoded = jwt.verify(token, process.env.JWT_SECRET);

                  // Get user from the token
                  req.user = await prisma.user.findUnique({
                        where: { id: decoded.id },
                        select: { id: true, role: true, email: true, status: true, kycStatus: true }
                  });

                  if (!req.user) {
                        return res.status(401).json({ message: 'Not authorized, user not found' });
                  }

                  next();
            } catch (error) {
                  return res.status(401).json({ message: 'Not authorized, token failed' });
            }
      }

      if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
      }
};

exports.adminOnly = (req, res, next) => {
      if (req.user && req.user.role === 'ADMIN') {
            next();
      } else {
            res.status(403).json({ message: 'Not authorized as an admin' });
      }
};
