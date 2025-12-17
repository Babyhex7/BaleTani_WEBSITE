const { Op } = require("sequelize");
const {
  Product,
  Category,
  ProductImage,
  Discount,
  ProductDiscount,
  ProcurementItem,
  OrderItem,
} = require("../models");

// Import cache service dan cache keys untuk invalidation
const cacheService = require("../cache/cacheService");
const { PATTERNS } = require("../cache/cacheKeys");

/**
 * GET /admin/products
 * Get all products with filtering, search, and pagination
 */
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      product_type = "",
      category_id = "",
      is_active = "",
      stock_below = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    // Build where clause
    const whereClause = {
      // Only get non-deleted products
    };

    // Search by name or description
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by product type
    if (product_type) {
      whereClause.product_type = product_type;
    }

    // Filter by category
    if (category_id) {
      whereClause.category_id = category_id;
    }

    // Filter by active status
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    // Filter by stock below threshold
    if (stock_below) {
      whereClause.total_stock = {
        [Op.lt]: parseFloat(stock_below),
      };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get products with relations
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "is_active"],
        },
        {
          model: ProductImage,
          as: "images",
          // where clause cleaned,
          required: false,
          attributes: ["id", "image_url", "display_order"],
          order: [["display_order", "ASC"]],
        },
        {
          model: Discount,
          as: "discounts",
          through: {
            // where clause cleaned,
            attributes: [],
          },
          where: {
            is_active: true,
            start_date: { [Op.lte]: new Date() },
            end_date: { [Op.gte]: new Date() },
          },
          required: false,
          attributes: ["id", "discount_name", "discount_type", "value"],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order.toUpperCase()]],
      distinct: true,
    });

    // Format response
    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();

      // Calculate active discount if any
      let finalPrice = parseFloat(productData.selling_price);
      let activeDiscount = null;

      if (productData.discounts && productData.discounts.length > 0) {
        const discount = productData.discounts[0]; // Take first active discount
        activeDiscount = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
        };

        if (discount.discount_type === "percentage") {
          finalPrice =
            finalPrice - (finalPrice * parseFloat(discount.value)) / 100;
        } else {
          finalPrice = finalPrice - parseFloat(discount.value);
        }
      }

      return {
        ...productData,
        selling_price: parseFloat(productData.selling_price),
        total_stock: parseFloat(productData.total_stock),
        final_price: parseFloat(finalPrice.toFixed(2)),
        active_discount: activeDiscount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil",
      data: {
        products: formattedProducts,
        pagination: {
          total_items: count,
          current_page: parseInt(page),
          items_per_page: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all products error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data produk",
      error: error.message,
    });
  }
};

/**
 * GET /admin/products/:id
 * Get product detail with full relations and history
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description", "is_active"],
        },
        {
          model: ProductImage,
          as: "images",
          // where clause cleaned,
          required: false,
          attributes: ["id", "image_url", "display_order", "created_at"],
          order: [["display_order", "ASC"]],
        },
        {
          model: Discount,
          as: "discounts",
          through: {
            // where clause cleaned,
            attributes: ["created_at"],
          },
          // where clause cleaned,
          required: false,
          attributes: [
            "id",
            "discount_name",
            "discount_type",
            "value",
            "start_date",
            "end_date",
            "is_active",
          ],
        },
        {
          model: ProcurementItem,
          as: "procurementItems",
          // where clause cleaned,
          required: false,
          limit: 10,
          order: [["created_at", "DESC"]],
          attributes: [
            "id",
            "procurement_id",
            "quantity",
            "purchase_price_per_unit",
            "subtotal",
            "expiry_date",
            "created_at",
          ],
        },
        {
          model: OrderItem,
          as: "orderItems",
          // where clause cleaned,
          required: false,
          limit: 10,
          order: [["created_at", "DESC"]],
          attributes: [
            "id",
            "order_id",
            "quantity",
            "original_price",
            "discount_price",
            "final_price",
            "subtotal",
            "created_at",
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    console.error("Get product by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil detail produk",
      error: error.message,
    });
  }
};

/**
 * POST /admin/products
 * Create new product
 */
const create = async (req, res) => {
  try {
    const {
      name,
      product_type,
      category_id,
      description,
      selling_price,
      quantity_info,
      shelf_life_days,
      initial_stock,
      is_active = true,
    } = req.body;

    // Validation
    if (!name || !product_type || !selling_price || !shelf_life_days) {
      return res.status(400).json({
        success: false,
        message:
          "Data tidak lengkap. Field name, product_type, selling_price, dan shelf_life_days wajib diisi",
      });
    }

    // Validate product_type
    if (!["online", "offline"].includes(product_type)) {
      return res.status(400).json({
        success: false,
        message: "Product type harus 'online' atau 'offline'",
      });
    }

    // Validate category if provided
    if (category_id) {
      const category = await Category.findOne({
        where: { id: category_id },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Kategori tidak ditemukan",
        });
      }
    }

    // Parse initial stock (default 0 if not provided)
    const initialStockValue = initial_stock ? parseInt(initial_stock, 10) : 0;

    // Validate initial stock (must be >= 0 and integer)
    if (initialStockValue < 0 || !Number.isInteger(initialStockValue)) {
      return res.status(400).json({
        success: false,
        message: "Stok awal harus berupa angka bulat positif",
      });
    }

    // Create product
    const product = await Product.create({
      name,
      product_type,
      category_id: category_id || null,
      description: description || null,
      selling_price: parseFloat(selling_price),
      quantity_info: quantity_info || null,
      shelf_life_days: parseInt(shelf_life_days),
      total_stock: initialStockValue, // Set initial stock from input or default to 0
      is_active: is_active === true || is_active === "true",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file, index) => {
        return ProductImage.create({
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          display_order: index + 1,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
      await Promise.all(imagePromises);
    }

    // Fetch created product with relations
    const createdProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
        },
        {
          model: ProductImage,
          as: "images",
          // where clause cleaned,
          required: false,
          attributes: ["id", "image_url", "display_order"],
          order: [["display_order", "ASC"]],
        },
      ],
    });

    // ========================================
    // CACHE INVALIDATION: Hapus cache customer & admin
    // ========================================
    // Saat product baru dibuat, semua cache products harus di-clear
    // agar customer & admin lihat data terbaru
    console.log(
      "[CACHE INVALIDATION] Product created - Clearing all products cache"
    );

    // 1. Hapus semua cache customer products
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);

    // 2. Hapus semua cache admin products
    cacheService.delPattern(PATTERNS.ADMIN_PRODUCTS);

    // 3. Hapus cache categories (karena product_count berubah)
    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);

    return res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      data: createdProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan produk",
      error: error.message,
    });
  }
};

