// ============================================
// LIBRARY: HELPER FUNCTIONS (Utility Umum)
// ============================================
// File ini berisi fungsi-fungsi helper yang sering dipakai
// Random generators, data pickers, formatters, dll

import { sleep } from "k6";

/**
 * Generate Random Integer
 *
 * @param {number} min - Nilai minimum (inclusive)
 * @param {number} max - Nilai maksimum (inclusive)
 * @returns {number} - Random integer antara min dan max
 *
 * Contoh:
 * const randomQty = randomInt(1, 5); // 1, 2, 3, 4, atau 5
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate Random Float
 *
 * @param {number} min - Nilai minimum
 * @param {number} max - Nilai maksimum
 * @param {number} decimals - Jumlah desimal (default: 2)
 * @returns {number} - Random float
 *
 * Contoh:
 * const price = randomFloat(10000, 50000, 0); // 35421
 */
export function randomFloat(min, max, decimals = 2) {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
}

/**
 * Pick Random Item dari Array
 *
 * @param {Array} array - Array items
 * @returns {*} - Random item dari array
 *
 * Contoh:
 * const customer = randomItem(customers);
 * const product = randomItem(products);
 */
export function randomItem(array) {
  if (!array || array.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Pick Multiple Random Items dari Array
 *
 * @param {Array} array - Array items
 * @param {number} count - Jumlah items yang mau dipick
 * @returns {Array} - Array of random items
 *
 * Contoh:
 * const products = randomItems(allProducts, 3); // Pick 3 random products
 */
export function randomItems(array, count) {
  if (!array || array.length === 0) return [];

  // Shuffle array
  const shuffled = array.slice().sort(() => 0.5 - Math.random());

  // Return first 'count' items
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Random Think Time (user thinking/reading)
 *
 * @param {number} minSeconds - Minimum detik
 * @param {number} maxSeconds - Maximum detik
 *
 * Contoh:
 * thinkTime(3, 8); // Sleep random 3-8 detik
 */
export function thinkTime(minSeconds, maxSeconds) {
  const seconds = randomFloat(minSeconds, maxSeconds, 1);
  sleep(seconds);
}

/**
 * Format Nomor HP ke format Indonesia (628xxx)
 *
 * @param {string} phone - Nomor HP (08xxx, 628xxx, atau +628xxx)
 * @returns {string} - Formatted phone (628xxx)
 *
 * Contoh:
 * formatPhoneNumber('081234567890')  -> '6281234567890'
 * formatPhoneNumber('6281234567890') -> '6281234567890'
 * formatPhoneNumber('+6281234567890') -> '6281234567890'
 */
export function formatPhoneNumber(phone) {
  let normalized = phone.replace(/\D/g, ""); // Remove non-digits

  if (normalized.startsWith("0")) {
    normalized = "62" + normalized.slice(1);
  } else if (normalized.startsWith("62")) {
    // Already correct format
  } else if (normalized.startsWith("8")) {
    normalized = "62" + normalized;
  }

  return normalized;
}

/**
 * Generate Random Phone Number (untuk testing)
 *
 * @returns {string} - Random phone number (628100000xxxx format)
 *
 * Contoh:
 * const phone = generateRandomPhone(); // '6281000000234'
 */
export function generateRandomPhone() {
  const randomDigits = randomInt(1, 9999).toString().padStart(4, "0");
  return `628100000${randomDigits}`;
}

/**
 * Generate Random Email
 *
 * @param {string} prefix - Prefix email (optional)
 * @returns {string} - Random email
 *
 * Contoh:
 * const email = generateRandomEmail(); // 'test1234@example.com'
 * const email2 = generateRandomEmail('customer'); // 'customer5678@example.com'
 */
export function generateRandomEmail(prefix = "test") {
  const randomNum = randomInt(1000, 9999);
  return `${prefix}${randomNum}@example.com`;
}

/**
 * Generate Random Customer Name
 *
 * @returns {string} - Random nama customer
 *
 * Contoh:
 * const name = generateRandomName(); // 'Test Customer 123'
 */
export function generateRandomName() {
  const names = [
    "Budi",
    "Siti",
    "Ahmad",
    "Dewi",
    "Andi",
    "Rina",
    "Joko",
    "Maya",
    "Agus",
    "Lina",
  ];
  const surnames = [
    "Santoso",
    "Wijaya",
    "Hidayat",
    "Lestari",
    "Pratama",
    "Kusuma",
    "Wibowo",
    "Putra",
    "Sari",
    "Permana",
  ];

  const firstName = randomItem(names);
  const lastName = randomItem(surnames);

  return `${firstName} ${lastName}`;
}

/**
 * Generate Random Address
 *
 * @returns {string} - Random alamat
 *
 * Contoh:
 * const address = generateRandomAddress(); // 'Jl. Merdeka No. 45, Jakarta'
 */
export function generateRandomAddress() {
  const streets = [
    "Jl. Merdeka",
    "Jl. Sudirman",
    "Jl. Gatot Subroto",
    "Jl. Thamrin",
    "Jl. Asia Afrika",
    "Jl. Diponegoro",
  ];
  const cities = [
    "Jakarta",
    "Bandung",
    "Surabaya",
    "Medan",
    "Semarang",
    "Yogyakarta",
    "Malang",
    "Solo",
    "Denpasar",
    "Makassar",
  ];

  const street = randomItem(streets);
  const number = randomInt(1, 999);
  const city = randomItem(cities);

  return `${street} No. ${number}, ${city}`;
}

/**
 * Wait Until Condition (polling with timeout)
 *
 * @param {Function} condition - Function yang return true/false
 * @param {number} timeoutMs - Timeout dalam milliseconds (default: 30000)
 * @param {number} intervalMs - Interval polling dalam ms (default: 1000)
 * @returns {boolean} - true jika condition terpenuhi, false jika timeout
 *
 * Contoh:
 * const success = waitUntil(() => {
 *   const res = http.get(url);
 *   return res.status === 200;
 * }, 30000, 1000);
 */
export function waitUntil(condition, timeoutMs = 30000, intervalMs = 1000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (condition()) {
      return true;
    }
    sleep(intervalMs / 1000); // K6 sleep in seconds
  }

  return false;
}

/**
 * Retry Function (jika gagal, coba lagi)
 *
 * @param {Function} fn - Function yang mau di-retry
 * @param {number} maxRetries - Max retry attempts (default: 3)
 * @param {number} delayMs - Delay between retries dalam ms (default: 1000)
 * @returns {*} - Result dari function atau null jika semua retry gagal
 *
 * Contoh:
 * const result = retry(() => {
 *   const res = http.get(url);
 *   if (res.status !== 200) throw new Error('Failed');
 *   return res.json();
 * }, 3, 2000);
 */
export function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        sleep(delayMs / 1000);
      }
    }
  }

  console.error(`❌ All ${maxRetries} attempts failed: ${lastError.message}`);
  return null;
}

