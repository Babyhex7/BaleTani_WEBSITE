const { Op } = require("sequelize");
const { Product, ProductImage, SoftDeleteLog } = require("../models");
const path = require("path");
const fs = require("fs");

/**
 * POST /admin/products/:id/images
 * Upload multiple product images
 */
const upload = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    // Check if product exists
    const product = await Product.findOne({
      where: { id: id, deleted_at: null },
    });

    if (!product) {
      // Delete uploaded files if product not found
      if (files && files.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }

      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diupload",
      });
    }

    // Get current max display_order
    const maxOrder = await ProductImage.max("display_order", {
      where: {
        product_id: id,
        deleted_at: null,
      },
    });

    const startOrder = (maxOrder || 0) + 1;

    // Create image records
    const imagePromises = files.map((file, index) => {
      const imageUrl = `/uploads/products/${file.filename}`;

      return ProductImage.create({
        product_id: id,
        image_url: imageUrl,
        display_order: startOrder + index,
        created_at: new Date(),
      });
    });

    const images = await Promise.all(imagePromises);

    return res.status(201).json({
      success: true,
      message: `Berhasil mengupload ${files.length} gambar`,
      data: {
        product_id: id,
        images: images.map((img) => ({
          id: img.id,
          image_url: img.image_url,
          display_order: img.display_order,
          created_at: img.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Upload product images error:", error);

    // Delete uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupload gambar",
      error: error.message,
    });
  }
};

/**
 * PUT /admin/products/:id/images/reorder
 * Reorder product images
 * Body: { images: [{ id: 'uuid', display_order: 1 }, ...] }
 */
const reorder = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Data gambar tidak valid. Format: { images: [{ id, display_order }] }",
      });
    }

    // Check if product exists
    const product = await Product.findOne({
      where: { id: id, deleted_at: null },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Validate all images belong to this product
    const imageIds = images.map((img) => img.id);
    const existingImages = await ProductImage.findAll({
      where: {
        id: { [Op.in]: imageIds },
        product_id: id,
        deleted_at: null,
      },
    });

    if (existingImages.length !== images.length) {
      return res.status(400).json({
        success: false,
        message: "Beberapa gambar tidak ditemukan atau bukan milik produk ini",
      });
    }

    // Update display_order
    const updatePromises = images.map((img) => {
      return ProductImage.update(
        { display_order: img.display_order },
        {
          where: {
            id: img.id,
            product_id: id,
          },
        }
      );
    });

    await Promise.all(updatePromises);

    // Fetch updated images
    const updatedImages = await ProductImage.findAll({
      where: {
        product_id: id,
        deleted_at: null,
      },
      order: [["display_order", "ASC"]],
      attributes: ["id", "image_url", "display_order"],
    });

    return res.status(200).json({
      success: true,
      message: "Urutan gambar berhasil diperbarui",
      data: {
        product_id: id,
        images: updatedImages,
      },
    });
  } catch (error) {
    console.error("Reorder product images error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengatur ulang urutan gambar",
      error: error.message,
    });
  }
};

/**
 * DELETE /admin/products/images/:imageId
 * Delete product image (soft delete)
 */
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { reason = "" } = req.body;
    const adminId = req.user.id;

    // Find image
    const image = await ProductImage.findOne({
      where: { id: imageId, deleted_at: null },
      include: [
        {
          model: Product,
          as: "product",
          where: { deleted_at: null },
          required: true,
        },
      ],
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gambar tidak ditemukan",
      });
    }

    const productId = image.product_id;
    const imagePath = path.join(__dirname, "../../public", image.image_url);

    // Soft delete image
    await image.update({
      deleted_at: new Date(),
      deleted_by: adminId,
    });

    // Log to soft_delete_logs
    await SoftDeleteLog.create({
      table_name: "product_images",
      record_id: image.id,
      deleted_by: adminId,
      deleted_reason: reason,
      deleted_at: new Date(),
    });

    // Delete physical file
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (fileError) {
      console.error("Error deleting physical file:", fileError);
      // Continue even if file deletion fails
    }

    // Get remaining images
    const remainingImages = await ProductImage.findAll({
      where: {
        product_id: productId,
        deleted_at: null,
      },
      order: [["display_order", "ASC"]],
      attributes: ["id", "image_url", "display_order"],
    });

    return res.status(200).json({
      success: true,
      message: "Gambar berhasil dihapus",
      data: {
        deleted_image_id: imageId,
        remaining_images: remainingImages,
      },
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus gambar",
      error: error.message,
    });
  }
};

/**
 * GET /admin/products/:id/images
 * Get all images for a product
 */
const getByProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findOne({
      where: { id: id, deleted_at: null },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Get images
    const images = await ProductImage.findAll({
      where: {
        product_id: id,
        deleted_at: null,
      },
      order: [["display_order", "ASC"]],
      attributes: ["id", "image_url", "display_order", "created_at"],
    });

    return res.status(200).json({
      success: true,
      message: "Data gambar produk berhasil diambil",
      data: {
        product_id: id,
        product_name: product.name,
        total_images: images.length,
        images: images,
      },
    });
  } catch (error) {
    console.error("Get product images error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data gambar",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  reorder,
  deleteImage,
  getByProduct,
};
