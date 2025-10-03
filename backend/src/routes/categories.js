/**
 * Routes untuk API kategori
 * Menyediakan endpoint untuk mengakses data kategori
 */

const express = require('express');
const router = express.Router();
const { getAllCategories } = require('../controllers/productController');

/**
 * GET /api/categories
 * Mendapatkan semua kategori beserta jumlah produknya
 */
router.get('/', getAllCategories);

module.exports = router;