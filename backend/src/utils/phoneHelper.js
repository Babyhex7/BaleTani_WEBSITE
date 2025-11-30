/**
 * ============================================
 * PHONE NUMBER UTILITY FUNCTIONS
 * ============================================
 *
 * Centralized phone number handling untuk Indonesia
 * Format standar: 62xxx (country code Indonesia)
 *
 * @module phoneHelper
 * @author BaleTani Development Team
 */

/**
 * Normalize phone number ke format 62xxx
 *
 * Supported formats:
 * - 08xxx → 628xxx
 * - 8xxx → 628xxx
 * - 628xxx → 628xxx (no change)
 * - +628xxx → 628xxx
 *
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} Normalized phone number (62xxx format)
 *
 * @example
 * normalizePhoneNumber('08123456789') // returns '628123456789'
 * normalizePhoneNumber('8123456789')  // returns '628123456789'
 * normalizePhoneNumber('628123456789') // returns '628123456789'
 * normalizePhoneNumber('+628123456789') // returns '628123456789'
 */
function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;

  // Remove all non-digit characters (including +, spaces, dashes)
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("0")) {
    // Convert 08xx to 628xx
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    // Convert 8xx to 628xx
    cleaned = "62" + cleaned;
  } else if (!cleaned.startsWith("62")) {
    // Add 62 if not present
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number format (Indonesia)
 *
 * Rules:
 * - Must start with 0, 8, or 62
 * - Length: 10-15 digits after normalization
 * - Only digits allowed
 *
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 *
 * @example
 * isValidPhoneNumber('08123456789') // returns true
 * isValidPhoneNumber('123') // returns false
 * isValidPhoneNumber('abc') // returns false
 */
function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  // Check if contains only digits, +, spaces, or dashes
  if (!/^[0-9+\s-]+$/.test(phoneNumber)) {
    return false;
  }

  // Normalize and check length
  const normalized = normalizePhoneNumber(phoneNumber);

  // Indonesia phone format: 62 + 8-13 digits (total 10-15 chars)
  // Examples:
  // - 628123456789 (12 chars) ✓
  // - 6281234567890 (13 chars) ✓
  return /^62\d{8,13}$/.test(normalized);
}

/**
 * Format phone number untuk display (user-friendly)
 *
 * Format: 0812-3456-7890
 *
 * @param {string} phoneNumber - Phone number (any format)
 * @returns {string} Formatted phone number
 *
 * @example
 * formatPhoneNumberDisplay('628123456789') // returns '0812-3456-7890'
 */
function formatPhoneNumberDisplay(phoneNumber) {
  if (!phoneNumber) return phoneNumber;

  const normalized = normalizePhoneNumber(phoneNumber);

  // Convert 62 back to 0 for display
  if (normalized.startsWith("62")) {
    const withoutCountryCode = "0" + normalized.substring(2);

    // Format: 0812-3456-7890
    return withoutCountryCode.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }

  return phoneNumber;
}

/**
 * Sanitize phone number input (remove dangerous characters)
 *
 * @param {string} phoneNumber - Raw phone input
 * @returns {string} Sanitized phone number
 */
function sanitizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;

  // Remove any characters that could be used for SQL injection or XSS
  return phoneNumber.replace(/[^\d+\s-]/g, "");
}

module.exports = {
  normalizePhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumberDisplay,
  sanitizePhoneNumber,
};
