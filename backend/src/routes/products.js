/**
 * Routes untuk API produk dan kategori
 * Menyediakan endpoint untuk mengakses data produk
 */

const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getAllCategories,
  searchProducts,
  getProductsByCategory,
} = require("../controllers/productController");

// Routes untuk produk
/**
 * GET /api/products
 * Mendapatkan semua produk dengan filter dan pagination
 * Query params: page, limit, category, search, sort, minPrice, maxPrice
 */
router.get("/", getAllProducts);

/**
 * GET /api/products/featured
 * Mendapatkan produk unggulan
 * Query params: limit
 */
router.get("/featured", getFeaturedProducts);

/**
 * GET /api/products/search
 * Pencarian produk berdasarkan keyword
 * Query params: q (keyword), limit
 */
router.get("/search", searchProducts);

/**
 * GET /api/products/category/:categorySlug
 * Mendapatkan produk berdasarkan kategori
 * Params: categorySlug
 * Query params: page, limit, sort
 */
router.get("/category/:categorySlug", getProductsByCategory);

/**
 * GET /api/products/:id
 * Mendapatkan detail produk berdasarkan ID
 * Params: id
 */
router.get("/:id", getProductById);

module.exports = router;
