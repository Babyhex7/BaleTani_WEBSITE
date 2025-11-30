const jwt = require("jsonwebtoken");
const { Admin, Customer, Role, Permission } = require("../models");

/**
 * Middleware untuk ADMIN Authentication (dengan RBAC)
 * Admin memiliki role dan permissions yang di-load dari database
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak tersedia.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token type is admin
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Token tidak valid untuk admin.",
      });
    }

    // Cari admin dengan role dan permissions (RBAC)
    const admin = await Admin.findOne({
      where: {
        id: decoded.userId,
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["id", "module", "action", "description"],
              through: { attributes: [] }, // Exclude junction table
            },
          ],
        },
      ],
      attributes: { exclude: ["password_hash"] },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid. Admin tidak ditemukan.",
      });
    }

    // Set admin info ke req.user dengan permissions
    req.user = {
      id: admin.id,
      phone_number: admin.phone_number,
      full_name: admin.full_name,
      role_id: admin.role_id,
      role: admin.role,
      permissions: admin.role?.permissions || [],
      is_active: admin.is_active,
      type: "admin", // Distinguish from customer
    };

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa. Silakan login kembali.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saat autentikasi admin.",
    });
  }
};

/**
 * Middleware untuk CUSTOMER Authentication (tanpa RBAC)
 * Customer hanya basic auth, tidak ada role/permissions
 */
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak tersedia.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token type is customer
    if (decoded.type !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Token tidak valid untuk customer.",
      });
    }

    // Cari customer (TANPA role/permissions - basic auth only)
    // FIX: Gunakan decoded.userId untuk konsistensi dengan admin auth
    const customer = await Customer.findOne({
      where: {
        id: decoded.userId,
        is_active: true,
      },
      attributes: { exclude: ["password_hash"] },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid. Customer tidak ditemukan.",
      });
    }

    // STANDARDIZED: Set customer info ke req.user (consistent with admin)
    req.user = {
      id: customer.id,
      phone_number: customer.phone_number,
      full_name: customer.full_name,
      address: customer.address,
      is_active: customer.is_active,
      type: "customer", // Distinguish from admin
    };

    // BACKWARD COMPATIBILITY: Also set req.customer for existing code
    req.customer = req.user;

    next();
  } catch (error) {
    console.error("Customer auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa. Silakan login kembali.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saat autentikasi customer.",
    });
  }
};

/**
 * Middleware untuk RBAC (Role-Based Access Control)
 * Hanya untuk ADMIN - mengecek apakah admin punya role yang diizinkan
 *
 * @param {Array} allowedRoles - Array role yang diizinkan, contoh: ['super_admin', 'cashier']
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user adalah admin (sudah melewati authenticateAdmin)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Admin authentication required.",
      });
    }

    // Super admin bisa akses semua
    if (req.user.role?.role_name === "super_admin") {
      return next();
    }

    // Cek apakah role admin ada di allowed roles
    if (!allowedRoles.includes(req.user.role?.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
        currentRole: req.user.role?.role_name,
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Set req.user if token exists, but don't throw error if not
 * Useful for endpoints yang bisa diakses dengan/tanpa login
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // No token, continue without setting req.user
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a customer token
    if (decoded.type === "customer") {
      const customer = await Customer.findOne({
        where: {
          id: decoded.userId,
          is_active: true,
        },
        attributes: { exclude: ["password_hash"] },
      });

      if (customer) {
        req.user = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone_number: customer.phone_number,
          is_active: customer.is_active,
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without setting req.user
    next();
  }
};

// Legacy middleware untuk backward compatibility
const authMiddleware = authenticateAdmin;

module.exports = {
  authMiddleware, // Legacy support
  authenticateAdmin, // ADMIN dengan RBAC
  authenticateCustomer, // CUSTOMER tanpa RBAC (basic auth only)
  optionalAuth, // Optional auth (set req.user if token exists)
  roleMiddleware, // RBAC checker untuk admin
};
