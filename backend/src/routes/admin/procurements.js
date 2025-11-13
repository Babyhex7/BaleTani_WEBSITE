const express = require('express');
const router = express.Router();
const {
  getAllProcurements,
  createProcurement,
  getProcurementById,
  updateProcurement,
  approveProcurement,
  rejectProcurement,
  softDeleteProcurement,
  restoreProcurement,
} = require('../../controllers/adminProcurement.controller');
const { authenticateAdmin } = require('../../middlewares/auth.middleware');

// All procurement routes require admin auth
router.use(authenticateAdmin);

// List procurements
router.get('/', getAllProcurements);

// Create procurement
router.post('/', createProcurement);

// Get procurement detail by ID
router.get('/:id', getProcurementById);

// Update procurement (only if status is pending)
router.put('/:id', updateProcurement);

// Approve procurement (Super Inventory Admin only)
router.put('/:id/approve', approveProcurement);

// Reject procurement (Super Inventory Admin only)
router.put('/:id/reject', rejectProcurement);

// Soft delete procurement
router.delete('/:id', softDeleteProcurement);

// Restore soft deleted procurement
router.post('/:id/restore', restoreProcurement);

module.exports = router;
