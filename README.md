# FLOWDESK — Business Operations & Client Management Platform

**FlowDesk** is a production-grade full-stack SaaS platform designed for freelancers, creative agencies, and software consultancies. It streamlines client management, multi-stage project milestones, Kanban task workflows, itemized invoicing, secure Paystack payment settlements, Cloudinary asset storage, real-time Socket.IO team messaging, and predictive AI operations intelligence.

---

## 1. System Architecture & High-Level Design

FlowDesk is designed with a **decoupled Client-Server Architecture** adhering to clean separation of concerns:

- **Frontend (Single Page Application)**: React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Axios, Lucide React, and Recharts.
- **Backend (REST & WebSocket Gateway)**: Node.js, Express.js 4.19, Socket.IO 4.7, MongoDB, Mongoose ODM.
- **External Services**:
  - **Paystack**: Secure payment gateway with cryptographic HMAC SHA512 webhook verification.
  - **Cloudinary**: Object storage for deliverable assets and project attachments.
  - **FlowDesk AI**: Operations copilot and empirical delivery risk engine grounded strictly on real database telemetry.

```
 flowdesk/
 ├── client/                     # Frontend SPA
 │   ├── src/
 │   │   ├── components/         # Reusable UI & Layout Components (Sidebar, Navbar, Cards)
 │   │   ├── pages/              # Routed Views (Dashboard, Clients, Projects, Tasks, Invoices, Files, Messages, AI)
 │   │   ├── layouts/            # AuthLayout & DashboardLayout
 │   │   ├── context/            # AuthContext, WorkspaceContext, SocketContext
 │   │   ├── services/           # Axios API services
 │   │   ├── lib/                # Axios instance with JWT interceptors
 │   │   └── utils/              # Formatting helpers (Currency, Dates)
 └── server/                     # Backend API & WebSocket Server
     ├── src/
     │   ├── config/             # Typed environment & Mongoose database setup
     │   ├── controllers/        # Request/Response handlers
     │   ├── middleware/         # Auth (protect, requireRole), Workspace (scoping), Error, Multer
     │   ├── models/             # Mongoose schemas (User, Workspace, TeamMember, Client, Project, Task, Invoice, Payment, File, Message, Notification, Activity)
     │   ├── routes/             # REST endpoints
     │   ├── services/           # Reusable business logic (Invoice math, Paystack webhooks, AI risk)
     │   ├── sockets/            # Authenticated Socket.IO room dispatchers
     │   ├── utils/              # AppError class, asyncHandler, token utilities
     │   └── server.js           # Express + HTTP + Socket.IO lifecycle entrypoint
```

---

## 2. Key Architectural Decisions & Engineering Rationale

### 1. Multi-Tenant Workspace Scoping
- **Why**: Prevent cross-tenant data leaks (IDOR vulnerabilities).
- **How**: Every core entity (`Client`, `Project`, `Task`, `Invoice`, `File`, `Message`, `Activity`) holds a foreign key to `Workspace`. The `requireWorkspaceAccess` middleware verifies that the authenticated user (`req.user`) has an active membership in `TeamMember` for that workspace before populating `req.workspace`. Every database query is strictly filtered by `workspace: req.workspace._id`.

### 2. Dual-Token Authentication Lifecycle
- **Access Token**: Short-lived (15 minutes), signed with `JWT_ACCESS_SECRET`, transported in the `Authorization: Bearer <token>` header. Kept in memory by the client.
- **Refresh Token**: Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie inaccessible to client-side JavaScript (mitigating XSS theft). Active sessions are tracked in MongoDB (`RefreshToken` model) with a TTL index for instant revocation and session invalidation.

### 3. Server-Side Financial Math & Idempotent Webhooks
- **Invoice Calculations**: Never trust totals calculated by the frontend. The backend recalculates line item totals, discounts, and taxes before saving to the database.
- **Paystack Webhook Verification**: The frontend payment callback is never treated as the source of truth. Payments are confirmed only when Paystack's cryptographic HMAC SHA512 signature in `x-paystack-signature` is verified against `PAYSTACK_SECRET_KEY`. Unique transaction references prevent duplicate settlement processing.

### 4. Multer Memory Storage & Cloudinary Streaming
- Uploaded files are buffered in RAM (`multer.memoryStorage()`) and piped directly to Cloudinary using `cloudinary.uploader.upload_stream`. This eliminates temporary disk writes on containerized servers (Render/Heroku/AWS).

### 5. Grounded AI Copilot (No Hallucinations)
- **FlowDesk AI** retrieves actual workspace metrics (active projects, task deadlines, overdue items, outstanding invoices) before generating responses. This ensures that answers are grounded in real operational data rather than hallucinations.

---

## 3. Environment Variables Configuration

Create a `.env` file in the `/server` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (MongoDB connection string)
MONGODB_URI=mongodb://127.0.0.1:27017/flowdesk

# JWT Secrets (Generate secure random strings in production)
JWT_ACCESS_SECRET=flowdesk_dev_access_secret_38291038102938120938
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=flowdesk_dev_refresh_secret_90123890123890123890
JWT_REFRESH_EXPIRES_IN=7d

# Paystack Test Credentials
PAYSTACK_SECRET_KEY=sk_test_placeholder_key
PAYSTACK_PUBLIC_KEY=pk_test_placeholder_key

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=flowdesk_dev
CLOUDINARY_API_KEY=dev_key
CLOUDINARY_API_SECRET=dev_secret

# AI Engine
AI_API_KEY=dev_ai_key
```

---

## 4. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended, v24 verified)
- MongoDB instance (local or Atlas URI)

### Installation
```bash
# Install all dependencies across both client and server monorepo workspaces
npm install
```

### Running the Full-Stack Application Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`
- **Health Check**: `http://localhost:5000/api/health`

### Running Automated Test Suites
```bash
npm test
```

### Building for Production
```bash
npm run build
```

---

## 5. Security & Production Checklist
- [x] Security headers enabled via `helmet()`
- [x] CORS configured for authorized origin with credentials
- [x] Rate limiting enabled (300 requests / 15 minutes)
- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] Short-lived JWTs paired with httpOnly refresh cookies
- [x] Centralized error handler suppressing stack traces in production
- [x] Paystack cryptographic HMAC SHA512 signature verification
- [x] File upload MIME type whitelist and 25MB file size limit

