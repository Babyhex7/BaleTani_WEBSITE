/**
 * ============================================================
 * NODE CACHE CLIENT - Setup Instance untuk Caching
 * ============================================================
 *
 * File ini berisi konfigurasi dan setup untuk node-cache.
 * Cache ini akan digunakan untuk menyimpan data di memory (RAM)
 * agar query database lebih cepat.
 *
 * Kenapa pakai node-cache?
 * - Gratis 100% (MIT License)
 * - Mudah setup (tidak perlu Redis server)
 * - Auto delete cache yang expired
 * - Built-in statistics untuk monitoring
 */

const NodeCache = require("node-cache");

/**
 * Konfigurasi Cache
 *
 * stdTTL: Standard Time To Live (default berapa lama cache tersimpan)
 *         0 = tidak ada default, harus set manual per item
 *
 * checkperiod: Setiap berapa detik cek apakah ada cache yang expired
 *              120 = cek setiap 2 menit, lalu hapus cache yang expired
 *
 * useClones: false = performance lebih cepat (tapi hati-hati mutate data)
 *            true = lebih aman (clone data), tapi sedikit lebih lambat
 *
 * deleteOnExpire: true = otomatis hapus cache yang expired
 */
const cache = new NodeCache({
  stdTTL: 0, // Default: tidak ada TTL (set manual per key)
  checkperiod: 120, // Cek expired cache setiap 2 menit
  useClones: false, // Performance mode (tidak clone data)
  deleteOnExpire: true, // Auto delete cache yang expired
});

/**
 * Event Listeners untuk Monitoring
 *
 * Event ini akan log setiap aktivitas cache
 * Berguna untuk debugging dan monitoring performa
 */

// Event: saat cache baru di-set
cache.on("set", (key, value) => {
  console.log(`[CACHE SET] Key: ${key}`);
});

// Event: saat cache expired (TTL habis)
cache.on("expired", (key, value) => {
  console.log(`[CACHE EXPIRED] Key: ${key} - TTL habis, cache dihapus`);
});

// Event: saat cache di-delete manual
cache.on("del", (key, value) => {
  console.log(`[CACHE DELETE] Key: ${key} - Cache dihapus manual`);
});

// Event: saat semua cache di-flush (hapus semua)
cache.on("flush", () => {
  console.log("[CACHE FLUSH] Semua cache dihapus");
});

/**
 * Export cache instance
 * Instance ini akan digunakan di cacheService.js
 */
module.exports = cache;
