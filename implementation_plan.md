# WEBSTAR OTT Investment Platform: Complete FSD & Technical Blueprint

This document is the definitive Functional Specification Document (FSD) and development guide for the WEBSTAR platform. It is designed to be handed directly to your frontend and backend developers. It covers the current state of the project, the required architecture, the tech stack, database schemas, API endpoints, and a step-by-step breakdown of how every feature should be implemented.

---

## 1. Project Overview & Current Status

**Project Goal:** Build an investment platform where users can fund OTT projects (Web Series/Movies) using a manual wallet system and earn returns through a 5-level referral network and profit-sharing pools.

**Current Readiness:**
*   **Frontend UI (Landing Page): 100% Ready.** The homepage with marketing copy, compensation plans, and visuals is built using React (Vite).
*   **Frontend Logic: 0% Ready.** No authentication, routing, or user dashboard exists. The "Start Participating" button is non-functional.
*   **Backend & Database: 0% Ready.** No server, database, or API exists yet.

**Remaining Work:** Full Backend development, Database creation, Frontend API integration, and the complete User/Admin Dashboard UI.

---

## 2. Recommended Tech Stack

To ensure rapid development, security, and compatibility, we recommend the **MERN Stack** with **MySQL** as an alternative to MongoDB if relational data is strictly preferred. Given your request for "perfect like MySQL, easily compatible," we will define the schema for **MySQL (using Prisma ORM or Sequelize with Node.js)** as it handles financial transactions (ACID properties) exceptionally well.

*   **Frontend:** React.js (Vite), Tailwind CSS or Custom CSS (already started), React Router for navigation, Axios for API calls.
*   **Backend:** Node.js, Express.js.
*   **Database:** MySQL.
*   **ORM:** Prisma (Highly recommended for MySQL with Node.js because it makes queries easy and secure).
*   **Authentication:** JSON Web Tokens (JWT) + bcrypt (for password hashing).

---

## 3. The Complete User Journey (The "Flow")

