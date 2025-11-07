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
    const role_id = req.query.role_id || "";
    const is_active = req.query.is_active || "";
    const sortBy = req.query.sortBy || "full_name";
    const sortOrder = req.query.sortOrder || "ASC";

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Add is_active filter
    if (is_active !== "") {
      whereClause.is_active = is_active === "true" || is_active === true;
    }

    // Build include for role filter
    const includeOptions = {
      model: Role,
      as: "role",
      attributes: ["id", "role_name", "description"],
    };

    if (role_id) {
      includeOptions.where = { id: role_id };
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

    // Get stats
    const totalAdmins = await Admin.count();
    const activeAdmins = await Admin.count({ where: { is_active: true } });
    const inactiveAdmins = await Admin.count({ where: { is_active: false } });
    const totalRoles = await Role.count();

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
        data: formattedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
        stats: {
          total: totalAdmins,
          active: activeAdmins,
          inactive: inactiveAdmins,
          totalRoles: totalRoles,
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
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
          include: [
            {
              model: require("../models").Permission,
              as: "permissions",
              attributes: ["id", "module", "action", "description"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    // Format response dengan permissions
    const formattedUser = {
      id: user.id,
      phone_number: user.phone_number,
      full_name: user.full_name,
      role: {
        id: user.role.id,
        role_name: user.role.role_name,
        description: user.role.description,
      },
      permissions: user.role.permissions || [],
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      data: formattedUser,
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

    const { full_name, phone_number, password, role_id, is_active } = req.body;

    // Normalize phone number
    let normalizedPhone = phone_number;
    if (phone_number.startsWith("08")) {
      normalizedPhone = "628" + phone_number.substring(1);
    } else if (phone_number.startsWith("+62")) {
      normalizedPhone = "628" + phone_number.substring(3);
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({
      where: { phone_number: normalizedPhone },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin with this phone number already exists",
      });
    }

    // Validate role_id exists
    const roleExists = await Role.findByPk(role_id);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new admin user
    const user = await Admin.create({
      full_name,
      phone_number: normalizedPhone,
      password_hash,
      role_id,
      is_active: is_active !== undefined ? is_active : true,
    });

    // Fetch complete user with role
    const createdUser = await Admin.findByPk(user.id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: { user: createdUser },
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
    const { full_name, phone_number, password, role_id, is_active } = req.body;

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if phone number is already taken by another user
    if (phone_number && phone_number !== user.phone_number) {
      // Normalize phone number
      let normalizedPhone = phone_number;
      if (phone_number.startsWith("08")) {
        normalizedPhone = "628" + phone_number.substring(1);
      } else if (phone_number.startsWith("+62")) {
        normalizedPhone = "628" + phone_number.substring(3);
      }

      const existingUser = await Admin.findOne({
        where: {
          phone_number: normalizedPhone,
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already taken by another user",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (full_name) updateData.full_name = full_name;

    if (phone_number) {
      let normalizedPhone = phone_number;
      if (phone_number.startsWith("08")) {
        normalizedPhone = "628" + phone_number.substring(1);
      } else if (phone_number.startsWith("+62")) {
        normalizedPhone = "628" + phone_number.substring(3);
      }
      updateData.phone_number = normalizedPhone;
    }

    if (role_id) {
      // Validate role exists
      const roleExists = await Role.findByPk(role_id);
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid role specified",
        });
      }
      updateData.role_id = role_id;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
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
    const { role_id } = req.body;

    // Validate role exists
    const roleExists = await Role.findByPk(role_id);
    if (!roleExists) {
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
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    await user.update({ role_id });

    // Fetch updated user with role
    const updatedUser = await Admin.findByPk(id, {
      attributes: { exclude: ["password_hash"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
        },
      ],
    });

    res.json({
      success: true,
      message: "User role updated successfully",
      data: { user: updatedUser },
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await user.update({ password_hash: hashedPassword });

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
    // Get total admins and active admins
    const [totalAdmins, activeAdmins] = await Promise.all([
      Admin.count(),
      Admin.count({ where: { is_active: true } }),
    ]);

    // Get total by role
    const roles = await Role.findAll({
      attributes: [
        "id",
        "role_name",
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("users.id")
          ),
          "user_count",
        ],
      ],
      include: [
        {
          model: Admin,
          as: "users",
          attributes: [],
        },
      ],
      group: ["Role.id"],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins: totalAdmins - activeAdmins,
        roleBreakdown: roles,
        totalRoles: roles.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      attributes: ["id", "role_name", "description"],
      order: [["role_name", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        data: roles,
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
  getRoles,
};
