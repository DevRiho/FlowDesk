import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/appError.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import businessRoutes from './routes/business.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import fileRoutes from './routes/file.routes.js';
import commsRoutes from './routes/communication.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Initialize Express application
const app = express();

// ==========================================
// 1. SECURITY & INFRASTRUCTURE MIDDLEWARE
// ==========================================

// Helmet sets HTTP security headers to protect against well-known web vulnerabilities
// (e.g., cross-site scripting, clickjacking, MIME sniffing).
app.use(helmet());

// CORS configuration: controls which domains can interact with this API.
// In production, credentials: true is critical for sending cookies (refresh tokens) cross-origin.
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Global rate limiting to mitigate brute-force and Denial-of-Service attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});
app.use('/api', generalLimiter);

// ==========================================
// 2. BODY PARSING MIDDLEWARE
// ==========================================

// JSON body parser with size cap to prevent payload exhaustion attacks
app.use(express.json({ limit: '10mb' }));

// URL-encoded parser for standard form payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser enables reading incoming cookies (e.g., req.cookies.refreshToken)
app.use(cookieParser());

// ==========================================
// 3. API ROUTE REGISTRATION
// ==========================================

// Base API welcome route
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'FlowDesk API',
    description: 'Business Operations & Client Management Platform API',
    status: 'healthy',
    documentation: '/api/docs',
  });
});

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api', businessRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', fileRoutes);
app.use('/api', commsRoutes);
app.use('/api/ai', aiRoutes);

// ==========================================
// 4. UNHANDLED ROUTE (404) CATCHER
// ==========================================
// If a request reaches this point, no registered router handled the URL.
// We throw a standardized 404 AppError which forwards directly into our errorHandler.
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find route ${req.method} ${req.originalUrl} on FlowDesk API`, 404));
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use(errorHandler);

export default app;

