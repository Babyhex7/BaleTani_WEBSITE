/**
 * PUBLIC PRODUCT CONTROLLER
 * Handles product display for customers (no authentication required)
 * Includes search, filter, pagination, and promo products
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

/**
 * Get all products with search, filter, and pagination
 * @route GET /api/public/products
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

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    // Build where conditions
    const whereConditions = {
      is_active: true,
      total_stock: { [Op.gt]: 0 }, // Only products with stock
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
          where: { deleted_at: null },
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          required: false,
          where: { deleted_at: null },
          include: [
            {
              model: Discount,
              as: "discount",
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
                deleted_at: null,
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

      // Calculate discount
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
          let discountAmount = 0;

          if (discount.discount_type === "percentage") {
            discountAmount = (productData.selling_price * discount.value) / 100;
          } else if (discount.discount_type === "fixed_amount") {
            discountAmount = discount.value;
          }

          discountInfo = {
            id: discount.id,
            name: discount.discount_name,
            type: discount.discount_type,
            value: parseFloat(discount.value),
            finalPrice: Math.max(0, productData.selling_price - discountAmount),
            validUntil: discount.end_date,
          };
        }
      }

      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.selling_price),
        stock: productData.total_stock,
        unit: productData.quantity_info || "unit",
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
      where: { is_active: true, deleted_at: null },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / pageLimit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: pageLimit,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
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
      },
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
 */
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        id,
        is_active: true,
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
          where: { deleted_at: null },
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          where: { deleted_at: null },
          required: false,
          include: [
            {
              model: Discount,
              as: "discount",
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
                deleted_at: null,
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

    // Calculate discount
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
        let discountAmount = 0;

        if (discount.discount_type === "percentage") {
          discountAmount = (productData.selling_price * discount.value) / 100;
        } else if (discount.discount_type === "fixed_amount") {
          discountAmount = discount.value;
        }

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          finalPrice: Math.max(0, productData.selling_price - discountAmount),
          originalPrice: parseFloat(productData.selling_price),
          savings: discountAmount,
          validUntil: discount.end_date,
        };
      }
    }

    const formattedProduct = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.selling_price),
      stock: productData.total_stock,
      unit: productData.quantity_info || "unit",
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

    res.status(200).json({
      success: true,
      message: "Product detail fetched successfully",
      data: formattedProduct,
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
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    // First, get products with active discounts
    const products = await Product.findAll({
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
        deleted_at: null,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          where: { deleted_at: null },
          required: false,
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "display_order"],
          where: { deleted_at: null },
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: ["id", "product_id", "discount_id", "created_at"],
          where: { deleted_at: null },
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
                deleted_at: null,
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
        let discountAmount = 0;
        if (discount.discount_type === "percentage") {
          discountAmount = (productData.selling_price * discount.value) / 100;
        } else if (discount.discount_type === "fixed_amount") {
          discountAmount = discount.value;
        }

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          finalPrice: Math.max(0, productData.selling_price - discountAmount),
          validUntil: discount.end_date,
        };
      }

      return {
        id: productData.id,
        name: productData.name,
        price: parseFloat(productData.selling_price),
        stock: productData.total_stock,
        unit: productData.quantity_info || "unit",
        category: productData.category?.category_name,
        image: primaryImage?.image_url || "/placeholder-product.jpg",
        discount: discountInfo,
      };
    });

    res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: formattedProducts,
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
        deleted_at: null,
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
          where: { deleted_at: null },
          required: false,
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: ["discount_id"],
          where: { deleted_at: null },
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
                deleted_at: null,
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

    // Calculate discount
    let discountInfo = null;
    let finalPrice = product.selling_price;

    if (
      product.productDiscounts &&
      product.productDiscounts.length > 0 &&
      product.productDiscounts[0].discount
    ) {
      const discount = product.productDiscounts[0].discount;
      let discountAmount = 0;

      if (discount.discount_type === "percentage") {
        discountAmount = (product.selling_price * discount.value) / 100;
      } else if (discount.discount_type === "fixed_amount") {
        discountAmount = discount.value;
      }

      finalPrice = Math.max(0, product.selling_price - discountAmount);

      discountInfo = {
        id: discount.id,
        name: discount.discount_name,
        type: discount.discount_type,
        value: discount.value,
        startDate: discount.start_date,
        endDate: discount.end_date,
        discountAmount,
        finalPrice,
      };
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
      stock: product.total_stock,
      unit: product.quantity_info || "unit",
      weight: product.weight,
      category: {
        id: product.category?.id,
        name: product.category?.category_name,
      },
      images: images.length > 0 ? images : ["/placeholder-product.jpg"],
      discount: discountInfo,
      specifications: {
        weight: product.weight,
        unit: product.quantity_info || "unit",
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
