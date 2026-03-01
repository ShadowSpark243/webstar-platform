# WEBSTAR: OTT Investment Platform - Developer Guide

Welcome to the **WEBSTAR** developer guide. This document provides a deep dive into the project's architecture, system logic, and development workflows to help you get up to speed quickly.

---

## 1. System Overview
WEBSTAR is a premium OTT investment platform where users can invest in media projects and earn returns. It features a sophisticated Multi-Level Marketing (MLM) referral system, secure wallet management, and an administrative control center for project and user management.

---

## 2. Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Custom premium design system)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **State Management**: React Context API (`AuthContext`)
- **Visuals**: [Framer Motion](https://www.framer.com/motion/) (Animations), [Lucide React](https://lucide.dev/) (Icons), [Recharts](https://recharts.org/) (Data Visualization)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: MySQL (Hosted on Railway/Production)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3 (via `@aws-sdk/client-s3`)

---

## 3. Directory Structure

```bash
ott-investment-platform/
├── backend/                # Express Server Logic
│   ├── controllers/        # Business logic for routes
│   ├── middleware/         # Auth, validation, and security
│   ├── prisma/             # Schema and Migrations
│   ├── routes/             # API Endpoints
│   ├── utils/              # DB helpers, Loggers, Network stats
│   └── server.js           # Entry point
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components
│   ├── context/            # AuthContext & Global state
│   ├── layouts/            # Dashboard & Admin layouts
│   ├── pages/              # View components (Dashboard, Admin, Landing)
│   ├── utils/              # Frontend helpers (Axios config)
│   └── App.jsx             # Main routing & Protected routes
├── public/                 # Static assets
├── vercel.json             # Vercel deployment config
└── package.json            # Project dependencies & scripts
```

---

## 4. Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (Local or Remote)
- AWS S3 Bucket (For document uploads)

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ott-investment-platform
   ```

2. **Backend Configuration**:
   - Navigate to `backend/`
   - Create a `.env` file based on `.env.example` (or provided credentials):
     ```env
     DATABASE_URL="mysql://user:pass@localhost:3306/db"
     JWT_SECRET="your_secret_key"
     FRONTEND_URL="http://localhost:5173"
     PORT=5000
     ```
   - Install dependencies: `npm install`
   - Generate Prisma Client: `npx prisma generate`
   - Start Dev Server: `nodemon server.js`

3. **Frontend Configuration**:
   - Navigate back to the root directory
   - Install dependencies: `npm install`
   - Start Vite: `npm run dev`

---

## 5. Main APIs & System Logic

### Authentication
- **Endpoints**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Logic**: Uses `bcryptjs` for hashing and `jsonwebtoken` for stateless sessions. The `protect` middleware ensures routes are only accessible with a valid Bearer token.

### MLM & Referral System
- **Core logic**: Found in `backend/utils/networkStats.js`.
- **Functionality**: When a user registers or invests, the system updates the "upliners" (up to 10 levels). It tracks `teamVolume`, `totalActiveTeamMembers`, and `rank` automatically.
- **Ranks**: Starter, Bronze, Silver, Gold, Platinum, Diamond (Calculated based on personal and team investment).

### Wallet & Transactions
- **Endpoints**: `/api/wallet/...`
- **Logic**: Manages Deposits, Withdrawals, and Commissions. All financial changes are logged as `Transaction` records in the DB to ensure a full audit trail.

### Admin Control Center
- **Access**: Only users with `role: 'ADMIN'` can access `/admin` routes.
- **Features**: KYC verification, Ledger management (approving deposits/withdrawals), creating/managing Projects, and viewing global Network stats.

---

## 6. Database Schema (Prisma)
Major models in `backend/prisma/schema.prisma`:
- `User`: Handles identity, balance, and MLM stats.
- `Project`: Defines investment opportunities (Title, Target, ROI, etc.).
- `Investment`: Links Users to Projects.
- `Transaction`: Financial history.
- `KycDocument`: KYC verification details.

---

## 7. Development to Production

### Environment Stages
- **Development**: Local MySQL + Vite dev server.
- **Staging/Production**: Railway (Backend/Database) + Vercel (Frontend).

### Deployment Workflow
1. **Database**: Apply migrations using `npx prisma migrate deploy`.
2. **Backend**: Push to Railway/Production. Ensure all secrets (AWS, DB, JWT) are set in the environment.
3. **Frontend**: Build using `npm run build` and deploy to Vercel. `vercel.json` handles the SPA routing rewrites.

### Security Best Practices
- **Rate Limiting**: `express-rate-limit` is used on auth routes.
- **Headers**: `helmet` and `hpp` provide protection against common web vulnerabilities.
- **Validation**: `express-validator` ensures clean input on all POST/PUT requests.

---

## 8. Tips for New Developers
- Always check the `backend/logs/` if something goes wrong on the server.
- Use the **Admin Ledger** as a reference for complex data tables and action flows.
- For UI changes, follow the custom design system in `src/index.css` to maintain the "premium" feel.
