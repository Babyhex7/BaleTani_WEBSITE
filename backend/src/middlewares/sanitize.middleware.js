/**
 * ============================================
 * INPUT SANITIZATION MIDDLEWARE
 * ============================================
 *
 * Sanitize user input untuk prevent XSS attacks
 * Clean dangerous characters dari input sebelum processing
 *
 * @module sanitizeInput
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

/**
 * ========================================
 * SANITIZE STRING
 * ========================================
 *
 * Remove/escape dangerous HTML tags dan characters
 *
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Remove script tags and their content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove HTML tags but keep content
  str = str.replace(/<[^>]*>/g, "");

  // Escape special HTML characters
  const htmlEscapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  str = str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);

  return str.trim();
};

/**
 * ========================================
 * SANITIZE OBJECT
 * ========================================
 *
 * Recursively sanitize all string values in object
 *
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * ========================================
 * SANITIZE SQL INPUT
 * ========================================
 *
 * Extra protection against SQL injection
 * (Note: Sequelize already protects, but this is extra layer)
 *
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeSQLInput = (str) => {
  if (typeof str !== "string") return str;

  // Remove SQL comments
  str = str.replace(/--.*$/gm, "");
  str = str.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove common SQL injection patterns
  const dangerousPatterns = [
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    /\bUNION\b.*\bSELECT\b/gi,
    /\bDROP\b.*\bTABLE\b/gi,
    /\bEXEC\b.*\(/gi,
    /\bEXECUTE\b.*\(/gi,
  ];

  dangerousPatterns.forEach((pattern) => {
    str = str.replace(pattern, "");
  });

  return str.trim();
};

/**
 * ========================================
 * MIDDLEWARE: SANITIZE REQUEST BODY
 * ========================================
 *
 * Apply sanitization to req.body automatically
 * Use this middleware in routes that accept user input
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * ========================================
 * MIDDLEWARE: SANITIZE QUERY PARAMS
 * ========================================
 *
 * Apply sanitization to req.query automatically
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
};

/**
 * ========================================
 * MIDDLEWARE: SANITIZE ALL INPUT
 * ========================================
 *
 * Sanitize body, query, and params
 * Use this for comprehensive protection
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * ========================================
 * VALIDATE EMAIL
 * ========================================
 *
 * Check if email format is valid
 *
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ========================================
 * VALIDATE PHONE NUMBER (INDONESIA)
 * ========================================
 *
 * Check if Indonesian phone number format is valid
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
const isValidPhoneNumber = (phone) => {
  // Allow: 08xx, +62, 62, 0
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  const cleaned = phone.replace(/[\s-]/g, "");
  return phoneRegex.test(cleaned);
};

/**
 * ========================================
 * VALIDATE URL
 * ========================================
 *
 * Check if URL format is valid and safe
 *
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
const isValidURL = (url) => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
};

/**
 * ========================================
 * STRIP HTML TAGS
 * ========================================
 *
 * Remove all HTML tags from string
 * Keep only text content
 *
 * @param {string} str - String with HTML
 * @returns {string} - String without HTML
 */
const stripHtmlTags = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeSQLInput,
  sanitizeBody,
  sanitizeQuery,
  sanitizeInput,
  isValidEmail,
  isValidPhoneNumber,
  isValidURL,
  stripHtmlTags,
};
