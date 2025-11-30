const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// FIX: Tambah CSRF protection untuk keamanan
const { doubleCsrf } = require("csrf-csrf");
require("dotenv").config();

const errorHandler = require("./middlewares/error.middleware");

// Import main routes (all routes grouped by role)
const routes = require("./routes");

const app = express();

// Security middleware - Configure helmet to allow cross-origin resources
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded cross-origin
    contentSecurityPolicy: false, // Disable CSP for development (can be configured for production)
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (naik dari 100)
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  // Skip static files (uploads, images)
  skip: (req) => {
    return req.url.startsWith("/uploads/");
  },
  // Handler untuk rate limit
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Terlalu banyak request. Silakan tunggu beberapa saat.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});
app.use(limiter);

// CORS configuration - Allow multiple development origins (localhost and local IPs)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("✅ CORS: Request with no origin (allowed)");
      return callback(null, true);
    }

    // Development mode: Allow all localhost and local network IPs
    if (process.env.NODE_ENV !== "production") {
      // Allow localhost with any port
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        console.log("✅ CORS: Allowed localhost origin:", origin);
        return callback(null, true);
      }
      // Allow 127.0.0.1 with any port
      if (origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        console.log("✅ CORS: Allowed 127.0.0.1 origin:", origin);
        return callback(null, true);
      }
      // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (
        origin.match(
          /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/
        )
      ) {
        console.log("✅ CORS: Allowed local network origin:", origin);
        return callback(null, true);
      }
    }

    // Production mode: Only allow specific origins
    const allowedOrigins = [
      process.env.FRONTEND_CUSTOMER_URL,
      process.env.FRONTEND_ADMIN_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS: Allowed production origin:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  preflightContinue: false,
  maxAge: 86400, // 24 hours cache for preflight
};

// Enable CORS pre-flight for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// SECURITY: CSRF Protection
// ============================================
// FIX: CSRF protection untuk prevent cross-site request forgery attacks
// DISABLED for development - akan diaktifkan untuk production
if (process.env.NODE_ENV === "production") {
  const { doubleCsrfProtection, generateToken } = doubleCsrf({
    getSecret: () => process.env.JWT_SECRET || "default-csrf-secret",
    cookieName: "x-csrf-token",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromRequest: (req) => req.headers["x-csrf-token"],
  });

  app.use(doubleCsrfProtection);

  // Endpoint untuk ambil CSRF token (frontend butuh ini)
  app.get("/api/csrf-token", (req, res) => {
    const token = generateToken(req, res);
    res.json({
      success: true,
      csrfToken: token,
      message: "CSRF token generated successfully",
    });
  });

  console.log("🛡️ CSRF protection enabled (production mode)");
} else {
  // Development mode: CSRF disabled untuk kemudahan testing
  console.log("⚠️ CSRF protection DISABLED (development mode)");
}

// ============================================
// SECURITY: Input Sanitization
// ============================================
// Apply sanitization to all routes (except static files)
const { sanitizeQuery } = require("./middlewares/sanitize.middleware");
app.use(sanitizeQuery); // Sanitize query params globally

console.log("🛡️ Input sanitization enabled globally");

// Static file serving for uploads
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Log static file requests for debugging
app.use("/uploads", (req, res, next) => {
  console.log(`📁 [STATIC] Requesting: ${req.url}`);
  next();
});

// ============================================
// ROUTES - All routes under /api
// ============================================
app.use("/api", routes);

// Cache monitoring routes (only for development/debugging)
if (process.env.NODE_ENV !== "production") {
  const cacheStatsRoutes = require("./routes/cacheStats");
  app.use("/api/cache", cacheStatsRoutes);
  console.log("🔍 Cache monitoring endpoints enabled at /api/cache");
}

// Catch browser extension logs (to prevent CORS errors)
app.post("/api/log", (req, res) => {
  // Silently ignore browser extension logs
  res.status(204).send();
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
