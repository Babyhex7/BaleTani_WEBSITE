/**
 * Routes untuk API kategori (Public)
 * Menyediakan endpoint untuk mengakses data kategori
 */

const express = require("express");
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryById 
} = require("../../controllers/publicCategory.controller");

/**
 * GET /api/public/categories
 * Mendapatkan semua kategori beserta jumlah produknya
 */
router.get("/", getAllCategories);

/**
 * GET /api/public/categories/:id
 * Mendapatkan detail kategori dan produk-produknya
 */
router.get("/:id", getCategoryById);

module.exports = router;
