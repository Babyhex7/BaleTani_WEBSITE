/**
 * ============================================================
 * CACHE SERVICE - Helper Functions untuk Cache Operations
 * ============================================================
 *
 * File ini berisi fungsi-fungsi helper untuk operasi cache.
 * Kenapa perlu file ini?
 * - Reusable (bisa dipakai di banyak controller)
 * - Error handling centralized
 * - Logging centralized
 * - Mudah maintenance
 *
 * Fungsi yang tersedia:
 * 1. get(key) - Ambil data dari cache
 * 2. set(key, value, ttl) - Simpan data ke cache
 * 3. del(key) - Hapus 1 cache
 * 4. delMany(keys) - Hapus banyak cache sekaligus
 * 5. delPattern(pattern) - Hapus cache dengan pattern tertentu
 * 6. flush() - Hapus SEMUA cache
 * 7. getStats() - Ambil statistik cache (hit/miss/keys)
 */

const cache = require("./nodeCacheClient");

class CacheService {
  /**
   * ========================================
   * GET - Ambil Data dari Cache
   * ========================================
   *
   * Fungsi ini akan coba ambil data dari cache.
   *
   * Return:
   * - Data dari cache (jika ada)
   * - undefined (jika tidak ada atau error)
   *
   * @param {string} key - Cache key
   * @returns {any|undefined} - Data atau undefined
   */
  get(key) {
    try {
      const value = cache.get(key);

      if (value !== undefined) {
        console.log(`[CACHE HIT] ✅ Key: ${key} - Data ditemukan di cache`);
        return value;
      } else {
        console.log(`[CACHE MISS] ❌ Key: ${key} - Data tidak ada di cache`);
        return undefined;
      }
    } catch (err) {
      console.error(`[CACHE ERROR] Get key "${key}":`, err.message);
      return undefined; // Jika error, return undefined (biar query database)
    }
  }

