
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const prisma = require('./utils/db');

const app = express();

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
].filter(Boolean);

app.use(cors({
      origin: (origin, callback) => {
            // Allow requests with no origin (Postman, mobile apps, Railway healthcheck)
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
      },
      credentials: true
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Health Check (pings DB) ───────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
      try {
            await prisma.$queryRaw`SELECT 1`;
            res.json({ status: 'healthy', db: 'connected', ts: new Date().toISOString(), env: process.env.NODE_ENV });
      } catch (e) {
            res.status(503).json({ status: 'unhealthy', db: 'disconnected', error: e.message });
      }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/projects', require('./routes/project'));

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
      res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
      console.error('[SERVER ERROR]', err.stack || err.message);
      const isProd = process.env.NODE_ENV === 'production';
      res.status(err.status || 500).json({
            success: false,
            message: isProd ? 'An internal server error occurred.' : err.message,
      });
});

// ── Process Handlers ──────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
      console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
      console.error('[UNCAUGHT EXCEPTION]', err);
      process.exit(1);
});

// ── Server Start & Graceful Shutdown ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
      console.log(`🚀 WEBSTAR Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
            await prisma.$disconnect();
            console.log('✅ Server closed.');
            process.exit(0);
      });
      setTimeout(() => { console.error('Forced shutdown after timeout.'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use.`);
      } else {
            console.error('❌ Server error:', err);
      }
      process.exit(1);
});