/**
 * PUT /admin/products/:id
 * Update product
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      product_type,
      category_id,
      description,
      selling_price,
      quantity_info,
      shelf_life_days,
      is_active,
    } = req.body;

    // Find product
    const product = await Product.findOne({
      where: { id: id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Validate product_type if provided
    if (product_type && !["online", "offline"].includes(product_type)) {
      return res.status(400).json({
        success: false,
        message: "Product type harus 'online' atau 'offline'",
      });
    }

    // Validate category if provided
    if (category_id) {
      const category = await Category.findOne({
        where: { id: category_id },
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Kategori tidak ditemukan",
        });
      }
    }

    // Update product
    await product.update({
      name: name || product.name,
      product_type: product_type || product.product_type,
      category_id:
        category_id !== undefined ? category_id : product.category_id,
      description:
        description !== undefined ? description : product.description,
      selling_price: selling_price
        ? parseFloat(selling_price)
        : product.selling_price,
      quantity_info:
        quantity_info !== undefined ? quantity_info : product.quantity_info,
      shelf_life_days: shelf_life_days
        ? parseInt(shelf_life_days)
        : product.shelf_life_days,
      is_active: is_active !== undefined ? is_active : product.is_active,
      updated_at: new Date(),
    });

    // Handle new image uploads if files are provided
    if (req.files && req.files.length > 0) {
      // Get current max display_order
      const currentImages = await ProductImage.findAll({
        where: { product_id: product.id },
        attributes: ["display_order"],
        order: [["display_order", "DESC"]],
        limit: 1,
      });

      const maxOrder =
        currentImages.length > 0 ? currentImages[0].display_order : 0;

      // Create new images
      const imagePromises = req.files.map((file, index) => {
        return ProductImage.create({
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          display_order: maxOrder + index + 1,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
      await Promise.all(imagePromises);
    }

    // Fetch updated product with relations
    const updatedProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
        },
        {
          model: ProductImage,
          as: "images",
          // where clause cleaned,
          required: false,
          attributes: ["id", "image_url", "display_order"],
        },
      ],
    });

    // ========================================
    // CACHE INVALIDATION: Hapus cache yang terpengaruh
    // ========================================
    console.log(
      `[CACHE INVALIDATION] Product updated (ID: ${id}) - Clearing cache`
    );

    // 1. Hapus semua cache customer products (list & detail)
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);

    // 2. Hapus semua cache admin products
    cacheService.delPattern(PATTERNS.ADMIN_PRODUCTS);

    // 3. Hapus cache categories (kalau category_id berubah, product_count berubah)
    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);

    return res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui produk",
      error: error.message,
    });
  }
};

/**
 * DELETE /admin/products/:id
 * Hard delete product
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Import path dan fs untuk file cleanup
    const path = require("path");
    const fs = require("fs");

    // Find product dengan images
    const product = await Product.findOne({
      where: { id: id },
      include: [
        {
          model: ProductImage,
          as: "images",
          required: false,
          attributes: ["id", "image_url"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const productName = product.name;

    // ========================================
    // CLEANUP: Delete image files dari disk
    // ========================================
    if (product.images && product.images.length > 0) {
      console.log(
        `🗑️ Deleting ${product.images.length} image files for product ${id}`
      );

      product.images.forEach((img) => {
        const filePath = path.join(__dirname, "../../public", img.image_url);

        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`✅ Deleted image file: ${img.image_url}`);
          } catch (err) {
            console.error(`❌ Error deleting file ${filePath}:`, err.message);
          }
        } else {
          console.log(`⚠️ File not found (skipping): ${filePath}`);
        }
      });
    }

    // Delete related ProductDiscount entries first
    await ProductDiscount.destroy({
      where: { product_id: id },
    });

    // Delete product images from database
    await ProductImage.destroy({
      where: { product_id: id },
    });

    // Hard delete product
    await product.destroy();

    // ========================================
    // CACHE INVALIDATION: Hapus cache setelah delete
    // ========================================
    console.log(
      `[CACHE INVALIDATION] Product deleted (ID: ${id}) - Clearing cache`
    );

    // 1. Hapus semua cache customer products
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);

    // 2. Hapus semua cache admin products
    cacheService.delPattern(PATTERNS.ADMIN_PRODUCTS);

    // 3. Hapus cache categories (product_count berkurang)
    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);

    return res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus",
      data: {
        id: id,
        name: productName,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus produk",
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteProduct,
};