  /**
   * ========================================
   * SET - Simpan Data ke Cache
   * ========================================
   *
   * Fungsi ini akan simpan data ke cache dengan TTL tertentu.
   *
   * TTL (Time To Live):
   * - Berapa lama cache akan tersimpan (dalam detik)
   * - Setelah TTL habis, cache otomatis dihapus
   * - Default: 600 detik (10 menit)
   *
   * @param {string} key - Cache key
   * @param {any} value - Data yang mau disimpan (object, array, string, dll)
   * @param {number} ttl - Time to live dalam detik (default: 600 = 10 menit)
   * @returns {boolean} - true jika berhasil, false jika gagal
   */
  set(key, value, ttl = 600) {
    try {
      const success = cache.set(key, value, ttl);

      if (success) {
        console.log(
          `[CACHE SET] ✅ Key: ${key} - TTL: ${ttl}s (${ttl / 60} menit)`
        );
      } else {
        console.log(`[CACHE SET] ❌ Key: ${key} - Gagal simpan cache`);
      }

      return success;
    } catch (err) {
      console.error(`[CACHE ERROR] Set key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * ========================================
   * DELETE - Hapus 1 Cache
   * ========================================
   *
   * Fungsi ini akan hapus 1 cache berdasarkan key.
   *
   * Kapan digunakan?
   * - Saat admin update product (hapus cache product tersebut)
   * - Saat admin delete product (hapus cache product tersebut)
   *
   * @param {string} key - Cache key yang mau dihapus
   * @returns {number} - Jumlah cache yang dihapus (0 = tidak ada, 1 = berhasil)
   */
  del(key) {
    try {
      const deletedCount = cache.del(key);

      if (deletedCount > 0) {
        console.log(`[CACHE DELETE] ✅ Key: ${key} - Cache berhasil dihapus`);
      } else {
        console.log(`[CACHE DELETE] ⚠️ Key: ${key} - Cache tidak ditemukan`);
      }

      return deletedCount;
    } catch (err) {
      console.error(`[CACHE ERROR] Delete key "${key}":`, err.message);
      return 0;
    }
  }

  /**
   * ========================================
   * DELETE MANY - Hapus Banyak Cache Sekaligus
   * ========================================
   *
   * Fungsi ini akan hapus banyak cache sekaligus berdasarkan array keys.
   *
   * @param {Array<string>} keys - Array of cache keys
   * @returns {number} - Jumlah cache yang berhasil dihapus
   */
  delMany(keys) {
    try {
      if (!Array.isArray(keys) || keys.length === 0) {
        console.log("[CACHE DELETE MANY] ⚠️ Array keys kosong");
        return 0;
      }

      const deletedCount = cache.del(keys);
      console.log(
        `[CACHE DELETE MANY] ✅ ${deletedCount} cache berhasil dihapus`
      );
      return deletedCount;
    } catch (err) {
      console.error("[CACHE ERROR] Delete many:", err.message);
      return 0;
    }
  }

  /**
   * ========================================
   * DELETE PATTERN - Hapus Cache dengan Pattern
   * ========================================
   *
   * Fungsi ini akan hapus semua cache yang keynya mulai dengan pattern tertentu.
   *
   * Contoh:
   * - delPattern('customer:products:')
   *   → Hapus: customer:products:all, customer:products:category:1, dst
   *
   * - delPattern('admin:product:')
   *   → Hapus: admin:product:1, admin:product:2, dst
   *
   * Kapan digunakan?
   * - Saat admin create/update/delete product
   *   → Hapus semua cache products (customer & admin)
   *
   * @param {string} pattern - Pattern prefix (contoh: 'customer:products:')
   * @returns {number} - Jumlah cache yang dihapus
   */
  delPattern(pattern) {
    try {
      // Ambil semua keys yang ada di cache
      const allKeys = cache.keys();

      // Filter keys yang match dengan pattern
      const matchedKeys = allKeys.filter((key) => key.startsWith(pattern));

      if (matchedKeys.length === 0) {
        console.log(
          `[CACHE DELETE PATTERN] ⚠️ Pattern: ${pattern} - Tidak ada cache yang match`
        );
        return 0;
      }

      // Hapus semua keys yang match
      const deletedCount = cache.del(matchedKeys);
      console.log(
        `[CACHE DELETE PATTERN] ✅ Pattern: ${pattern} - ${deletedCount} cache dihapus`
      );

      return deletedCount;
    } catch (err) {
      console.error(`[CACHE ERROR] Delete pattern "${pattern}":`, err.message);
      return 0;
    }
  }

  /**
   * ========================================
   * FLUSH - Hapus SEMUA Cache
   * ========================================
   *
   * HATI-HATI! Fungsi ini akan hapus SEMUA cache.
   *
   * Kapan digunakan?
   * - Development/testing (reset cache)
   * - Maintenance (clear all cache)
   * - Emergency (ada bug di cache)
   *
   * JANGAN gunakan di production kecuali darurat!
   */
  flush() {
    try {
      cache.flushAll();
      console.log("[CACHE FLUSH] ✅ SEMUA cache berhasil dihapus");
    } catch (err) {
      console.error("[CACHE ERROR] Flush all:", err.message);
    }
  }

  /**
   * ========================================
   * GET STATS - Ambil Statistik Cache
   * ========================================
   *
   * Fungsi ini akan return statistik cache untuk monitoring.
   *
   * Return object:
   * {
   *   keys: 10,        // Jumlah cache yang tersimpan
   *   hits: 150,       // Jumlah cache hit (data ditemukan)
   *   misses: 20,      // Jumlah cache miss (data tidak ditemukan)
   *   ksize: 10,       // Ukuran keys
   *   vsize: 1024      // Ukuran values (bytes)
   * }
   *
   * Berguna untuk:
   * - Monitoring performa cache
   * - Calculate cache hit ratio: hits / (hits + misses)
   * - Monitor memory usage
   *
   * @returns {object} - Statistik cache
   */
  getStats() {
    try {
      const stats = cache.getStats();
      console.log("[CACHE STATS] 📊", {
        totalKeys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRatio:
          ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + "%",
      });
      return stats;
    } catch (err) {
      console.error("[CACHE ERROR] Get stats:", err.message);
      return null;
    }
  }

  /**
   * ========================================
   * HAS - Cek Apakah Key Ada di Cache
   * ========================================
   *
   * Fungsi ini cek apakah key ada di cache (tanpa mengambil valuenya).
   *
   * @param {string} key - Cache key
   * @returns {boolean} - true jika ada, false jika tidak
   */
  has(key) {
    try {
      return cache.has(key);
    } catch (err) {
      console.error(`[CACHE ERROR] Has key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * ========================================
   * GET TTL - Ambil Sisa Waktu Cache
   * ========================================
   *
   * Fungsi ini akan return sisa waktu (dalam detik) sebelum cache expired.
   *
   * Return:
   * - Number (detik) - Jika cache ada dan belum expired
   * - undefined - Jika cache tidak ada
   *
   * @param {string} key - Cache key
   * @returns {number|undefined} - Sisa TTL dalam detik
   */
  getTtl(key) {
    try {
      const ttl = cache.getTtl(key);

      if (ttl) {
        const remaining = Math.floor((ttl - Date.now()) / 1000);
        console.log(`[CACHE TTL] Key: ${key} - Sisa: ${remaining}s`);
        return remaining;
      }

      return undefined;
    } catch (err) {
      console.error(`[CACHE ERROR] Get TTL "${key}":`, err.message);
      return undefined;
    }
  }
}

// Export instance (singleton pattern)
module.exports = new CacheService();
