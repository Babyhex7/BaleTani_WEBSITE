const express = require("express");
const router = express.Router();
const stockHistoryController = require("../../controllers/stockHistory.controller");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const checkPermission = require("../../middlewares/checkPermission");

// GET /admin/stock-history - Get stock history for a product
router.get("/", authenticateAdmin, checkPermission("products", "read"), stockHistoryController.getByProduct);

// POST /admin/stock-history - Create manual stock history entry
router.post("/", authenticateAdmin, checkPermission("products", "update"), stockHistoryController.createManual);

module.exports = router;