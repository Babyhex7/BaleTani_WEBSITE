/**
 * ============================================
 * ERROR HANDLER UTILITY
 * ============================================
 * Centralized error handling untuk admin pages
 * Extracts error message dari BE response dan tampilkan ke user
 * 
 * @module errorHandler
 * @author BaleTani Development Team
 */

import { toast } from 'react-hot-toast';

/**
 * Handle API errors dengan consistent pattern
 * Extracts error message dari axios error response
 * 
 * @param {Error} error - Axios error object
 * @param {string} defaultMsg - Default message jika tidak ada dari BE
 * @param {boolean} showToast - Show toast notification (default: true)
 * @returns {string} - Error message yang sudah di-extract
 * 
 * @example
 * try {
 *   await apiCall();
 * } catch (err) {
 *   const errorMsg = handleApiError(err, 'Gagal memuat data');
 *   setError(errorMsg);
 * }
 */
export const handleApiError = (error, defaultMsg = 'Terjadi kesalahan', showToast = true) => {
  // Extract error message with priority:
  // 1. Backend response message (error.response.data.message)
  // 2. Error message property (error.message)  
  // 3. Default message
  const errorMsg = error.response?.data?.message || error.message || defaultMsg;
  
  // Show toast notification
  if (showToast) {
    toast.error(errorMsg);
  }
  
  // Return message for further use (e.g., setError state)
  return errorMsg;
};

/**
 * Handle success response dengan consistent pattern
 * 
 * @param {string} message - Success message
 * @param {boolean} showToast - Show toast notification (default: true)
 * 
 * @example
 * handleApiSuccess('Data berhasil disimpan');
 */
export const handleApiSuccess = (message, showToast = true) => {
  if (showToast) {
    toast.success(message);
  }
};

/**
 * Extract error message without showing toast
 * Useful when you want to handle toast separately
 * 
 * @param {Error} error - Error object
 * @param {string} defaultMsg - Default message
 * @returns {string} - Error message
 * 
 * @example
 * const errorMsg = getErrorMessage(err, 'Gagal memuat');
 * // Handle error without automatic toast
 */
export const getErrorMessage = (error, defaultMsg = 'Terjadi kesalahan') => {
  return error.response?.data?.message || error.message || defaultMsg;
};

export default {
  handleApiError,
  handleApiSuccess,
  getErrorMessage
};
