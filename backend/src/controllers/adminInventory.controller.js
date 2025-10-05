const { Product, Category } = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Admin Inventory Management Controller
 * CRUD operations untuk mengelola produk dan kategori
 */

// Get all products with pagination and filters
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const categoryId = req.query.category_id || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "name";
    const sortOrder = req.query.sortOrder || "ASC";

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (categoryId) {
      whereClause.category_id = categoryId;
    }

    // Filter berdasarkan status stok
    if (status === "low_stock") {
      whereClause.stock = { [Op.lte]: 10 };
    } else if (status === "out_of_stock") {
      whereClause.stock = 0;
    } else if (status === "in_stock") {
      whereClause.stock = { [Op.gt]: 10 };
    }

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Format response
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      base_price: parseFloat(product.base_price),
      stock: product.stock,
      image_url: product.image_url,
      category_id: product.category_id,
      category_name: product.category?.name || "Uncategorized",
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      base_price: parseFloat(product.base_price),
      stock: product.stock,
      image_url: product.image_url,
      category_id: product.category_id,
      category_name: product.category?.name || "Uncategorized",
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    res.json({
      success: true,
      data: { product: formattedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
const createProduct = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, description, base_price, stock, category_id, image_url } =
      req.body;

    // Validasi kategori exists
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    // Create new product
    const product = await Product.create({
      name,
      description,
      base_price,
      stock: stock || 0,
      category_id,
      image_url,
    });

    // Get product with category info
    const productWithCategory = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    const formattedProduct = {
      id: productWithCategory.id,
      name: productWithCategory.name,
      description: productWithCategory.description,
      base_price: parseFloat(productWithCategory.base_price),
      stock: productWithCategory.stock,
      image_url: productWithCategory.image_url,
      category_id: productWithCategory.category_id,
      category_name: productWithCategory.category?.name || "Uncategorized",
      created_at: productWithCategory.created_at,
      updated_at: productWithCategory.updated_at,
    };

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product: formattedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, description, base_price, stock, category_id, image_url } =
      req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validasi kategori exists jika diubah
    if (category_id && category_id !== product.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    // Update product
    await product.update({
      name: name || product.name,
      description:
        description !== undefined ? description : product.description,
      base_price: base_price || product.base_price,
      stock: stock !== undefined ? stock : product.stock,
      category_id: category_id || product.category_id,
      image_url: image_url !== undefined ? image_url : product.image_url,
    });

    // Get updated product with category info
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      base_price: parseFloat(updatedProduct.base_price),
      stock: updatedProduct.stock,
      image_url: updatedProduct.image_url,
      category_id: updatedProduct.category_id,
      category_name: updatedProduct.category?.name || "Uncategorized",
      created_at: updatedProduct.created_at,
      updated_at: updatedProduct.updated_at,
    };

    res.json({
      success: true,
      message: "Product updated successfully",
      data: { product: formattedProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update product stock
const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock, type, note } = req.body; // type: 'set', 'add', 'subtract'

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let newStock = product.stock;

    switch (type) {
      case "set":
        newStock = stock;
        break;
      case "add":
        newStock = product.stock + stock;
        break;
      case "subtract":
        newStock = product.stock - stock;
        break;
      default:
        newStock = stock;
    }

    // Pastikan stok tidak negatif
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    await product.update({ stock: newStock });

    res.json({
      success: true,
      message: "Product stock updated successfully",
      data: {
        product: {
          id: product.id,
          name: product.name,
          previous_stock: product.stock,
          new_stock: newStock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name already exists (exclude current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name is already taken",
        });
      }
    }

    await category.update({
      name: name || category.name,
      description:
        description !== undefined ? description : category.description,
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { category_id: id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} product(s) associated with it.`,
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
