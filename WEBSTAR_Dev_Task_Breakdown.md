# WEBSTAR Platform Development & Workflow Plan
**Manual Payment & Wallet-Based Investment System**

This document acts as the definitive guide for dividing tasks between your Frontend and Backend developers to complete the WEBSTAR platform within 3 days. It also outlines the exact user journey.

---

## 1. Current State vs. Required State

**What is 100% Ready:**
*   **The Landing Page UI:** The entire public face of the website is built, responsive, and styled. 
*   **Content:** All legal, compensation, and explanatory content is integrated.

**What is 0% Ready (Required Work):**
*   **Authentication & Profiles:** Users cannot register, log in, or view their custom dashboards.
*   **The Wallet System:** No mechanism exists to track user balances.
*   **Manual Payments (Admin Workflow):** No flow exists for users to declare they transferred money to the company bank account, or for the admin to approve it.
*   **Investment/Participation Flow:** The "Start Participating" button currently does nothing. 
*   **Network (MLM) Logic:** The backend logic to distribute the 8.5% level commissions.

---

## 2. The Complete User Journey (How the system works)

1.  **Registration:** The user clicks "Start Participating" on the landing page. They fill in Name, Email, Password, and a mandatory Referral ID (if they don't have one, maybe a company default one is used, or they *must* be invited).
2.  **Dashboard Access (Pending Status):** The user is directed to their private dashboard. Their account status is **"INACTIVE (Payment Pending)"**.
3.  **KYC Submission:** They must upload PDF/Images (Aadhar, PAN) in the dashboard.
4.  **Adding Money to Wallet (Manual Payment):** 
    *   The dashboard shows the **Company Bank Account Details** (Account No, IFSC, UPI ID).
    *   The user transfers ₹1,00,000 (Min) via their own bank app.
    *   The user clicks "Add Money", enters the amount transferred, and inputs the **Transaction ID / UTR Number** as proof.
5.  **Admin Approval (Backend Step):** The Admin sees this "Deposit Request" on their admin panel. The Admin verifies the UTR number with the real company bank statement. Once verified, Admin clicks "Approve".
6.  **Wallet Credited & Account Activation:** The user's virtual "Wallet" now shows ₹1,00,000. Because they deposited capital, their account status changes to **"ACTIVE"**.
7.  **Participation (Investment):** 
    *   The user goes to the "Live Projects" section (e.g., funding a Web Series).
    *   They click "Participate in Project".
    *   The system deducts ₹1,00,000 from their Wallet.
8.  **Automated Network Payouts:** *Instantly*, upon the successful deduction in Step 7, the backend calculates the uplines (the person who referred them, their referrer, etc.) and credits *their* wallets with Level 1 (5%), Level 2 (2%), etc.

---

## 3. Work Division: Frontend vs Backend Developer

### **A. FRONTEND DEVELOPER TASKS (React/Vite)**

**Priority 1: Authentication Modals/Pages (Day 1)**
*   Build a Login Page / Modal.
*   Build a Registration Page / Modal (Must include "Referral Code" generic field).
*   *Hook up the "Start Participating" button on the landing page to open this Registration flow.*

**Priority 2: User Dashboard (Day 1 - 2)**
*   **Sidebar Navigation:** Dashboard, My Wallet, Live Projects, My Network, KYC, Settings.
*   **Overview Page:** Show Account Status (ACTIVE/INACTIVE), Total Invested, Network Volume.
*   **KYC Page:** Form to upload document images.
*   **Wallet Page (Crucial):** 
    *   Display Company Bank Details clearly.
    *   "Add Funds" Form: User enters Amount and UTR Number.
    *   "Withdraw Funds" Form: User requests payout of their commissions.
    *   Transaction History table (Pending/Approved deposits).
*   **Projects Page:** Display active projects with a "Contribute from Wallet" button.
*   **My Network Page:** A visual tree or table showing Level 1 to 5 referrals and bonuses earned.

**Priority 3: The Admin Panel (Day 3)**
*   A separate route (e.g., `/admin-ws-secret`) for staff.
*   **KYC Approvals Table:** View uploaded docs, click Approve/Reject.
*   **Manual Deposit Approvals Table:** View user UTR requests. Click "Accept" to credit their wallet.
*   **Withdrawal Approvals Table:** View user payout requests. 

---

### **B. BACKEND DEVELOPER TASKS (Node.js/Express/MongoDB)**

**Priority 1: Auth, Users, and Models (Day 1)**
*   Create DB Collections: `Users`, `Wallets`, `Transactions`, `Projects`, `Withdrawals`, `Deposits`, `Investments`.
*   Build JWT Registration & Login APIs. 
*   **Requirement:** Upon registration, generate a unique `PlatformID` for the user. Ensure the user's `referrerId` is correctly linked to the inviter.

**Priority 2: The Wallet & Manual Admin Flow (Day 2)**
*   **API:** `POST /api/wallet/deposit` -> User submits UTR & Amount. State = PENDING.
*   **API:** `GET /api/admin/pending-deposits` -> Fetch list for Admin UI.
*   **API:** `POST /api/admin/approve-deposit/:id` -> Admin approves it. 
    *   *Logic required:* Increase User Wallet Balance. If this is their first deposit >= 1L, change User Status to `ACTIVE`.
*   **API:** `POST /api/kyc/upload` -> Handle file uploads (Multer / AWS S3/ Cloudinary), set KYC = PENDING.

**Priority 3: The Complex Investment & Network Logic (Day 3)**
*   **API:** `GET /api/projects` -> List projects.
*   **API:** `POST /api/project/invest` -> User invests using Wallet Balance. 
    *   *Logic required:* Deduct wallet. Create `Investment` record.
*   **THE HEART (Network Automation):** 
    *   After `invest` API succeeds, trigger a function `distributeLevelIncome(userId, amount)`.
    *   Find the exact 5 parents above `userId`.
    *   Credit Parent 1 Wallet with 5% of amount.
    *   Credit Parent 2 Wallet with 2% of amount.
    *   Credit Parent 3, 4, 5 Wallets with 0.5% of amount.
    *   Create `Transaction` logs for *all* these movements.

---

## 4. Next Immediate Steps
1.  **Frontend Dev:** Take the `index.html` and start building the `/register` and `/login` React routes. Connect the existing Hero buttons.
2.  **Backend Dev:** Setup the Git repository, initialize Express, connect to MongoDB, and build the Login/Reg endpoints.
3.  **Owner (You):** Finalize the exact Company Bank Account details that will be displayed on the user's wallet screen for manual transfers.
