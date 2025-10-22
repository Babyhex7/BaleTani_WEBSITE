const { ProductImage, Product } = require("../models");
const fs = require("fs").promises;
const path = require("path");

/**
 * Upload multiple images for a product
 * POST /api/admin/products/:id/images
 */
exports.uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada gambar yang diupload",
      });
    }

    // Check total images (existing + new)
    const existingImages = await ProductImage.count({
      where: { product_id: id },
    });
    if (existingImages + req.files.length > 5) {
      // Delete uploaded files if exceeds limit
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: "Maksimal 5 gambar per produk",
      });
    }

    // Get highest display_order
    const maxOrder =
      (await ProductImage.max("display_order", {
        where: { product_id: id },
      })) || 0;

    // Create image records
    const imageRecords = req.files.map((file, index) => ({
      product_id: id,
      image_url: `/uploads/products/${file.filename}`,
      display_order: maxOrder + index + 1,
      is_main: existingImages === 0 && index === 0, // First image is main if no existing images
    }));

    const createdImages = await ProductImage.bulkCreate(imageRecords);

    res.status(201).json({
      success: true,
      message: "Gambar berhasil diupload",
      data: createdImages,
    });
  } catch (error) {
    console.error("Error uploading product images:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupload gambar",
      error: error.message,
    });
  }
};

/**
 * Update product image (set as main or update order)
 * PUT /api/admin/products/images/:imageId
 */
exports.updateProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { is_main, display_order } = req.body;

    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gambar tidak ditemukan",
      });
    }

    // If setting as main image, unset other main images
    if (is_main === true) {
      await ProductImage.update(
        { is_main: false },
        { where: { product_id: image.product_id } }
      );
    }

    // Update image
    if (is_main !== undefined) {
      image.is_main = is_main;
    }
    if (display_order !== undefined) {
      image.display_order = display_order;
    }

    await image.save();

    res.status(200).json({
      success: true,
      message: "Gambar berhasil diupdate",
      data: image,
    });
  } catch (error) {
    console.error("Error updating product image:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate gambar",
      error: error.message,
    });
  }
};

/**
 * Delete product image
 * DELETE /api/admin/products/images/:imageId
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gambar tidak ditemukan",
      });
    }

    const productId = image.product_id;
    const deletedOrder = image.display_order;

    // Delete image file from filesystem
    try {
      const imagePath = path.join(__dirname, "../../public", image.image_url);
      await fs.unlink(imagePath);
    } catch (fileError) {
      console.warn("File not found or already deleted:", fileError.message);
    }

    // Delete from database
    await image.destroy();

    // Update display_order of remaining images
    await ProductImage.decrement("display_order", {
      by: 1,
      where: {
        product_id: productId,
        display_order: { [require("sequelize").Op.gt]: deletedOrder },
      },
    });

    // If deleted image was main, set first image as main
    if (image.is_main) {
      const firstImage = await ProductImage.findOne({
        where: { product_id: productId },
        order: [["display_order", "ASC"]],
      });
      if (firstImage) {
        firstImage.is_main = true;
        await firstImage.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Gambar berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting product image:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus gambar",
      error: error.message,
    });
  }
};

/**
 * Reorder all product images
 * PUT /api/admin/products/:id/images/reorder
 */
exports.reorderProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // Array of { id, display_order }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data reorder tidak valid",
      });
    }

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Update each image's display_order
    const updatePromises = images.map(({ id: imageId, display_order }) =>
      ProductImage.update(
        { display_order },
        { where: { id: imageId, product_id: id } }
      )
    );

    await Promise.all(updatePromises);

    // Get updated images
    const updatedImages = await ProductImage.findAll({
      where: { product_id: id },
      order: [["display_order", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Urutan gambar berhasil diupdate",
      data: updatedImages,
    });
  } catch (error) {
    console.error("Error reordering product images:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengubah urutan gambar",
      error: error.message,
    });
  }
};

/**
 * Get all images for a product
 * GET /api/admin/products/:id/images
 */
exports.getProductImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const images = await ProductImage.findAll({
      where: { product_id: id },
      order: [["display_order", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Error getting product images:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil gambar",
      error: error.message,
    });
  }
};
