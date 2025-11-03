const { Admin, Role } = require("../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * Admin User Management Controller
 * CRUD operations untuk mengelola admin users dengan RBAC
 * Only SUPER ADMIN can create/update/delete admin users
 */

// Get all admin users with pagination and filters
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const role_name = req.query.role || "";
    const sortBy = req.query.sortBy || "full_name";
    const sortOrder = req.query.sortOrder || "ASC";

    // Build where clause
    const whereClause = {
      };

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build include for role filter
    const includeOptions = {
      model: Role,
      as: "role",
      attributes: ["id", "role_name", "description"],
    };

    if (role_name) {
      includeOptions.where = { role_name };
    }

    // Get users with pagination
    const { count, rows: users } = await Admin.findAndCountAll({
      where: whereClause,
      include: [includeOptions],
      attributes: { exclude: ["password_hash"] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
      role: {
        id: user.role.id,
        role_name: user.role.role_name,
        description: user.role.description,
      },
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
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

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await Admin.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Create new user
const createUser = async (req, res, next) => {
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

    const { full_name, email, password, role = "customer" } = req.body;

    // Check if user already exists
    const existingUser = await Admin.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Validasi role
    const validRoles = ["customer", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Create new user
    const user = await Admin.create({
      full_name,
      email,
      password,
      role,
    });

    // Return user data without password
    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: userData },
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
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
    const { full_name, email, password, role } = req.body;

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await Admin.findOne({
        where: {
          email,
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken by another user",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (role) {
      const validRoles = ["customer", "staff", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role specified",
        });
      }
      updateData.role = role;
    }

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    await user.update(updateData);

    // Return updated user data without password
    const { password: _, ...userData } = user.toJSON();

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["customer", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    await user.update({ role });

    const { password: _, ...userData } = user.toJSON();

    res.json({
      success: true,
      message: "User role updated successfully",
      data: { user: userData },
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password
const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
  try {
    const [totalAdmins, totalStaff, totalCustomers] = await Promise.all([
      Admin.count({ where: { role: "admin" } }),
      Admin.count({ where: { role: "staff" } }),
      Admin.count({ where: { role: "customer" } }),
    ]);

    res.json({
      success: true,
      data: {
        totalAdmins,
        totalStaff,
        totalCustomers,
        totalUsers: totalAdmins + totalStaff + totalCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  resetUserPassword,
  getUserStats,
};
