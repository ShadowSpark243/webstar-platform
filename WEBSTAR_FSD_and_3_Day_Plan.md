# WEBSTAR OTT Investment Platform
## Functional Specification Document (FSD) & 3-Day Development Plan

This document outlines the architecture, database schemas, API requirements, and a rigid 3-day execution plan to build the full-stack WEBSTAR platform.

---

## 1. Technology Stack Recommendation
Given the tight 3-day timeline, we need a stack that allows for rapid development while ensuring security for financial data.

*   **Frontend**: React (Vite) - *Already built (UI is ready)*. Just needs API integration.
*   **Backend**: Node.js with Express.js (Fast, easy to set up).
*   **Database**: PostgreSQL (Recommended for financial apps due to strict ACID compliance) OR MongoDB (Easier for rapid prototyping). Let's assume **MongoDB via Mongoose** for the 3-day speed.
*   **Authentication**: JSON Web Tokens (JWT) + bcrypt for password hashing.
*   **Hosting**: 
    *   Frontend: Vercel / Netlify
    *   Backend: Render / Railway / Heroku
    *   Database: MongoDB Atlas

---

## 2. Database Schema Design (MongoDB)

### A. User Collection (`User`)
*   `_id`: ObjectId
*   `platformId`: String (Unique, e.g., WS-100234)
*   `fullName`: String
*   `email`: String (Unique)
*   `passwordHash`: String
*   `phoneNumber`: String
*   `role`: Enum ['USER', 'ADMIN']
*   `kycStatus`: Enum ['PENDING', 'APPROVED', 'REJECTED']
*   `rank`: Enum ['MEMBER', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR']
*   `totalPersonalParticipation`: Number (Default: 0)
*   `totalNetworkVolume`: Number (Default: 0)
*   `referredBy`: ObjectId (Ref: User) - *Crucial for Level Commissions*
*   `walletBalance`: Number (Default: 0)
*   `createdAt` & `updatedAt`: Timestamps

### B. Project/Campaign Collection (`Project`)
*   `_id`: ObjectId
*   `title`: String
*   `type`: Enum ['WEB_SERIES', 'MOVIE']
*   `status`: Enum ['FUNDING', 'IN_PRODUCTION', 'RELEASED', 'PROFIT_DISTRIBUTED']
*   `targetAmount`: Number
*   `raisedAmount`: Number
*   `realizedNetProfit`: Number (Updated post-release)
*   `createdAt` & `updatedAt`: Timestamps

### C. Participation/Investment Collection (`Participation`)
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: User)
*   `projectId`: ObjectId (Ref: Project)
*   `amount`: Number (Min: 1,00,000)
*   `status`: Enum ['PENDING', 'SUCCESS', 'FAILED']
*   `transactionDate`: Date

### D. Transaction/Ledger Collection (`Transaction`)
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: User)
*   `type`: Enum ['DEPOSIT', 'WITHDRAWAL', 'LEVEL_COMMISSION', 'MONTHLY_BONUS', 'PROFIT_SPLIT']
*   `amount`: Number
*   `description`: String (e.g., "Level 1 Commission from User B")
*   `status`: Enum ['PENDING', 'COMPLETED', 'FAILED']
*   `createdAt`: Date

---

## 3. Core API Endpoints Needed

### Authentication & User Management
*   `POST /api/auth/register` - Create user, generate Platform ID, assign parent referral.
*   `POST /api/auth/login` - Authenticate & return JWT.
*   `GET /api/user/profile` - Get user details, rank, KYC status.
*   `POST /api/user/kyc` - Upload KYC documents.

### Participation & Funding
*   `GET /api/projects` - List active projects.
*   `POST /api/participate` - Initialize a payment/participation (Gateway Integration).

### Network & Commission Logic (The Hard Part)
*   `GET /api/network/downline` - Fetch referred users up to 5 levels deep.
*   `GET /api/wallet/transactions` - Fetch user's transaction history.
*   **Internal Cron Job / Trigger**: `distributeCommissions(participationId)` 
    *   *Logic*: When user A participates with ₹1L, find referrers up to 5 levels and credit their wallets (5%, 2%, 0.5%, 0.5%, 0.5%).

---

## 4. The 3-Day Execution Plan

### Day 1: Foundation & Authentication (Backend)
**Objective:** Setup server, database, and secure user logins.
*   **Morning (Morn 1):**
    *   Initialize Node.js/Express app.
    *   Setup MongoDB Atlas and connect via Mongoose.
    *   Create all 4 Database Models (`User`, `Project`, `Participation`, `Transaction`).
*   **Afternoon (Aft 1):**
    *   Implement user Registration and Login APIs.
    *   Setup JWT middleware to protect private routes.
    *   Implement referral code generation and tracking during registration.
*   **Evening (Eve 1):**
    *   Connect Frontend to `register` and `login` endpoints.
    *   Create a basic User Dashboard UI (to view profile and wallet balance).

### Day 2: Core Logic - Payments & Network Commissions
**Objective:** Handle the money input and distribute it to the network.
*   **Morning (Morn 2):**
    *   Integrate a Payment Gateway (e.g., Razorpay, Stripe, or PhonePe for India) in test mode.
    *   Create the `POST /api/participate` endpoint to process payments.
*   **Afternoon (Aft 2):**
    *   **Crucial Step:** Write the MLM/Network distribution logic. When a payment succeeds, recursively find the user's parent (Level 1), grandparent (Level 2), up to Level 5.
    *   Update their `walletBalance` and create `Transaction` ledger records.
*   **Evening (Eve 2):**
    *   Build the frontend "Network" or "My Referrals" page to visualize earnings.
    *   Update Rank logic (if user's team volume hits ₹15L, update rank to MANAGER).

### Day 3: Admin Panel, Polish & Launch
**Objective:** Ensure the admin can manage the platform and prepare for production.
*   **Morning (Morn 3):**
    *   Build Admin APIs: Approve KYC, create new `Projects`, and trigger profit distributions manually.
    *   Build a quick Admin Dashboard (can be very basic).
*   **Afternoon (Aft 3):**
    *   Rigorous Testing. Test edge cases: What if Level 3 parent doesn't exist? What if payment fails midway?
    *   Refine Frontend state management (using Redux or React Context) to ensure UI reflects data accurately.
*   **Evening (Eve 3):**
    *   Deployment.
    *   Push Backend to Render/Heroku. Setup environment variables (`JWT_SECRET`, Payment Keys, DB URI).
    *   Push Frontend to Vercel.
    *   Final live testing.

---

## 5. Developer "Gotchas" (Mandatory Instructions for the Dev)
1. **Never use Floats for Money:** When doing percentage calculations (e.g., 8.5% of 1,00,000), always calculate in the smallest currency unit (Paisa/Cents) to avoid JavaScript floating-point errors, or use libraries like `decimal.js`.
2. **ACID Transactions:** When distributing the 5 levels of commission, wrap all 5 database updates in a single MongoDB **Transaction/Session**. If one fails, they all fail. We cannot afford partial payments.
3. **Security:** Do not send password hashes or full network trees to the frontend. Strip sensitive data in the API responses.

## Action Plan to Start Right Now
Hand this document to your developer(s) immediately. Since the frontend UI (Landing Page) is already built, they just need to add the Auth Modals, User Dashboard Pages, and focus heavily on the Backend API and Payment Logic.
