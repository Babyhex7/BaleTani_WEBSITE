const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const procurementController = require("../../controllers/adminProcurement.controller");

/**
 * ============================================
 * PROCUREMENT ROUTES
 * Base path: /api/admin/procurements
 * ============================================
 */

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/procurements
 * Get all procurements with filters
 */
router.get("/", procurementController.getAllProcurements);

/**
 * POST /api/admin/procurements
 * Create new procurement
 */
router.post("/", procurementController.createProcurement);

/**
 * GET /api/admin/procurements/:id
 * Get procurement by ID
 */
router.get("/:id", procurementController.getProcurementById);

/**
 * PUT /api/admin/procurements/:id
 * Update procurement (pending only)
 */
router.put("/:id", procurementController.updateProcurement);

/**
 * PUT /api/admin/procurements/:id/approve
 * Approve procurement
 */
router.put("/:id/approve", procurementController.approveProcurement);

/**
 * PUT /api/admin/procurements/:id/reject
 * Reject procurement
 */
router.put("/:id/reject", procurementController.rejectProcurement);

/**
 * DELETE /api/admin/procurements/:id
 * Soft delete procurement
 */
router.delete("/:id", procurementController.softDeleteProcurement);

/**
 * POST /api/admin/procurements/:id/restore
 * Restore soft deleted procurement
 */
router.post("/:id/restore", procurementController.restoreProcurement);

module.exports = router;
