const express = require("express");
const router = express.Router();
const productImagesController = require("../../controllers/adminProductImages.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/upload.middleware");

// All routes require authentication
router.use(authenticateAdmin);

// GET all images for a product
router.get(
  "/:id/images",
  roleMiddleware(["super_admin", "super_inventory_admin", "inventory_admin"]),
  productImagesController.getProductImages
);

// UPLOAD multiple images to a product
router.post(
  "/:id/images",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  upload.array("images", 5), // Max 5 images
  productImagesController.uploadProductImages
);

// UPDATE single image (set main or change order)
router.put(
  "/images/:imageId",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImagesController.updateProductImage
);

// REORDER all images for a product
router.put(
  "/:id/images/reorder",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImagesController.reorderProductImages
);

// DELETE single image
router.delete(
  "/images/:imageId",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImagesController.deleteProductImage
);

module.exports = router;
