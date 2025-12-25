// ================================================
// LIBRARY: AUTH HELPERS (Customer Authentication)
// ================================================
// File ini berisi helper functions untuk customer authentication
// Login, register, dan generate auth headers

import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Login Customer
 *
 * @param {string} baseUrl - Base URL API (e.g., http://localhost:5000)
 * @param {string} phoneNumber - Nomor HP customer (format: 08xxx atau 628xxx)
 * @param {string} password - Password customer (plaintext)
 * @returns {string|null} - JWT token jika sukses, null jika gagal
 *
 * Contoh:
 * const token = loginCustomer('http://localhost:5000', '081234567890', 'password123');
 * if (token) {
 *   console.log('Login successful!');
 * }
 */
export function loginCustomer(baseUrl, phoneNumber, password) {
  const loginUrl = `${baseUrl}/api/customer/auth/login`;

  const payload = JSON.stringify({
    phone_number: phoneNumber,
    password: password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "CustomerLogin" },
  };

  const response = http.post(loginUrl, payload, params);

  // Parse response body safely
  let responseBody = null;
  try {
    responseBody = response.json();
  } catch (e) {
    console.error(
      `❌ Failed to parse response for ${phoneNumber}: ${response.body}`
    );
    return { success: false, token: null, error: response.body };
  }

  // Validasi response
  const loginSuccess = check(response, {
    "login status 200": (r) => r.status === 200,
    "login has token": (r) => {
      try {
        return r.json("data.token") !== undefined;
      } catch (e) {
        return false;
      }
    },
    "login has customer data": (r) => {
      try {
        return r.json("data.customer") !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (loginSuccess && response.status === 200 && responseBody.success) {
    return {
      success: true,
      token: responseBody.data.token,
      customer: responseBody.data.customer,
    };
  }

  // Log error jika login gagal
  console.error(
    `❌ Login failed for ${phoneNumber}: ${response.status} - ${JSON.stringify(
      responseBody
    )}`
  );
  return {
    success: false,
    token: null,
    error: responseBody ? responseBody.message : response.body,
    statusCode: response.status,
  };
}

/**
 * Register Customer Baru
 *
 * @param {string} baseUrl - Base URL API
 * @param {object} customerData - Data customer baru
 * @param {string} customerData.phone_number - Nomor HP
 * @param {string} customerData.full_name - Nama lengkap
 * @param {string} customerData.password - Password
 * @param {string} customerData.address - Alamat (optional)
 * @returns {object|null} - { token, customer } jika sukses, null jika gagal
 *
 * Contoh:
 * const result = registerCustomer('http://localhost:5000', {
 *   phone_number: '081234567890',
 *   full_name: 'Budi Santoso',
 *   password: 'password123',
 *   address: 'Jl. Merdeka No. 45'
 * });
 */
export function registerCustomer(baseUrl, customerData) {
  const registerUrl = `${baseUrl}/api/customer/auth/register`;

  const payload = JSON.stringify(customerData);

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: { name: "CustomerRegister" },
  };

  const response = http.post(registerUrl, payload, params);

  // Validasi response
  const registerSuccess = check(response, {
    "register status 201": (r) => r.status === 201,
    "register has token": (r) => r.json("token") !== undefined,
    "register has customer": (r) => r.json("customer") !== undefined,
  });

  if (registerSuccess && response.status === 201) {
    return {
      token: response.json("token"),
      customer: response.json("customer"),
    };
  }

  console.error(`❌ Register failed: ${response.status} - ${response.body}`);
  return null;
}

/**
 * Generate Auth Headers dengan JWT Token
 *
 * @param {string} token - JWT token dari login
 * @returns {object} - Headers object untuk http request
 *
 * Contoh:
 * const headers = getAuthHeaders(token);
 * http.get(url, { headers });
 */
export function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get Customer Profile (authenticated endpoint)
 *
 * @param {string} baseUrl - Base URL API
 * @param {string} token - JWT token
 * @returns {object|null} - Customer profile data atau null jika gagal
 *
 * Contoh:
 * const profile = getCustomerProfile('http://localhost:5000', token);
 * console.log(profile.full_name);
 */
export function getCustomerProfile(baseUrl, token) {
  const profileUrl = `${baseUrl}/api/customer/profile`;

  const params = {
    headers: getAuthHeaders(token),
    tags: { name: "GetProfile" },
  };

  const response = http.get(profileUrl, params);

  const success = check(response, {
    "profile status 200": (r) => r.status === 200,
    "profile has customer": (r) => r.json("customer") !== undefined,
  });

  if (success && response.status === 200) {
    return response.json("customer");
  }

  return null;
}

/**
 * Login dengan Retry (jika gagal, coba lagi)
 *
 * @param {string} baseUrl - Base URL API
 * @param {string} phoneNumber - Nomor HP
 * @param {string} password - Password
 * @param {number} maxRetries - Maksimal retry (default: 3)
 * @returns {string|null} - JWT token atau null
 *
 * Berguna untuk handle intermittent failures
 */
export function loginWithRetry(baseUrl, phoneNumber, password, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    const token = loginCustomer(baseUrl, phoneNumber, password);

    if (token) {
      return token;
    }

    // Jika gagal dan masih ada retry, tunggu sebentar
    if (attempt < maxRetries) {
      console.log(`⚠️ Login attempt ${attempt} failed, retrying...`);
      sleep(2); // Tunggu 2 detik sebelum retry
    }
  }

  console.error(`❌ Login failed after ${maxRetries} attempts`);
  return null;
}

/**
 * Batch Login (login multiple accounts sekaligus)
 *
 * @param {string} baseUrl - Base URL API
 * @param {Array} customers - Array of customer objects [{phone_number, password}]
 * @returns {Array} - Array of tokens (null untuk yang gagal)
 *
 * Contoh:
 * const tokens = batchLogin(baseUrl, [
 *   { phone_number: '081234567890', password: 'pass1' },
 *   { phone_number: '081234567891', password: 'pass2' },
 * ]);
 */
export function batchLogin(baseUrl, customers) {
  return customers.map((customer) => {
    return loginCustomer(baseUrl, customer.phone_number, customer.password);
  });
}
