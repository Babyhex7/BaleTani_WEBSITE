const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const errorHandler = require("./middlewares/error.middleware");

// Import main routes (all routes grouped by role)
const routes = require("./routes");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// CORS configuration - Allow multiple development origins (localhost and local IPs)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Development mode: Allow all localhost and local network IPs
    if (process.env.NODE_ENV !== "production") {
      // Allow localhost with any port
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      // Allow 127.0.0.1 with any port
      if (origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        return callback(null, true);
      }
      // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (
        origin.match(
          /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/
        )
      ) {
        return callback(null, true);
      }
    }

    // Production mode: Only allow specific origins
    const allowedOrigins = [
      process.env.FRONTEND_CUSTOMER_URL,
      process.env.FRONTEND_ADMIN_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
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

// Static file serving for uploads
const path = require("path");
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../../public/uploads"))
);

// ============================================
// ROUTES - All routes under /api
// ============================================
app.use("/api", routes);

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
