/**
 * ============================================
 * VALIDATION UTILITY FUNCTIONS
 * ============================================
 *
 * Centralized validation functions untuk input data
 *
 * @module validationHelper
 * @author BaleTani Development Team
 */

/**
 * Validate nama/username - hanya huruf, angka, spasi, titik, dan underscore
 * 
 * Rules:
 * - Minimal 3 karakter
 * - Maksimal 50 karakter
 * - Hanya boleh: huruf (a-z, A-Z), angka (0-9), spasi, titik (.), underscore (_)
 * - Tidak boleh karakter spesial seperti: !@#$%^&*()+={}[]|:;"'<>?/\
 * - Tidak boleh dimulai atau diakhiri dengan spasi
 * 
 * @param {string} name - Nama atau username yang akan divalidasi
 * @returns {object} { isValid: boolean, message: string }
 * 
 * @example
 * validateName('John Doe') // { isValid: true, message: 'Valid' }
 * validateName('Budi_123') // { isValid: true, message: 'Valid' }
 * validateName('Pobi#$') // { isValid: false, message: '...' }
 */
function validateName(name) {
  if (!name) {
    return {
      isValid: false,
      message: 'Nama tidak boleh kosong'
    };
  }

  // Remove leading/trailing whitespace
  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 3) {
    return {
      isValid: false,
      message: 'Nama minimal 3 karakter'
    };
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      message: 'Nama maksimal 50 karakter'
    };
  }

  // Check for special characters (hanya boleh huruf, angka, spasi, titik, underscore)
  // ^: start, $: end, \p{L}: any letter in any language, \d: digit, \s: space, .: dot, _: underscore
  const validNameRegex = /^[\p{L}\d\s._]+$/u;
  
  if (!validNameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Nama hanya boleh berisi huruf, angka, spasi, titik, dan underscore. Karakter spesial tidak diperbolehkan'
    };
  }

  // Check if name starts or ends with space
  if (name !== trimmedName) {
    return {
      isValid: false,
      message: 'Nama tidak boleh dimulai atau diakhiri dengan spasi'
    };
  }

  return {
    isValid: true,
    message: 'Valid'
  };
}

/**
 * Validate password
 * 
 * Rules:
 * - Minimal 6 karakter
 * - Maksimal 100 karakter
 * 
 * @param {string} password - Password yang akan divalidasi
 * @returns {object} { isValid: boolean, message: string }
 */
function validatePassword(password) {
  if (!password) {
    return {
      isValid: false,
      message: 'Password tidak boleh kosong'
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password minimal 8 karakter'
    };
  }

  if (password.length > 100) {
    return {
      isValid: false,
      message: 'Password maksimal 100 karakter'
    };
  }

  return {
    isValid: true,
    message: 'Valid'
  };
}

/**
 * Validate address
 * 
 * Rules:
 * - Maksimal 255 karakter
 * - Boleh kosong (optional field)
 * 
 * @param {string} address - Alamat yang akan divalidasi
 * @returns {object} { isValid: boolean, message: string }
 */
function validateAddress(address) {
  // Address is optional
  if (!address || address.trim() === '') {
    return {
      isValid: true,
      message: 'Valid'
    };
  }

  if (address.length > 255) {
    return {
      isValid: false,
      message: 'Alamat maksimal 255 karakter'
    };
  }

  return {
    isValid: true,
    message: 'Valid'
  };
}

module.exports = {
  validateName,
  validatePassword,
  validateAddress,
};
