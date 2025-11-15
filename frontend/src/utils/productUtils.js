/**
 * ============================================
 * PRODUCT UTILITIES
 * ============================================
 * Kumpulan fungsi helper untuk mengolah data produk
 * Reusable di seluruh aplikasi
 *
 * @module productUtils
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

/**
 * Menghitung informasi diskon produk
 * Digunakan untuk kalkulasi harga, persentase, dan status diskon
 *
 * @function calculateDiscount
 * @param {Object} product - Object produk dengan price dan discount
 * @param {Number} product.price - Harga asli produk
 * @param {Object} product.discount - Object diskon (optional)
 * @param {Number} product.discount.finalPrice - Harga setelah diskon
 *
 * @returns {Object} Informasi diskon yang sudah dihitung
 * @returns {Boolean} returns.hasDiscount - Apakah produk punya diskon
 * @returns {Number} returns.discountPercentage - Persentase diskon (0-100)
 * @returns {Number} returns.finalPrice - Harga final setelah diskon
 * @returns {Number} returns.originalPrice - Harga asli sebelum diskon
 * @returns {Number} returns.savingsAmount - Jumlah penghematan dalam rupiah
 *
 * @example
 * const product = { price: 50000, discount: { finalPrice: 40000 } };
 * const discountInfo = calculateDiscount(product);
 * // returns: {
 * //   hasDiscount: true,
 * //   discountPercentage: 20,
 * //   finalPrice: 40000,
 * //   originalPrice: 50000,
 * //   savingsAmount: 10000
 * // }
 */
export const calculateDiscount = (product) => {
  // Validasi input product
  if (!product || typeof product !== "object") {
    return {
      hasDiscount: false,
      discountPercentage: 0,
      displayPercentage: 0,
      finalPrice: 0,
      originalPrice: 0,
      savingsAmount: 0,
      maxDiscount: null,
    };
  }

  // ✅ STRICT VALIDATION: Hanya return hasDiscount=true jika ada discount object dari backend
  // Cek apakah ada discount object yang valid dari backend
  const hasDiscountObject =
    product.discount &&
    typeof product.discount === "object" &&
    product.discount.finalPrice !== null &&
    product.discount.finalPrice !== undefined;

  // Jika tidak ada discount object dari backend, return no discount
  if (!hasDiscountObject) {
    const price =
      typeof product.price === "number"
        ? product.price
        : parseFloat(product.price || 0);
    return {
      hasDiscount: false,
      discountPercentage: 0,
      displayPercentage: 0,
      finalPrice: price,
      originalPrice: price,
      savingsAmount: 0,
      maxDiscount: null,
    };
  }

  // ✅ GUNAKAN DATA DARI BACKEND (PRE-CALCULATED)
  // Backend sudah hitung semua di ProductDiscount table
  const discountData = product.discount;

  // Original price: dari discount.originalPrice atau product.price
  const original =
    typeof discountData.originalPrice === "number"
      ? discountData.originalPrice
      : typeof product.price === "number"
      ? product.price
      : parseFloat(product.price || 0);

  // Final price: HARUS dari discount.finalPrice (pre-calculated by backend)
  const finalP =
    typeof discountData.finalPrice === "number"
      ? discountData.finalPrice
      : original;

  // Validasi: pastikan ada diskon real (finalPrice < originalPrice)
  const hasRealDiscount = finalP < original && finalP >= 0;

  if (!hasRealDiscount) {
    // Tidak ada diskon real, return no discount
    return {
      hasDiscount: false,
      discountPercentage: 0,
      displayPercentage: 0,
      finalPrice: original,
      originalPrice: original,
      savingsAmount: 0,
      maxDiscount: null,
    };
  }

  // ✅ CALCULATE PERCENTAGES
  // Actual discount percentage (after max discount applied)
  const actualPercentage = Math.round(((original - finalP) / original) * 100);

  // Savings amount: gunakan dari BE atau calculate
  const savingsAmount =
    typeof discountData.savings === "number"
      ? discountData.savings
      : original - finalP;

  // Max discount value
  const maxDiscount = discountData.maxDiscount || null;

  // Display percentage untuk badge (original % seperti di Shopee: "80% OFF")
  let displayPercentage = 0;

  if (discountData.percentage && discountData.percentage > 0) {
    // Priority 1: Gunakan percentage dari BE (original % sebelum max discount)
    displayPercentage = Math.round(discountData.percentage);
  } else if (discountData.value && discountData.type === "percentage") {
    // Priority 2: Gunakan value jika type = percentage
    displayPercentage = Math.round(discountData.value);
  } else {
    // Priority 3: Gunakan actual percentage
    displayPercentage = actualPercentage;
  }

  return {
    hasDiscount: true, // ✅ GUARANTEED TRUE karena sudah validated
    discountPercentage: actualPercentage, // Actual % after max discount
    displayPercentage, // Original % untuk badge (contoh: 80%)
    finalPrice: finalP,
    originalPrice: original,
    savingsAmount,
    maxDiscount,
  };
};