1.  **Registration:** User clicks "Start Participating" on the Landing Page. A modal/page opens. They enter Name, Email, Password, Phone, and a **Referral Code** (Mandatory. If they don't have one, a default company one like `WS-ADMIN` is used).
2.  **Dashboard Access:** User logs in. They land on the Dashboard. Their Account Status is **"INACTIVE"**.
3.  **KYC Submission:** They click the "KYC" tab, upload their Aadhar/PAN images, and enter document numbers. Status becomes **"KYC PENDING"**.
4.  **Admin KYC Approval:** Admin logs into the Admin Panel, reviews the documents, and clicks "Approve KYC". User's KYC status becomes **"VERIFIED"**.
5.  **Adding Funds (Manual Payment):** 
    *   User goes to the "Wallet" tab.
    *   The UI displays the **Company Bank Account Details** (e.g., Bank Name, Account Number, IFSC, UPI ID).
    *   User transfers money (Min ₹1,00,000) using their own bank app.
    *   User fills a "Deposit Form" entering the Amount and the **UTR / Transaction Reference Number**.
    *   Deposit status is **"PENDING"**.
6.  **Admin Deposit Approval:** 
    *   Admin checks the actual company bank statement.
    *   Admin finds the matching UTR number.
    *   Admin goes to Admin Panel -> Deposit Requests -> clicks "Approve".
    *   User's Virtual Wallet Balance increases by ₹1,00,000.
7.  **Account Activation:** Because the user now has funded their wallet with the minimum amount, their Account Status changes to **"ACTIVE"**.
8.  **Project Participation:** 
    *   User goes to "Live Projects".
    *   Selects a project, clicks "Invest".
    *   System deducts ₹1,00,000 from their Wallet Balance.
9.  **Automated Network Commission:** 
    *   INSTANTLY after investment, the backend identifies the user's 5 levels of referrers.
    *   Level 1 Referrer gets 5% of ₹1L (₹5,000) credited to their wallet.
    *   Level 2 gets 2% (₹2,000).
    *   Level 3, 4, 5 get 0.5% (₹500 each).

---

## 4. Database Schema (MySQL Definition)

This is the exact structure your backend developer must create in MySQL.

### Table: `users`
*   `id`: INT (Primary Key, Auto Increment)
*   `platform_id`: VARCHAR (Unique, e.g., 'WS-10045') - Generated on signup.
*   `full_name`: VARCHAR
*   `email`: VARCHAR (Unique)
*   `password_hash`: VARCHAR
*   `phone`: VARCHAR
*   `role`: ENUM ('USER', 'ADMIN') DEFAULT 'USER'
*   `status`: ENUM ('INACTIVE', 'ACTIVE', 'BANNED') DEFAULT 'INACTIVE'
*   `kyc_status`: ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'UNVERIFIED'
*   `rank`: ENUM ('MEMBER', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR') DEFAULT 'MEMBER'
*   `referred_by`: INT (Foreign Key references `users.id`) - *Crucial for tracking the network.*
*   `wallet_balance`: DECIMAL(12, 2) DEFAULT 0.00
*   `total_invested`: DECIMAL(12, 2) DEFAULT 0.00
*   `team_volume`: DECIMAL(12, 2) DEFAULT 0.00 - Sum of all investments by their downline.
*   `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Table: `kyc_documents`
*   `id`: INT (PK)
*   `user_id`: INT (FK references `users.id`)
*   `document_type`: ENUM ('AADHAR', 'PAN', 'PASSPORT')
*   `document_number`: VARCHAR
*   `file_url`: VARCHAR (Path to uploaded image)
*   `created_at`: TIMESTAMP

### Table: `projects`
*   `id`: INT (PK)
*   `title`: VARCHAR
*   `description`: TEXT
*   `type`: ENUM ('WEB_SERIES', 'MOVIE')
*   `status`: ENUM ('FUNDING_OPEN', 'IN_PRODUCTION', 'RELEASED') DEFAULT 'FUNDING_OPEN'
*   `target_amount`: DECIMAL(12, 2)
*   `raised_amount`: DECIMAL(12, 2) DEFAULT 0.00
*   `created_at`: TIMESTAMP

### Table: `deposits` (Manual Wallet Top-ups)
*   `id`: INT (PK)
*   `user_id`: INT (FK references `users.id`)
*   `amount`: DECIMAL(12, 2)
*   `utr_number`: VARCHAR (Unique)
*   `status`: ENUM ('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'
*   `admin_remarks`: VARCHAR
*   `created_at`: TIMESTAMP

### Table: `investments` (User Participating in a Project)
*   `id`: INT (PK)
*   `user_id`: INT (FK references `users.id`)
*   `project_id`: INT (FK references `projects.id`)
*   `amount`: DECIMAL(12, 2)
*   `created_at`: TIMESTAMP

### Table: `transactions` (The financial ledger for ALL movements)
*   `id`: INT (PK)
*   `user_id`: INT (FK references `users.id`)
*   `type`: ENUM ('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'LEVEL_COMMISSION', 'MONTHLY_BONUS')
*   `amount`: DECIMAL(12, 2) (Positive for credits, Negative for debits)
*   `description`: VARCHAR (e.g., "Level 1 Commission from WS-10045")
*   `related_user_id`: INT (FK references `users.id`, nullable. E.g., The user who triggered the commission)
*   `created_at`: TIMESTAMP

---

## 5. Backend API Guide (Node.js/Express)

Your Backend Developer must create these exact endpoints.

### Authentication Module
*   `POST /api/auth/register`
    *   **Input:** `fullName`, `email`, `password`, `phone`, `referralCode` (Maps up to `users.platform_id`).
    *   **Logic:** Hash password using bcrypt. Generate a unique `platform_id`. Find referrer by `referralCode` and set `referred_by`. Save user.
*   `POST /api/auth/login`
    *   **Logic:** Verify password. Generate and return a JWT (JSON Web Token) valid for 24 hours.

### User & KYC Module (Requires JWT Auth Middleware)
*   `GET /api/user/profile` -> Returns user details without password hash.
*   `POST /api/user/kyc` (Uses Multer for file upload)
    *   **Logic:** Save file to server/S3. Create record in `kyc_documents`. Update `users.kyc_status` to 'PENDING'.

### Wallet & Manual Payment Module
*   `GET /api/wallet/balance` -> Returns current `wallet_balance` and `transactions` history.
*   `POST /api/wallet/deposit-request`
    *   **Input:** `amount`, `utrNumber`.
    *   **Logic:** Create a record in `deposits` table with status 'PENDING'.
*   `POST /api/wallet/withdraw-request` -> Create a pending withdrawal request (similar to deposits).

### Investment & Network Module (THE MOST COMPLEX PART)
*   `GET /api/projects` -> List active projects.
*   `POST /api/invest`
    *   **Input:** `projectId`, `amount` (Min 1,00,000).
    *   **Logic (MUST USE MYSQL TRANSACTIONS `START TRANSACTION`):**
        1. Check if user `wallet_balance` >= `amount`. If no, throw error.
        2. Check if user `kyc_status` == 'VERIFIED'. If no, throw error.
        3. Deduct `amount` from `users.wallet_balance`.
        4. Create record in `investments`.
        5. Create negative record in `transactions` ("Investment Debit").
        6. Append `amount` to `projects.raised_amount`.
        7. **Call Network Distribution Function:** `distributeCommissions(user_id, amount)`.

**Developer Guide for `distributeCommissions()`:**
This function must recursively (or through 5 specific queries) find the upline.
*   Find Level 1 (The direct `referred_by` of the investor). Credit 5% to their wallet. Create `Transaction` record. Add `amount` to their `team_volume`.
*   Find Level 2 (The `referred_by` of Level 1). Credit 2%. Create `Transaction` record. Add `amount` to their `team_volume`.
*   Find Levels 3, 4, 5. Credit 0.5% to each. Create `Transaction` records. Add `amount` to their `team_volume`.
*   *If any parent doesn't exist (e.g., chain stops at Level 2), stop the distribution.*

### Admin Module (Requires Admin JWT Role)
*   `GET /api/admin/pending-kyc`
*   `POST /api/admin/approve-kyc/:userId`
*   `GET /api/admin/pending-deposits`
*   `POST /api/admin/approve-deposit/:depositId`
    *   **Logic:** Update deposit status to 'APPROVED'. Add `amount` to user's `wallet_balance`. Create positive record in `transactions` ("Manual Deposit Approved"). Check if user's `total_invested` > 0 or wallet > 1L, set user status to 'ACTIVE'.

---

## 6. Frontend Developer Tasks (React Section-by-Section)

Here is exactly what the React developer needs to build.

### 1. Landing Page Update
*   **Task:** Intercept the "Start Participating" buttons. Currently, they are `href="#participate"`.
*   **Action:** Change them to `onClick={() => setAuthModalOpen(true)}`.
*   **Component to Build:** `AuthModal.jsx`. A popup with two tabs: "Login" and "Register".
*   **Register Form Needs:** Standard fields + "Referral Code (Optional/Mandatory depending on company policy)". If they access the site via `webstar.com?ref=WS-123`, auto-fill this field.

### 2. The User Dashboard (`/dashboard`)
This is a secure route accessible only after login. Needs a sidebar navigation.

*   **View 1: Dashboard Home (`/dashboard/overview`)**
    *   Big Cards: Current Wallet Balance, Total Invested, Account Status Badge (Red "Inactive" vs Green "Active").
    *   Warning banner if KYC is Unverified: "Please verify your KYC to start investing."
*   **View 2: KYC Upload (`/dashboard/kyc`)**
    *   Form allowing image uploads for Aadhar and PAN. Shows status (Pending/Approved).
*   **View 3: My Wallet & Manual Deposit (`/dashboard/wallet`)**
    *   **Top Section:** "Company Bank Details". Hardcode the Bank Name, A/C No, IFSC here so the user sees where to send money.
    *   **Middle Section:** "Add Funds". A form with input fields: Amount Sent, UTR/Reference Number. Submit button calls `/api/wallet/deposit-request`.
    *   **Bottom Section:** Transaction table mapped from the `/api/wallet/balance` endpoint.
*   **View 4: Live Projects (`/dashboard/projects`)**
    *   Grid of `projects` fetched from API.
    *   Each card has a button: "Invest Now".
    *   Clicking "Invest Now" opens a modal, asks for amount (Min 1L), verifies wallet balance locally, and calls `/api/invest`.
*   **View 5: My Network (`/dashboard/network`)**
    *   Displays the user's referral link: `webstar.com?ref=USER_PLATFORM_ID`.
    *   Lists their direct downlines and total `team_volume`.

### 3. The Admin Panel (`/admin-portal`)
A separate, hidden React application or secure route group.
*   **Tables Needed:**
    1. Users (To view/ban/edit).
    2. KYC Approvals (View images, Reject/Approve buttons).
    3. Deposit Approvals (Crucial: Shows UTR numbers. Admin clicks "Approve" after verifying bank statement).
    4. Projects (Form to create new Web Series funding goals).

---

## 7. Execution Timeline (The 3-Day Sprint)

### Day 1: Auth & Architecture
*   **Backend:** Set up Express, MySQL DB, Prisma ORM. Build Registration, Login APIs, and JWT Middleware.
*   **Frontend:** Build `AuthModal.jsx` on Landing Page. Scaffold the Dashboard Layout (Sidebar, Header). Create generic Axios instance interceptors for JWT injection.

### Day 2: The Core Economy (Wallet & Admin)
*   **Backend:** Build KYC upload endpoints. Build Deposit Request endpoints. Build Admin Approval endpoints.
*   **Frontend:** Build "My Wallet" UI with Company Bank details. Build Deposit Request form. Build Admin Panel tables for KYC and Deposit approvals.

### Day 3: Investment & Complex MLM Logic
*   **Backend:** Build the `invest` API. Write and rigorously test the `distributeCommissions` MySQL Transaction logic.
*   **Frontend:** Build "Live Projects" UI. Connect the "Invest" button to the API. Build "My Network" view.
*   **Final Step:** End-to-end test. Register user -> Upload KYC -> Deposit -> Admin Approves Deposit -> User Invests -> Check if uplines got their 5%, 2%, 0.5% correctly.