/**
 * Format Currency (Rupiah)
 *
 * @param {number} amount - Jumlah uang
 * @returns {string} - Formatted currency (Rp 50.000)
 *
 * Contoh:
 * formatCurrency(50000); // 'Rp 50.000'
 */
export function formatCurrency(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

/**
 * Calculate Percentage
 *
 * @param {number} value - Nilai
 * @param {number} total - Total
 * @returns {number} - Percentage (0-100)
 *
 * Contoh:
 * percentage(45, 100); // 45
 */
export function percentage(value, total) {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Generate UUID v4 (simple implementation)
 *
 * @returns {string} - UUID string
 *
 * Note: Untuk production, gunakan library yang proper
 */
export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Sleep dengan Jitter (random delay untuk avoid thundering herd)
 *
 * @param {number} baseSeconds - Base sleep duration
 * @param {number} jitterPercent - Jitter percentage (default: 20%)
 *
 * Contoh:
 * sleepWithJitter(5, 20); // Sleep 4-6 detik (5 ± 20%)
 */
export function sleepWithJitter(baseSeconds, jitterPercent = 20) {
  const jitter = baseSeconds * (jitterPercent / 100);
  const min = baseSeconds - jitter;
  const max = baseSeconds + jitter;
  const sleepTime = randomFloat(min, max, 2);
  sleep(sleepTime);
}
