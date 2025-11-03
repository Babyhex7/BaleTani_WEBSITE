/**
 * Admin Customer Routes
 * Routes untuk kelola customer di admin panel
 */

const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/adminCustomer.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

/**
 * GET /api/admin/customers
 * Ambil semua customer dengan pagination
 * Access: super_admin, super_whatsapp_admin, super_casier, whatsapp_admin, casier, finance_admin
 */
router.get(
  "/",
  authenticateAdmin,
  roleMiddleware([
    "super_admin",
    "super_whatsapp_admin",
    "super_casier",
    "whatsapp_admin",
    "casier",
    "finance_admin",
  ]),
  customerController.getAllCustomers
);

/**
 * GET /api/admin/customers/:id
 * Ambil detail customer beserta order history
 * Access: super_admin, super_whatsapp_admin, super_casier, whatsapp_admin, casier, finance_admin
 */
router.get(
  "/:id",
  authenticateAdmin,
  roleMiddleware([
    "super_admin",
    "super_whatsapp_admin",
    "super_casier",
    "whatsapp_admin",
    "casier",
    "finance_admin",
  ]),
  customerController.getCustomerById
);

/**
 * PUT /api/admin/customers/:id
 * Update data customer
 * Access: super_admin, super_whatsapp_admin, super_casier
 */
router.put(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_whatsapp_admin", "super_casier"]),
  customerController.updateCustomer
);

/**
 * PATCH /api/admin/customers/:id/status
 * Toggle status aktif/nonaktif customer
 * Access: super_admin, super_whatsapp_admin, super_casier
 */
router.patch(
  "/:id/status",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_whatsapp_admin", "super_casier"]),
  customerController.toggleCustomerStatus
);

/**
 * DELETE /api/admin/customers/:id
 * Hard delete customer
 * Access: super_admin only
 */
router.delete(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  customerController.deleteCustomer
);

module.exports = router;
