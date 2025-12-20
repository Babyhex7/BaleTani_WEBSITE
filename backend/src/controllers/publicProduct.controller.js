/**
 * PUBLIC PRODUCT CONTROLLER
 * Handles product display for customers (no authentication required)
 * Includes search, filter, pagination, and promo products
 *
 * CACHING STRATEGY:
 * - Products list: Cache 10 menit (600 detik)
 * - Product detail: Cache 15 menit (900 detik)
 * - Cache invalidation: Saat admin CRUD product
 */

const {
  Product,
  Category,
  ProductImage,
  ProductDiscount,
  Discount,
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// Import cache service dan cache keys
const cacheService = require("../cache/cacheService");
const { CUSTOMER, PATTERNS } = require("../cache/cacheKeys");

/**
 * Get all products with search, filter, and pagination
 * @route GET /api/public/products
 *
 * CACHING:
 * - Cache key: customer:products:{category}:page:{page}
 * - TTL: 600 detik (10 menit)
 * - Invalidation: Saat admin create/update/delete product
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      minPrice = 0,
      maxPrice = 999999999,
      sortBy = "newest", // newest, name_asc, name_desc, price_asc, price_desc
    } = req.query;

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    // Generate cache key berdasarkan filter
    // Kalau ada search/filter harga/sort, skip cache (karena terlalu banyak kombinasi)
    const useCache =
      !search && minPrice == 0 && maxPrice == 999999999 && sortBy === "newest";

    if (useCache) {
      const cacheKey = CUSTOMER.PRODUCTS_LIST(category || "all", page);
      const cachedData = cacheService.get(cacheKey);

      // Jika cache ada, langsung return (skip query database)
      if (cachedData) {
        return res.json({
          success: true,
          message: "Products retrieved from cache",
          data: cachedData, // cachedData sudah berisi { products, pagination, filters }
          cached: true, // Flag untuk debugging
        });
      }
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    // Build where conditions
    const whereConditions = {
      is_active: true,
      product_type: "online", // Only show online products to customers
      // NOTE: Tidak filter total_stock agar produk habis tetap tampil dengan badge "HABIS"
      selling_price: {
        [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)],
      },
    };

    // Search by product name
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`,
      };
    }

    // Filter by category
    const categoryWhere = category ? { id: category } : {};

    // Sorting
    let order = [];
    switch (sortBy) {
      case "name_asc":
        order = [["name", "ASC"]];
        break;
      case "name_desc":
        order = [["name", "DESC"]];
        break;
      case "price_asc":
        order = [["selling_price", "ASC"]];
        break;
      case "price_desc":
        order = [["selling_price", "DESC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    // Fetch products with associations
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
          where: categoryWhere,
          required: !!category, // Only required if category filter is set
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          // where clause cleaned,
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: [
            "id",
            "product_id",
            "discount_id",
            "discounted_price",
            "original_price",
          ],
          required: false,
          include: [
            {
              model: Discount,
              as: "discount",
              attributes: [
                "id",
                "discount_name",
                "discount_type",
                "value",
                "start_date",
                "end_date",
                "is_active",
              ],
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
              },
              required: false,
            },
          ],
        },
      ],
      order,
      limit: pageLimit,
      offset,
      distinct: true,
    });

    // Format products with discount info
    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();

      // Get primary image (first image by display_order)
      const primaryImage = productData.images?.[0];

      // Get discount info from ProductDiscount table (pre-calculated)
      let discountInfo = null;
      if (
        productData.productDiscounts &&
        productData.productDiscounts.length > 0
      ) {
        const activeDiscount = productData.productDiscounts.find(
          (pd) => pd.discount && pd.discount.is_active
        );

        if (activeDiscount?.discount) {
          const discount = activeDiscount.discount;

          // Use pre-calculated discounted_price from ProductDiscount table
          const finalPrice = activeDiscount.discounted_price
            ? parseFloat(activeDiscount.discounted_price)
            : parseFloat(productData.selling_price);

          const originalPrice = parseFloat(productData.selling_price);
          const savingsAmount = originalPrice - finalPrice;

          discountInfo = {
            id: discount.id,
            name: discount.discount_name,
            type: discount.discount_type,
            value: parseFloat(discount.value),
            percentage:
              discount.discount_type === "percentage"
                ? parseFloat(discount.value)
                : null, // Original % untuk display
            maxDiscount: discount.max_discount
              ? parseFloat(discount.max_discount)
              : null,
            finalPrice: finalPrice,
            originalPrice: originalPrice,
            savings: Math.round(savingsAmount * 100) / 100,
            savingsPercentage: Math.round(
              (savingsAmount / originalPrice) * 100
            ), // Actual % setelah max discount
            validUntil: discount.end_date,
          };
        }
      }

      // Calculate final price with discount
      const finalPrice = discountInfo
        ? discountInfo.finalPrice
        : parseFloat(productData.selling_price);

      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.selling_price),
        finalPrice: finalPrice, // ✅ Added for frontend
        stock: productData.total_stock,
        unit: productData.quantity_info || "unit", // ✅ Added for frontend
        quantityInfo: productData.quantity_info, // ✅ Added for frontend
        shelfLifeDays: productData.shelf_life_days,
        category: productData.category
          ? {
              id: productData.category.id,
              name: productData.category.category_name,
            }
          : null,
        image: primaryImage
          ? primaryImage.image_url
          : "/placeholder-product.jpg",
        images: productData.images?.map((img) => img.image_url) || [],
        discount: discountInfo,
      };
    });

    // Get categories for filter dropdown
    const categories = await Category.findAll({
      attributes: ["id", "category_name"],
      where: { is_active: true },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / pageLimit);

    // Prepare response data
    const responseData = {
      products: formattedProducts,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: pageLimit,
        has_next_page: parseInt(page) < totalPages,
        has_prev_page: parseInt(page) > 1,
      },
      filters: {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.category_name,
        })),
        appliedFilters: {
          search,
          category,
          minPrice,
          maxPrice,
          sortBy,
        },
      },
    };

    // ========================================
    // STEP 3: Save to Cache (jika tidak ada search/filter)
    // ========================================
    if (useCache) {
      const cacheKey = CUSTOMER.PRODUCTS_LIST(category || "all", page);
      // TTL: 600 detik (10 menit)
      cacheService.set(cacheKey, responseData, 600);
    }

    // ========================================
    // STEP 4: Return Response
    // ========================================
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: responseData,
      cached: false, // Flag untuk debugging
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * Get product detail by ID
 * @route GET /api/public/products/:id
 *
 * CACHING:
 * - Cache key: customer:product:{id}
 * - TTL: 900 detik (15 menit)
 * - Invalidation: Saat admin update/delete product
 */
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    const cacheKey = CUSTOMER.PRODUCT_DETAIL(id);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        message: "Product detail retrieved from cache",
        data: cachedData,
        cached: true, // Flag untuk debugging
      });
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================

    const product = await Product.findOne({
      where: {
        id,
        is_active: true,
        product_type: "online", // Only show online products to customers
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          // where clause cleaned,
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: [
            "id",
            "product_id",
            "discount_id",
            "discounted_price",
            "original_price",
          ],
          required: false,
          include: [
            {
              model: Discount,
              as: "discount",
              attributes: [
                "id",
                "discount_name",
                "discount_type",
                "value",
                "max_discount",
                "start_date",
                "end_date",
                "is_active",
              ],
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
              },
              required: false,
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productData = product.toJSON();

    // Get discount info from ProductDiscount table (pre-calculated)
    let discountInfo = null;

    if (
      productData.productDiscounts &&
      productData.productDiscounts.length > 0
    ) {
      const activeDiscount = productData.productDiscounts.find(
        (pd) => pd.discount && pd.discount.is_active
      );

      if (activeDiscount?.discount) {
        const discount = activeDiscount.discount;

        // Use pre-calculated discounted_price from ProductDiscount table
        const finalPrice = activeDiscount.discounted_price
          ? parseFloat(activeDiscount.discounted_price)
          : parseFloat(productData.selling_price);

        const originalPrice = parseFloat(productData.selling_price);
        const savingsAmount = originalPrice - finalPrice;

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          percentage:
            discount.discount_type === "percentage"
              ? parseFloat(discount.value)
              : null,
          maxDiscount: discount.max_discount
            ? parseFloat(discount.max_discount)
            : null,
          finalPrice: finalPrice,
          originalPrice: originalPrice,
          savings: Math.round(savingsAmount * 100) / 100,
          savingsPercentage: Math.round((savingsAmount / originalPrice) * 100),
          validUntil: discount.end_date,
        };
      }
    }

    // Calculate final price with discount
    const finalPrice = discountInfo
      ? discountInfo.finalPrice
      : parseFloat(productData.selling_price);

    const formattedProduct = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.selling_price),
      finalPrice: finalPrice, // ✅ Added for frontend
      stock: productData.total_stock,
      unit: productData.quantity_info || "unit", // ✅ Added for frontend
      quantityInfo: productData.quantity_info, // ✅ Added for frontend
      shelfLifeDays: productData.shelf_life_days,
      category: productData.category
        ? {
            id: productData.category.id,
            name: productData.category.category_name,
            description: productData.category.description,
          }
        : null,
      images:
        productData.images?.map((img) => ({
          id: img.id,
          url: img.image_url,
          order: img.display_order,
        })) || [],
      discount: discountInfo,
      createdAt: productData.created_at,
    };

    // ========================================
    // STEP 3: Save to Cache
    // ========================================
    // TTL: 900 detik (15 menit) - Karena stock bisa berubah cepat
    cacheService.set(cacheKey, formattedProduct, 900);

    // ========================================
    // STEP 4: Return Response
    // ========================================
    res.status(200).json({
      success: true,
      message: "Product detail fetched successfully",
      data: formattedProduct,
      cached: false, // Flag untuk debugging
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product detail",
      error: error.message,
    });
  }
};

