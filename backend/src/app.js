const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const adminRoutes = require("./routes/admin");

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

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_CUSTOMER_URL,
    process.env.FRONTEND_ADMIN_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BaleTani Fresh Market API is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
