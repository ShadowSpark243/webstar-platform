<div align="center">
  <img src="https://via.placeholder.com/150x150/0f172a/8b5cf6?text=W" alt="WEBSTAR Logo" width="120" height="120">
  <br/>
  <h1>✨ WEBSTAR Investment Platform ✨</h1>
  <p><strong>A Premium, Node.js & React-powered OTT Investment & MLM Network App</strong></p>
  
  [![Production Ready](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge&logo=vercel)](https://github.com/yourusername/webstar)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql)](https://mysql.com/)
  <br/>
  <br/>
</div>

## 📖 Overview

**WEBSTAR** is a high-fidelity, production-ready investment platform designed specifically for funding OTT (Over-The-Top) media projects. It features an integrated Multi-Level Marketing (MLM) network system that allows users to build teams and earn referral commissions.

The platform boasts a stunning, bespoke **dark-theme glassmorphism UI**, ensuring a premium, trustworthy look across all devices.

---

## 🌟 Key Features

### 💎 Premium User Interface
- **Bespoke Glassmorphism:** Custom CSS with frosted glass panels, ambient background orbs, and perfectly aligned grids.
- **100% Mobile Responsive:** Every dashboard, modal, and table scales flawlessly to any screen size.
- **Invisible Scrollbars:** Custom `-ms-overflow-style` and `::-webkit-scrollbar` implementations keep the UI clean while maintaining full scroll functionality.

### 👥 Advanced MLM & Networking
- **Hierarchical Referrals:** Infinite depth tracking of upline sponsors and downline referrals.
- **Team Volume Tracking:** Automatic calculation of downline investment volume for rank advancements.
- **Commission Engine:** Automated distribution of referral bonuses upon successful project investments.

### 💼 Investment Engine
- **Project Portfolios:** Users can browse active OTT projects and allocate capital.
- **Ledger & History:** Detailed, filterable transaction histories for deposits, investments, and commissions.
- **ROI Tracking:** Clear visualization of expected returns and active capital.

### 🛡️ Security & Administration
- **KYC Verification:** Users must upload identity documents (Aadhar, PAN, Passport) for admin approval before full platform access.
- **Robust Authentication:** Secure JWT sessions, bcrypt password hashing, and HTML-branded password reset emails with expiring tokens.
- **Full Admin Panel:** Comprehensive tools for Admins to inspect users, moderate KYC queue, approve deposits, and ban fraudulent accounts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Custom CSS Modules (Zero reliance on limiting CSS frameworks)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Visualization:** Recharts

### Backend
- **Runtime:** Node.js / Express
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Email Delivery:** Nodemailer (with custom HTML templates)
- **File Storage:** AWS S3 (for KYC documents)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Database (Local or Cloud provider like Railway/Render)
- AWS S3 Bucket (for file uploads)

### 1. Database Setup
Ensure you have a MySQL instance running. Create a new database for the project.

### 2. Backend Installation
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on the following template:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# Security
JWT_SECRET="your_super_secret_jwt_key_here"
ADMIN_SECRET_CODE="secure_admin_creation_code"

# AWS S3 (For KYC Uploads)
AWS_REGION="your_aws_region"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET_NAME="your_bucket_name"

# Email Configuration (Nodemailer / Resend / SendGrid)
EMAIL_HOST="smtp.yourprovider.com"
EMAIL_PORT=587
EMAIL_USER="your_email@domain.com"
EMAIL_PASS="your_email_password"

# Frontend URL (For Password Reset Links)
FRONTEND_URL="http://localhost:5173"
```
Run Prisma migrations and start the server:
```bash
npx prisma db push
npm start
```

### 3. Frontend Installation
In a new terminal:
```bash
# In the root directory (ott-investment-platform)
npm install
```
Create a `.env` file in the root directory:
```env
VITE_API_URL="http://localhost:5000/api"
```
Start the Vite development server:
```bash
npm run dev
```

---

## 🏗️ Project Structure

```text
ott-investment-platform/
├── backend/                  # Express API Server
│   ├── controllers/          # Business logic (auth, wallet, admin)
│   ├── middleware/           # Auth and Security guards
│   ├── prisma/               # Database Schema
│   ├── routes/               # API Endpoints
│   ├── utils/                # S3 uploads, Email rendering
│   └── server.js             # App entry point
│
├── src/                      # React Frontend
│   ├── components/           # Reusable UI (Modals, Nav, Sections)
│   ├── context/              # Global state (AuthContext)
│   ├── layouts/              # Dashboard & Admin layouts
│   ├── pages/                # Main views (Auth, Admin, Dashboard)
│   ├── utils/                # Axios interceptors & API helpers
│   ├── index.css             # Global CSS Variables & Reset
│   └── main.jsx              # React DOM entry
```

---

## 👨‍💻 Author & Maintainer

Built with precision for high-end digital finance applications. Ensure to thoroughly test environment variables before deploying to production environments like Vercel and render.

_Designed and Optimized for Production._ 🚀
