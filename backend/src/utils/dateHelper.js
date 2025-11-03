/**
 * DATE HELPER - WIB Timezone Utilities
 * Consistent timestamp handling for Indonesia Barat (WIB/+07:00)
 */

const moment = require("moment-timezone");

const TIMEZONE = "Asia/Jakarta";

/**
 * Get current date/time in WIB timezone
 * @returns {Date} JavaScript Date object in WIB
 */
const getWIBDate = () => {
  return moment().tz(TIMEZONE).toDate();
};

/**
 * Format date to readable WIB string
 * @param {Date} date - Date to format
 * @param {string} format - Moment.js format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
const formatWIBDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  return moment(date).tz(TIMEZONE).format(format);
};

/**
 * Format date for display (Indonesian format)
 * @param {Date} date - Date to format
 * @returns {string} e.g., "3 November 2025, 14:30"
 */
const formatDisplayDate = (date) => {
  return moment(date).tz(TIMEZONE).format("D MMMM YYYY, HH:mm");
};

/**
 * Check if date is today (WIB)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  const today = moment().tz(TIMEZONE).startOf("day");
  const checkDate = moment(date).tz(TIMEZONE).startOf("day");
  return today.isSame(checkDate);
};

module.exports = {
  getWIBDate,
  formatWIBDate,
  formatDisplayDate,
  isToday,
  TIMEZONE,
};
