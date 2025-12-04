/**
 * ============================================
 * SECURITY MIDDLEWARE - RATE LIMITING
 * ============================================
 *
 * Specialized rate limiters untuk different endpoints
 * Mencegah brute force attacks dan abuse
 *
 * @module securityMiddleware
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const rateLimit = require("express-rate-limit");

// Skip rate limiting in test environment
const isTestEnv =
  process.env.NODE_ENV === "test" || process.env.DISABLE_RATE_LIMIT === "true";

// No-op middleware for test environment
const noopMiddleware = (req, res, next) => next();

/**
 * ========================================
 * STRICT RATE LIMITER - LOGIN ENDPOINTS
 * ========================================
 *
 * Apply ke login endpoints untuk prevent brute force
 *
 * Rules:
 * - Max 5 attempts per 15 minutes per IP
 * - Block for 1 hour after limit reached
 * - Return 429 status code
 * - DISABLED in test environment
 */
const loginLimiter = isTestEnv
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Max 10 login attempts (increased for better UX)
      skipSuccessfulRequests: true, // Don't count successful logins
      skipFailedRequests: false, // Count failed attempts
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false, // Disable X-RateLimit headers
      message: {
        success: false,
        message:
          "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.",
        code: "RATE_LIMIT_LOGIN",
      },
      // Custom key generator - track by phone number only for accurate brute force protection
      keyGenerator: (req) => {
        // Track by phone number only (not IP) to prevent false positives
        // and enable accurate per-account brute force protection
        const phoneNumber = req.body?.phone_number || req.body?.username;
        return phoneNumber ? `login:${phoneNumber}` : `login:ip:${req.ip}`;
      },
      // Handler when limit exceeded
      handler: (req, res) => {
        const phoneNumber =
          req.body?.phone_number || req.body?.username || "unknown";
        console.warn(
          `⚠️ [SECURITY] Login rate limit exceeded - Phone: ${phoneNumber}, IP: ${req.ip}, Path: ${req.path}`
        );
        res.status(429).json({
          success: false,
          message:
            "Terlalu banyak percobaan login gagal. Untuk keamanan akun Anda, silakan coba lagi setelah 15 menit.",
          code: "RATE_LIMIT_LOGIN",
          retryAfter: 15 * 60, // seconds
        });
      },
    });

/**
 * ========================================
 * MODERATE RATE LIMITER - REGISTER ENDPOINTS
 * ========================================
 *
 * Apply ke register endpoints
 *
 * Rules:
 * - Max 3 registrations per hour per IP
 * - Prevent spam registrations
 */
const registerLimiter = isTestEnv
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // Max 5 registrations (increased from 3)
      skipSuccessfulRequests: true, // Don't count successful registrations
      skipFailedRequests: false, // Count failed attempts
      message: {
        success: false,
        message:
          "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.",
        code: "RATE_LIMIT_REGISTER",
      },
      keyGenerator: (req) => {
        // Track by IP for registration to prevent spam
        return `register:ip:${req.ip}`;
      },
      handler: (req, res) => {
        console.warn(
          `⚠️ [SECURITY] Registration rate limit exceeded - IP: ${req.ip}`
        );
        res.status(429).json({
          success: false,
          message:
            "Terlalu banyak percobaan registrasi. Untuk mencegah penyalahgunaan, silakan coba lagi setelah 1 jam.",
          code: "RATE_LIMIT_REGISTER",
          retryAfter: 60 * 60, // seconds
        });
      },
    });

/**
 * ========================================
 * GENERAL API RATE LIMITER
 * ========================================
 *
 * Apply ke all API endpoints (general protection)
 *
 * Rules:
 * - Max 100 requests per 15 minutes per IP
 * - Prevent API abuse
 */
const apiLimiter = isTestEnv
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max 100 requests
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message:
          "Terlalu banyak permintaan dari IP ini. Silakan coba lagi nanti.",
        code: "RATE_LIMIT_API",
      },
      handler: (req, res) => {
        console.warn(
          `⚠️ API rate limit exceeded for IP: ${req.ip} on ${req.path}`
        );
        res.status(429).json({
          success: false,
          message:
            "Terlalu banyak permintaan. Silakan coba lagi setelah 15 menit.",
          code: "RATE_LIMIT_API",
          retryAfter: 15 * 60,
        });
      },
    });

/**
 * ========================================
 * GENERIC RATE LIMITER FACTORY
 * ========================================
 *
 * Membuat limiter custom sesuai opsi yang diberikan.
 * Digunakan ketika route membutuhkan konfigurasi khusus.
 * Contoh penggunaan:
 *   router.post('/', rateLimiter({ windowMs: 15*60*1000, max: 5 }), handler)
 */
const rateLimiter = (options = {}) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
      code: "RATE_LIMIT_GENERIC",
    },
    ...options,
  });
};

/**
 * ========================================
 * SENSITIVE OPERATIONS LIMITER
 * ========================================
 *
 * Apply ke sensitive operations (password change, delete account, etc)
 *
 * Rules:
 * - Max 3 attempts per hour per IP
 * - High security operations
 */
const sensitiveLimiter = isTestEnv
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // Max 3 attempts
      message: {
        success: false,
        message:
          "Terlalu banyak percobaan operasi sensitif. Silakan coba lagi setelah 1 jam.",
        code: "RATE_LIMIT_SENSITIVE",
      },
      handler: (req, res) => {
        console.warn(
          `⚠️ Sensitive operation rate limit for IP: ${req.ip} on ${req.path}`
        );
        res.status(429).json({
          success: false,
          message: "Terlalu banyak percobaan. Silakan coba lagi setelah 1 jam.",
          code: "RATE_LIMIT_SENSITIVE",
          retryAfter: 60 * 60,
        });
      },
    });

/**
 * ========================================
 * FILE UPLOAD LIMITER
 * ========================================
 *
 * Apply ke file upload endpoints
 *
 * Rules:
 * - Max 10 uploads per hour per IP
 * - Prevent storage abuse
 */
const uploadLimiter = isTestEnv
  ? noopMiddleware
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Max 10 uploads
      message: {
        success: false,
        message: "Terlalu banyak upload. Silakan coba lagi setelah 1 jam.",
        code: "RATE_LIMIT_UPLOAD",
      },
      handler: (req, res) => {
        console.warn(`⚠️ Upload rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          success: false,
          message:
            "Terlalu banyak upload file. Silakan coba lagi setelah 1 jam.",
          code: "RATE_LIMIT_UPLOAD",
          retryAfter: 60 * 60,
        });
      },
    });

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  sensitiveLimiter,
  uploadLimiter,
  rateLimiter,
};
