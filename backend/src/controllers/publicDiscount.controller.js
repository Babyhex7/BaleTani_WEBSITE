/**
 * PUBLIC DISCOUNT CONTROLLER
 * Handles discount/promo display untuk customers (no authentication required)
 *
 * CACHING STRATEGY:
 * - Discounts list: Cache 30 menit (1800 detik)
 * - Discount detail: Cache 30 menit (1800 detik)
 * - Cache invalidation: Saat admin CRUD discount
 */

const {
  Discount,
  Product,
  ProductDiscount,
  ProductImage,
  Category,
} = require("../models");
const { Op } = require("sequelize");

// Import cache service dan cache keys
const cacheService = require("../cache/cacheService");
const { CUSTOMER } = require("../cache/cacheKeys");

/**
 * Get all active discounts untuk customer
 * @route GET /api/public/discounts
 *
 * CACHING:
 * - Cache key: customer:discounts:list
 * - TTL: 1800 detik (30 menit)
 * - Invalidation: Saat admin create/update/delete discount
 */
exports.getAllDiscounts = async (req, res) => {
  try {
    console.log("🎁 [PUBLIC DISCOUNTS] Request received"); // Debug log

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    const cacheKey = CUSTOMER.DISCOUNTS_LIST;
    const cachedData = cacheService.get(cacheKey);

    // Jika cache ada, langsung return
    if (cachedData) {
      console.log(`[CACHE HIT] ✅ Key: ${cacheKey} - Data ditemukan di cache`);
      return res.json({
        success: true,
        message: "Discounts retrieved from cache",
        data: cachedData,
        cached: true,
      });
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================
    console.log(`[CACHE MISS] ❌ Key: ${cacheKey} - Data tidak ada di cache`);
    console.log("[DB QUERY] Discounts - Cache miss, querying database...");

    // Get active discounts only
    const currentDate = new Date();

    const discounts = await Discount.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
      include: [
        {
          model: Product,
          as: "products",
          through: {
            attributes: ["discounted_price", "original_price"], // Include pre-calculated prices
          },
          where: {
            is_active: true,
            product_type: "online", // Only show online products to customers
            total_stock: { [Op.gt]: 0 },
          },
          attributes: [
            "id",
            "name",
            "description",
            "selling_price",
            "total_stock",
            "category_id",
          ],
          required: false, // LEFT JOIN (discount tanpa produk tetap muncul)
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "category_name"],
              required: false,
            },
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "image_url", "display_order"],
              required: false,
              separate: true,
              order: [["display_order", "ASC"]],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Format response dengan full product details
    const formattedDiscounts = discounts.map((discount) => {
      const discountData = discount.toJSON();

      // Format products untuk setiap discount
      const products =
        discountData.products?.map((product) => {
          const primaryImage = product.images?.[0];

          // Use pre-calculated discounted_price from ProductDiscount table
          const discountedPrice = product.ProductDiscount?.discounted_price
            ? parseFloat(product.ProductDiscount.discounted_price)
            : parseFloat(product.selling_price);

          // Calculate actual discount amount (sudah include max_discount)
          const actualDiscountAmount =
            parseFloat(product.selling_price) - discountedPrice;

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.selling_price),
            discountedPrice: discountedPrice,
            actualDiscountAmount: actualDiscountAmount, // Untuk tampilan "Hemat Rp xxx" (sudah consider max_discount)
            stock: product.total_stock,
            category: product.category?.category_name || null,
            image: primaryImage?.image_url || "/placeholder-product.jpg",
          };
        }) || [];

      return {
        id: discountData.id,
        name: discountData.discount_name,
        type: discountData.discount_type,
        value: parseFloat(discountData.value),
        // maxDiscount tidak dikirim ke FE (seperti Shopee), tapi sudah diterapkan di discountedPrice
        startDate: discountData.start_date,
        endDate: discountData.end_date,
        productsCount: products.length,
        products: products, // ✅ Include full product details
      };
    });

    // ========================================
    // STEP 3: Save to Cache
    // ========================================
    cacheService.set(cacheKey, formattedDiscounts, 1800);
    console.log(`[CACHE SET] ✅ Key: ${cacheKey} - TTL: 1800s (30 menit)`);

    res.json({
      success: true,
      message: "Active discounts fetched successfully",
      data: formattedDiscounts,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching discounts:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
      error: error.message,
    });
  }
};