/**
 * Mendapatkan nama kategori dari object atau string
 * Handle berbagai format data kategori
 *
 * @function getCategoryName
 * @param {Object|String} category - Object kategori atau string nama kategori
 * @param {String} category.name - Nama kategori (jika object)
 * @param {String} category.category_name - Alternatif nama kategori (jika object)
 *
 * @returns {String} Nama kategori, atau empty string jika tidak ada
 *
 * @example
 * getCategoryName({ name: 'Sayuran' }); // 'Sayuran'
 * getCategoryName({ category_name: 'Buah' }); // 'Buah'
 * getCategoryName('Rempah'); // 'Rempah'
 * getCategoryName(null); // ''
 */
export const getCategoryName = (category) => {
  // Return empty string jika null/undefined
  if (!category) return "";

  // Jika category adalah string, langsung return
  if (typeof category === "string") return category;

  // Jika category adalah object, cari property name atau category_name
  if (typeof category === "object") {
    return category.name || category.category_name || "";
  }

  return "";
};

/**
 * Cek apakah produk tersedia (stok > 0)
 *
 * @function isProductAvailable
 * @param {Object} product - Object produk dengan stock
 * @param {Number} product.stock - Jumlah stok produk
 *
 * @returns {Boolean} True jika stok tersedia, false jika habis
 *
 * @example
 * isProductAvailable({ stock: 10 }); // true
 * isProductAvailable({ stock: 0 }); // false
 * isProductAvailable({ stock: -5 }); // false
 */
export const isProductAvailable = (product) => {
  // Validasi product object dan stock property
  if (!product || typeof product.stock !== "number") {
    return false;
  }

  // Stock harus lebih dari 0 untuk tersedia
  return product.stock > 0;
};

/**
 * Get stock status text berdasarkan jumlah stok
 * Untuk display status stok dalam bahasa Indonesia
 *
 * @function getStockStatus
 * @param {Number} stock - Jumlah stok
 *
 * @returns {String} Status text: 'Habis', 'Stok Terbatas', atau 'Tersedia'
 *
 * @example
 * getStockStatus(0); // 'Habis'
 * getStockStatus(5); // 'Stok Terbatas'
 * getStockStatus(50); // 'Tersedia'
 */
export const getStockStatus = (stock) => {
  // Validasi input
  if (typeof stock !== "number" || stock < 0) {
    return "Tidak Tersedia";
  }

  // Kondisi stok habis
  if (stock === 0) {
    return "Habis";
  }

  // Kondisi stok terbatas (kurang dari 10)
  if (stock < 10) {
    return "Stok Terbatas";
  }

  // Kondisi stok tersedia
  return "Tersedia";
};

/**
 * Format stock warning message
 *
 * @function getStockWarning
 * @param {Number} stock - Jumlah stok
 * @param {Number} threshold - Batas minimum stok (default: 5)
 *
 * @returns {String|null} Warning message atau null jika tidak perlu warning
 *
 * @example
 * getStockWarning(3); // 'Hanya tersisa 3 stok!'
 * getStockWarning(10); // null
 */
export const getStockWarning = (stock, threshold = 5) => {
  if (stock > 0 && stock <= threshold) {
    return `Hanya tersisa ${stock} stok!`;
  }
  return null;
};

/**
 * Validasi quantity yang akan ditambahkan ke cart
 *
 * @function validateCartQuantity
 * @param {Number} requestedQty - Quantity yang diminta
 * @param {Number} availableStock - Stok yang tersedia
 * @param {Number} currentCartQty - Quantity yang sudah ada di cart (default: 0)
 *
 * @returns {Object} Validation result
 * @returns {Boolean} returns.isValid - Apakah quantity valid
 * @returns {String} returns.message - Pesan error/sukses
 * @returns {Number} returns.maxAllowed - Maximum quantity yang bisa ditambah
 *
 * @example
 * validateCartQuantity(5, 10, 2);
 * // returns: { isValid: true, message: 'OK', maxAllowed: 8 }
 */
export const validateCartQuantity = (
  requestedQty,
  availableStock,
  currentCartQty = 0
) => {
  const totalQty = requestedQty + currentCartQty;
  const maxAllowed = availableStock - currentCartQty;

  if (requestedQty <= 0) {
    return {
      isValid: false,
      message: "Quantity harus lebih dari 0",
      maxAllowed: 0,
    };
  }

  if (availableStock === 0) {
    return {
      isValid: false,
      message: "Produk habis",
      maxAllowed: 0,
    };
  }

  if (totalQty > availableStock) {
    return {
      isValid: false,
      message: `Stok tidak mencukupi. Maksimal ${maxAllowed}`,
      maxAllowed,
    };
  }

  return {
    isValid: true,
    message: "OK",
    maxAllowed,
  };
};