/**
 * Get featured/promo products
 * @route GET /api/public/products/featured/promo
 *
 * CACHING:
 * - Cache key: customer:featured:products
 * - TTL: 900 detik (15 menit)
 * - Invalidation: Saat admin create/update/delete product atau discount
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    console.log("🎁 [FEATURED PRODUCTS] Request received"); // Debug log

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    const cacheKey = CUSTOMER.FEATURED_PRODUCTS;
    const cachedData = cacheService.get(cacheKey);

    // Jika cache ada, langsung return
    if (cachedData) {
      console.log(`[CACHE HIT] ✅ Key: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: "Featured products retrieved from cache",
        data: cachedData,
        cached: true, // Flag untuk debugging
      });
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================
    console.log(`[CACHE MISS] ❌ Key: ${cacheKey} - Querying database...`);

    // First, get products with active discounts
    const products = await Product.findAll({
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          // where clause cleaned,
          required: false,
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          // where clause cleaned,
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: [
            "id",
            "product_id",
            "discount_id",
            "discounted_price",
            "original_price",
            "created_at",
          ],
          required: true, // Only get products that have discounts
          include: [
            {
              model: Discount,
              as: "discount",
              attributes: [
                "id",
                "discount_name",
                "discount_type",
                "value",
                "start_date",
                "end_date",
                "is_active",
              ],
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
              },
              required: true, // Only get discounts that are currently active
            },
          ],
        },
      ],
      limit: parseInt(limit),
      order: [["created_at", "DESC"]],
      subQuery: false, // Important: disable subQuery to make required work properly
    });

    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();
      const primaryImage = productData.images?.[0];

      // Get active discount
      const activeDiscount = productData.productDiscounts?.[0];
      const discount = activeDiscount?.discount;

      let discountInfo = null;
      if (discount) {
        // Use pre-calculated discounted_price from ProductDiscount table
        const finalPrice = activeDiscount.discounted_price
          ? parseFloat(activeDiscount.discounted_price)
          : parseFloat(productData.selling_price);

        const originalPrice = parseFloat(productData.selling_price);
        const savingsAmount = originalPrice - finalPrice;

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          finalPrice: finalPrice,
          savings: Math.round(savingsAmount * 100) / 100,
          validUntil: discount.end_date,
        };
      }

      // Calculate final price with discount
      const finalPrice = discountInfo
        ? discountInfo.finalPrice
        : parseFloat(productData.selling_price);

      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.selling_price),
        finalPrice: finalPrice, // ✅ Added for consistency
        stock: productData.total_stock,
        unit: productData.quantity_info || "unit", // ✅ Added for consistency
        quantityInfo: productData.quantity_info, // ✅ Added for consistency
        category: productData.category?.category_name,
        image: primaryImage?.image_url || "/placeholder-product.jpg",
        images: productData.images?.map((img) => img.image_url) || [], // ✅ Added for consistency
        discount: discountInfo,
      };
    });

    // ========================================
    // STEP 3: Save to Cache
    // ========================================
    console.log(`[CACHE SET] 💾 Key: ${cacheKey} - TTL: 900s (15 min)`);
    cacheService.set(cacheKey, formattedProducts);

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: formattedProducts,
      cached: false, // Flag untuk debugging
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};

/**
 * Get product detail by ID
 * @route GET /api/public/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product with all relations
    const product = await Product.findOne({
      where: {
        id,
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          // where clause cleaned,
          required: false,
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: [
            "id",
            "discount_id",
            "discounted_price",
            "original_price",
          ],
          required: false,
          include: [
            {
              model: Discount,
              as: "discount",
              attributes: [
                "id",
                "discount_name",
                "discount_type",
                "value",
                "start_date",
                "end_date",
                "is_active",
              ],
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
              },
              required: false,
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get discount info from ProductDiscount table (pre-calculated by admin)
    let discountInfo = null;
    let finalPrice = parseFloat(product.selling_price);

    if (product.productDiscounts && product.productDiscounts.length > 0) {
      const productDiscount = product.productDiscounts[0];

      // ALWAYS use discounted_price from ProductDiscount table (set by admin)
      if (productDiscount.discounted_price && productDiscount.discount) {
        finalPrice = parseFloat(productDiscount.discounted_price);
        const discount = productDiscount.discount;
        const originalPrice = parseFloat(product.selling_price);
        const savingsAmount = originalPrice - finalPrice;

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          startDate: discount.start_date,
          endDate: discount.end_date,
          discountAmount: savingsAmount,
          finalPrice: finalPrice,
          originalPrice: originalPrice,
        };
      }
    }

    // Get all images (sorted by display_order) - with safety check
    const images =
      product.images && product.images.length > 0
        ? product.images
            .sort((a, b) => a.display_order - b.display_order)
            .map((img) => img.image_url)
        : [];

    // Format response
    const productDetail = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.selling_price,
      finalPrice: finalPrice, // ✅ Added for consistency
      stock: product.total_stock,
      unit: product.quantity_info || "unit", // ✅ Added for consistency
      quantityInfo: product.quantity_info, // ✅ Added for consistency
      weight: product.weight,
      category: {
        id: product.category?.id,
        name: product.category?.category_name,
      },
      image: images.length > 0 ? images[0] : "/placeholder-product.jpg", // ✅ Added primary image
      images: images.length > 0 ? images : ["/placeholder-product.jpg"],
      discount: discountInfo,
      specifications: {
        weight: product.weight,
        stock: product.total_stock,
      },
    };

    res.status(200).json({
      success: true,
      message: "Product detail fetched successfully",
      data: productDetail,
    });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product detail",
      error: error.message,
    });
  }
};