/**
 * Get discount detail by ID untuk customer
 * @route GET /api/public/discounts/:id
 *
 * CACHING:
 * - Cache key: customer:discount:{id}
 * - TTL: 1800 detik (30 menit)
 * - Invalidation: Saat admin update/delete discount
 */
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🎁 [PUBLIC DISCOUNT DETAIL] Request for ID: ${id}`); // Debug log

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    const cacheKey = CUSTOMER.DISCOUNT_DETAIL(id);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      console.log(`[CACHE HIT] ✅ Key: ${cacheKey} - Data ditemukan di cache`);
      return res.json({
        success: true,
        message: "Discount detail retrieved from cache",
        data: cachedData,
        cached: true,
      });
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================
    console.log(`[CACHE MISS] ❌ Key: ${cacheKey} - Data tidak ada di cache`);
    console.log(
      `[DB QUERY] Discount Detail (ID: ${id}) - Cache miss, querying database...`
    );

    const currentDate = new Date();

    const discount = await Discount.findOne({
      where: {
        id,
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
      include: [
        {
          model: Product,
          as: "products",
          through: {
            attributes: ["original_price", "discounted_price"],
          },
          where: {
            is_active: true,
            product_type: "online", // Only show online products to customers
            total_stock: { [Op.gt]: 0 },
          },
          attributes: ["id", "name", "selling_price", "total_stock"],
          required: false,
          include: [
            {
              model: ProductImage,
              as: "images",
              attributes: ["id", "image_url", "display_order"],
              required: false,
              separate: true,
              order: [["display_order", "ASC"]],
            },
            {
              model: Category,
              as: "category",
              attributes: ["id", "category_name"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found or not active",
      });
    }

    // Format response
    const discountData = discount.toJSON();

    const formattedProducts =
      discountData.products?.map((product) => {
        const primaryImage = product.images?.[0];

        const discountedPrice = parseFloat(
          product.ProductDiscount.discounted_price
        );
        const originalPrice = parseFloat(product.selling_price);
        const actualDiscountAmount = originalPrice - discountedPrice; // Sudah include max_discount

        return {
          id: product.id,
          name: product.name,
          price: originalPrice,
          originalPrice: parseFloat(product.ProductDiscount.original_price),
          discountedPrice: discountedPrice,
          actualDiscountAmount: actualDiscountAmount, // Untuk tampilan "Hemat Rp xxx"
          stock: product.total_stock,
          category: product.category?.category_name,
          image: primaryImage?.image_url || "/placeholder-product.jpg",
        };
      }) || [];

    const formattedDiscount = {
      id: discountData.id,
      name: discountData.discount_name,
      type: discountData.discount_type,
      value: parseFloat(discountData.value),
      // maxDiscount tidak dikirim ke FE (seperti Shopee), tapi sudah diterapkan di discountedPrice
      startDate: discountData.start_date,
      endDate: discountData.end_date,
      products: formattedProducts,
      productsCount: formattedProducts.length,
    };

    // ========================================
    // STEP 3: Save to Cache
    // ========================================
    cacheService.set(cacheKey, formattedDiscount, 1800);
    console.log(`[CACHE SET] ✅ Key: ${cacheKey} - TTL: 1800s (30 menit)`);

    res.json({
      success: true,
      message: "Discount detail fetched successfully",
      data: formattedDiscount,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching discount detail:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount detail",
      error: error.message,
    });
  }
};

/**
 * Get products by discount ID untuk customer
 * @route GET /api/public/discounts/:id/products
 *
 * CACHING:
 * - Cache key: customer:discount:{id}:products:page:{page}
 * - TTL: 1800 detik (30 menit)
 * - Invalidation: Saat admin update discount products
 */
exports.getDiscountProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;
    console.log(
      `🎁 [PUBLIC DISCOUNT PRODUCTS] Request for discount ID: ${id}, page: ${page}`
    ); // Debug log

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    const cacheKey = CUSTOMER.DISCOUNT_PRODUCTS(id, page);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      console.log(`[CACHE HIT] ✅ Key: ${cacheKey} - Data ditemukan di cache`);
      return res.json({
        success: true,
        message: "Discount products retrieved from cache",
        data: cachedData,
        cached: true,
      });
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================
    console.log(`[CACHE MISS] ❌ Key: ${cacheKey} - Data tidak ada di cache`);
    console.log(
      `[DB QUERY] Discount Products (ID: ${id}) - Cache miss, querying database...`
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);
    const currentDate = new Date();

    const discount = await Discount.findOne({
      where: {
        id,
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found or not active",
      });
    }

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      include: [
        {
          model: ProductDiscount,
          as: "productDiscounts",
          where: { discount_id: id },
          attributes: ["original_price", "discounted_price"],
          required: true,
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          required: false,
        },
      ],
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
      },
      limit: pageLimit,
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    // Format response
    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();
      const primaryImage = productData.images?.[0];
      const productDiscount = productData.productDiscounts?.[0];

      return {
        id: productData.id,
        name: productData.name,
        price: parseFloat(productData.selling_price),
        originalPrice: productDiscount
          ? parseFloat(productDiscount.original_price)
          : parseFloat(productData.selling_price),
        discountedPrice: productDiscount
          ? parseFloat(productDiscount.discounted_price)
          : parseFloat(productData.selling_price),
        stock: productData.total_stock,
        category: productData.category?.category_name,
        image: primaryImage?.image_url || "/placeholder-product.jpg",
      };
    });

    const totalPages = Math.ceil(count / pageLimit);
    const responseData = {
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: pageLimit,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
      discount: {
        id: discount.id,
        name: discount.discount_name,
        type: discount.discount_type,
        value: parseFloat(discount.value),
      },
    };

    // ========================================
    // STEP 3: Save to Cache
    // ========================================
    cacheService.set(cacheKey, responseData, 1800);
    console.log(`[CACHE SET] ✅ Key: ${cacheKey} - TTL: 1800s (30 menit)`);

    res.json({
      success: true,
      message: "Discount products fetched successfully",
      data: responseData,
      cached: false,
    });
  } catch (error) {
    console.error("❌ Error fetching discount products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount products",
      error: error.message,
    });
  }
};
