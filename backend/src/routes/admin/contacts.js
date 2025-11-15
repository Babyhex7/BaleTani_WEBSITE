/**
 * ============================================
 * ADMIN CONTACT MESSAGE ROUTES
 * ============================================
 * Routes untuk contact message management (admin only)
 *
 * @module admin/contacts.routes
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const express = require("express");
const router = express.Router();
const adminContactController = require("../../controllers/adminContact.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Allowed roles: super_admin, super_inventory_admin (bisa customize sesuai kebutuhan)
const allowedRoles = ["super_admin", "super_inventory_admin"];

/**
 * GET /api/admin/contacts/stats
 * Get contact message statistics
 */
router.get(
  "/stats",
  roleMiddleware(allowedRoles),
  adminContactController.getStatistics
);

/**
 * GET /api/admin/contacts
 * Get all contact messages with filters
 */
router.get(
  "/",
  roleMiddleware(allowedRoles),
  adminContactController.getAllMessages
);

/**
 * GET /api/admin/contacts/:id
 * Get single contact message by ID
 */
router.get(
  "/:id",
  roleMiddleware(allowedRoles),
  adminContactController.getMessageById
);

/**
 * PUT /api/admin/contacts/:id/status
 * Update message status
 */
router.put(
  "/:id/status",
  roleMiddleware(allowedRoles),
  adminContactController.updateStatus
);

/**
 * PUT /api/admin/contacts/:id/notes
 * Add or update admin notes
 */
router.put(
  "/:id/notes",
  roleMiddleware(allowedRoles),
  adminContactController.updateNotes
);

/**
 * DELETE /api/admin/contacts/:id
 * Delete contact message
 */
router.delete(
  "/:id",
  roleMiddleware(allowedRoles),
  adminContactController.deleteMessage
);

module.exports = router;
