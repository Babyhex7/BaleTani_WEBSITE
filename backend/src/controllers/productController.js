/**
 * Controller untuk mengelola produk
 * Menyediakan API endpoint untuk CRUD produk dan kategori
 */

const { Product, Category } = require("../models");
const { Op } = require("sequelize");

/**
 * Mendapatkan semua produk dengan filter dan pagination
 * Query parameters:
 * - page: nomor halaman (default: 1)
 * - limit: jumlah item per halaman (default: 12)
 * - category: filter berdasarkan slug kategori
 * - search: pencarian berdasarkan nama produk
 * - sort: pengurutan (name_asc, name_desc, price_asc, price_desc, newest)
 * - minPrice: harga minimum
 * - maxPrice: harga maksimum
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "newest",
      minPrice,
      maxPrice,
    } = req.query;

    // Setup pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    // Setup filter conditions
    const whereConditions = {};
    const includeConditions = [
      {
        model: Category,
        as: "category",
        attributes: ["id", "category_name", "description"],
      },
    ];

    // Filter berdasarkan kategori
    if (category) {
      includeConditions[0].where = { id: category };
    }

    // Filter berdasarkan pencarian
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`,
      };
    }

    // Filter berdasarkan range harga
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) whereConditions.price[Op.lte] = parseInt(maxPrice);
    }

    // Setup sorting
    let orderBy = [["createdAt", "DESC"]]; // default: newest
    switch (sort) {
      case "name_asc":
        orderBy = [["name", "ASC"]];
        break;
      case "name_desc":
        orderBy = [["name", "DESC"]];
        break;
      case "price_asc":
        orderBy = [["price", "ASC"]];
        break;
      case "price_desc":
        orderBy = [["price", "DESC"]];
        break;
      case "newest":
        orderBy = [["createdAt", "DESC"]];
        break;
      default:
        orderBy = [["createdAt", "DESC"]];
    }

    // Query produk dengan filter dan pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      offset,
      limit: pageLimit,
      order: orderBy,
      distinct: true,
    });

    // Hitung total halaman
    const totalPages = Math.ceil(count / pageLimit);

    res.status(200).json({
      success: true,
      message: "Produk berhasil diambil",
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: pageLimit,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error mengambil produk:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil produk",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan detail produk berdasarkan ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    console.error("Error mengambil detail produk:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail produk",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan produk unggulan (featured products)
 * Menampilkan produk dengan stok tinggi dan harga menarik
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findAll({
      where: {
        total_stock: { [Op.gt]: 10 }, // stok lebih dari 10
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
        },
      ],
      limit: parseInt(limit),
      order: [
        ["total_stock", "DESC"],
        ["selling_price", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      message: "Produk unggulan berhasil diambil",
      data: products,
    });
  } catch (error) {
    console.error("Error mengambil produk unggulan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil produk unggulan",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan semua kategori
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "category_name", "description", "is_active"],
      // where clause cleaned,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id"], // hanya ambil id untuk menghitung
          where: { is_active: true },
          required: false,
        },
      ],
    });

    // Tambahkan jumlah produk per kategori
    const categoriesWithCount = categories.map((category) => ({
      id: category.id,
      category_name: category.category_name,
      description: category.description,
      is_active: category.is_active,
      productCount: category.products ? category.products.length : 0,
    }));

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error("Error mengambil kategori:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori",
      error: error.message,
    });
  }
};

/**
 * Pencarian produk berdasarkan keyword
 */
const searchProducts = async (req, res) => {
  try {
    const { q: keyword, limit = 10 } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Keyword pencarian minimal 2 karakter",
      });
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
        ],
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
        },
      ],
      limit: parseInt(limit),
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: `Ditemukan ${products.length} produk untuk "${keyword}"`,
      data: products,
    });
  } catch (error) {
    console.error("Error pencarian produk:", error);
    res.status(500).json({
      success: false,
      message: "Gagal melakukan pencarian",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan produk berdasarkan kategori
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12, sort = "newest" } = req.query;

    // Cari kategori berdasarkan slug
    const category = await Category.findOne({ where: { slug: categorySlug } });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Setup pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    // Setup sorting
    let orderBy = [["createdAt", "DESC"]];
    switch (sort) {
      case "name_asc":
        orderBy = [["name", "ASC"]];
        break;
      case "name_desc":
        orderBy = [["name", "DESC"]];
        break;
      case "price_asc":
        orderBy = [["selling_price", "ASC"]];
        break;
      case "price_desc":
        orderBy = [["selling_price", "DESC"]];
        break;
    }

    // Query produk dalam kategori
    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        category_id: category.id,
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name", "description"],
        },
      ],
      offset,
      limit: pageLimit,
      order: orderBy,
    });

    const totalPages = Math.ceil(count / pageLimit);

    res.status(200).json({
      success: true,
      message: `Produk kategori ${category.name} berhasil diambil`,
      data: {
        category,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: pageLimit,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error mengambil produk kategori:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil produk kategori",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getAllCategories,
  searchProducts,
  getProductsByCategory,
};
