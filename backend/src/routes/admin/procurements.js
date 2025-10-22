const express = require("express");
const router = express.Router();
const procurementController = require("../../controllers/procurement.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares/auth.middleware");

// Roles yang bisa view procurement
const VIEW_PROCUREMENT_ROLES = [
  "super_admin",
  "super_inventory_admin",
  "inventory_admin",
  "finance_admin",
];

// Roles yang bisa create procurement
const CREATE_PROCUREMENT_ROLES = [
  "super_admin",
  "super_inventory_admin",
  "inventory_admin",
];

// Roles yang bisa approve/reject procurement
const APPROVE_PROCUREMENT_ROLES = ["super_admin", "super_inventory_admin"];

// Get all procurements
router.get(
  "/",
  authMiddleware,
  roleMiddleware(VIEW_PROCUREMENT_ROLES),
  procurementController.getAllProcurements
);

// Get procurement statistics
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(VIEW_PROCUREMENT_ROLES),
  procurementController.getProcurementStats
);

// Get single procurement
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(VIEW_PROCUREMENT_ROLES),
  procurementController.getProcurementById
);

// Create procurement
router.post(
  "/",
  authMiddleware,
  roleMiddleware(CREATE_PROCUREMENT_ROLES),
  procurementController.createProcurement
);

// Approve procurement
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(APPROVE_PROCUREMENT_ROLES),
  procurementController.approveProcurement
);

// Reject procurement
router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(APPROVE_PROCUREMENT_ROLES),
  procurementController.rejectProcurement
);

module.exports = router;
