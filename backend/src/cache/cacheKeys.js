/**
 * ============================================================
 * CACHE KEYS - Konstanta untuk Cache Keys
 * ============================================================
 *
 * File ini berisi semua key yang digunakan untuk cache.
 * Kenapa perlu file ini?
 * - Hindari typo (salah ketik key)
 * - Centralized (semua key di 1 tempat)
 * - Mudah maintenance (kalau mau ganti key, cukup di sini)
 * - Auto-complete di IDE (intellisense)
 *
 * Naming Convention:
 * - Prefix "customer:" untuk data customer/public
 * - Prefix "admin:" untuk data admin
 * - Format: {prefix}:{entity}:{filter}:{id}
 *
 * Contoh:
 * - customer:products:all (semua products untuk customer)
 * - customer:product:123 (product id 123)
 * - admin:products:page:1 (products page 1 untuk admin)
 */

module.exports = {
  /**
   * ========================================
   * CUSTOMER CACHE KEYS (Public/Customer Side)
   * ========================================
   */
  CUSTOMER: {
    /**
     * Products List (Semua Products atau Filter by Category)
     *
     * Usage:
     * - CUSTOMER.PRODUCTS_LIST('all', 1) → customer:products:all:page:1
     * - CUSTOMER.PRODUCTS_LIST('123', 1) → customer:products:category:123:page:1
     *
     * @param {string|null} categoryId - ID category atau 'all' untuk semua
     * @param {number} page - Nomor halaman (untuk pagination)
     * @returns {string} Cache key
     */
    PRODUCTS_LIST: (categoryId = "all", page = 1) => {
      if (categoryId && categoryId !== "all") {
        return `customer:products:category:${categoryId}:page:${page}`;
      }
      return `customer:products:all:page:${page}`;
    },

    /**
     * Product Detail (Single Product)
     *
     * Usage:
     * - CUSTOMER.PRODUCT_DETAIL(123) → customer:product:123
     *
     * @param {number|string} productId - ID product
     * @returns {string} Cache key
     */
    PRODUCT_DETAIL: (productId) => `customer:product:${productId}`,

    /**
     * Categories List (Semua Categories)
     *
     * Usage:
     * - CUSTOMER.CATEGORIES → customer:categories:list
     *
     * @returns {string} Cache key
     */
    CATEGORIES: "customer:categories:list",

    /**
     * Category Detail (Single Category dengan Products)
     *
     * Usage:
     * - CUSTOMER.CATEGORY_DETAIL(123) → customer:category:123
     *
     * @param {number|string} categoryId - ID category
     * @returns {string} Cache key
     */
    CATEGORY_DETAIL: (categoryId) => `customer:category:${categoryId}`,

    /**
     * Featured/Promo Products (Products dengan Discount Aktif)
     *
     * Usage:
     * - CUSTOMER.FEATURED_PRODUCTS → customer:featured:products
     *
     * @returns {string} Cache key
     */
    FEATURED_PRODUCTS: "customer:featured:products",

    /**
     * Discounts List (Semua Promo Aktif)
     *
     * Usage:
     * - CUSTOMER.DISCOUNTS_LIST → customer:discounts:list
     *
     * @returns {string} Cache key
     */
    DISCOUNTS_LIST: "customer:discounts:list",

    /**
     * Discount Detail (Single Discount dengan Products)
     *
     * Usage:
     * - CUSTOMER.DISCOUNT_DETAIL(123) → customer:discount:123
     *
     * @param {number|string} discountId - ID discount
     * @returns {string} Cache key
     */
    DISCOUNT_DETAIL: (discountId) => `customer:discount:${discountId}`,

    /**
     * Discount Products (Products dalam Discount Tertentu)
     *
     * Usage:
     * - CUSTOMER.DISCOUNT_PRODUCTS(123, 1) → customer:discount:123:products:page:1
     *
     * @param {number|string} discountId - ID discount
     * @param {number} page - Nomor halaman
     * @returns {string} Cache key
     */
    DISCOUNT_PRODUCTS: (discountId, page = 1) =>
      `customer:discount:${discountId}:products:page:${page}`,
  },

  /**
   * ========================================
   * ADMIN CACHE KEYS (Admin Side)
   * ========================================
   */
  ADMIN: {
    /**
     * Products List Admin (dengan Filter & Pagination)
     *
     * Usage:
     * - ADMIN.PRODUCTS_LIST(1) → admin:products:page:1
     * - ADMIN.PRODUCTS_LIST(1, '123') → admin:products:category:123:page:1
     *
     * @param {number} page - Nomor halaman
     * @param {string|null} categoryId - ID category (opsional)
     * @returns {string} Cache key
     */
    PRODUCTS_LIST: (page = 1, categoryId = null) => {
      if (categoryId) {
        return `admin:products:category:${categoryId}:page:${page}`;
      }
      return `admin:products:page:${page}`;
    },

    /**
     * Product Detail Admin
     *
     * Usage:
     * - ADMIN.PRODUCT_DETAIL(123) → admin:product:123
     *
     * @param {number|string} productId - ID product
     * @returns {string} Cache key
     */
    PRODUCT_DETAIL: (productId) => `admin:product:${productId}`,

    /**
     * Categories List Admin
     *
     * Usage:
     * - ADMIN.CATEGORIES → admin:categories:list
     *
     * @returns {string} Cache key
     */
    CATEGORIES: "admin:categories:list",

    /**
     * Permissions untuk User (RBAC)
     *
     * Usage:
     * - ADMIN.PERMISSIONS('user-uuid-123') → admin:permissions:user-uuid-123
     *
     * @param {string} userId - UUID user
     * @returns {string} Cache key
     */
    PERMISSIONS: (userId) => `admin:permissions:${userId}`,

    /**
     * Dashboard Statistics
     *
     * Usage:
     * - ADMIN.DASHBOARD_STATS → admin:dashboard:stats
     *
     * @returns {string} Cache key
     */
    DASHBOARD_STATS: "admin:dashboard:stats",
  },

  /**
   * ========================================
   * PATTERN KEYS (untuk Delete Multiple Cache)
   * ========================================
   *
   * Pattern ini digunakan untuk hapus banyak cache sekaligus
   * dengan prefix yang sama.
   *
   * Contoh:
   * - deletePattern(PATTERNS.CUSTOMER_PRODUCTS)
   *   → hapus semua cache yang mulai dengan "customer:products:"
   */
  PATTERNS: {
    // Customer patterns
    CUSTOMER_PRODUCTS: "customer:products:",
    CUSTOMER_CATEGORIES: "customer:categories:",
    CUSTOMER_FEATURED: "customer:featured:",
    CUSTOMER_DISCOUNTS: "customer:discount", // Akan match: customer:discounts:list, customer:discount:123, customer:discount:123:products:page:1

    // Admin patterns
    ADMIN_PRODUCTS: "admin:products:",
    ADMIN_CATEGORIES: "admin:categories:",
    ADMIN_PERMISSIONS: "admin:permissions:",
  },
};
