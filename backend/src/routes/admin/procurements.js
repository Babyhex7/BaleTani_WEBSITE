const express = require('express');
const router = express.Router();
const { getAllProcurements, createProcurement } = require('../../controllers/adminProcurement.controller');
const { authenticateAdmin } = require('../../middlewares/auth.middleware');

// All procurement routes require admin auth
router.use(authenticateAdmin);

// List procurements
router.get('/', getAllProcurements);

// Create procurement
router.post('/', createProcurement);

module.exports = router;
