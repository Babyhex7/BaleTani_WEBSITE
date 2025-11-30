const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");
const {
  normalizePhoneNumber,
  isValidPhoneNumber,
} = require("../utils/phoneHelper");

/**
 * Admin Authentication Controller
 * Handle login for admin users (using Admin model)
 *
 * Security features:
 * - Phone number validation and normalization
 * - Generic error messages (prevent user enumeration)
 * - Audit logging for security monitoring
 * - Rate limiting (handled by middleware)
 */

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Validate required fields
    if (!phone_number || !password) {
      console.warn(`[LOGIN FAILED] Missing credentials - IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "Nomor telepon dan password wajib diisi",
      });
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone_number)) {
      console.warn(
        `[LOGIN FAILED] Invalid phone format: ${phone_number} - IP: ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        message: "Format nomor telepon tidak valid",
      });
    }

    // Normalize phone number before query
    const normalizedPhone = normalizePhoneNumber(phone_number);
    console.log(`[LOGIN ATTEMPT] Phone: ${normalizedPhone}, IP: ${req.ip}`);

    // Find admin with role information
    const admin = await Admin.findOne({
      where: {
        phone_number: normalizedPhone,
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
        },
      ],
    });

    // Generic error message for security (prevent user enumeration)
    const genericError = {
      success: false,
      message: "Nomor telepon atau password salah",
    };

    if (!admin) {
      console.warn(
        `[LOGIN FAILED] User not found: ${normalizedPhone} - IP: ${req.ip}`
      );
      return res.status(401).json(genericError);
    }

    // Check if user has admin role (BEFORE password check for timing attack prevention)
    const adminRoles = [
      "super_admin",
      "super_whatsapp_admin",
      "super_cashier",
      "whatsapp_admin",
      "cashier",
      "finance_admin",
      "inventory_admin",
      "super_inventory_admin",
    ];

    if (!adminRoles.includes(admin.role.role_name)) {
      // SECURITY FIX: Use generic error message (don't reveal user existence)
      console.warn(
        `[LOGIN FAILED] Non-admin role attempt: ${normalizedPhone}, Role: ${admin.role.role_name} - IP: ${req.ip}`
      );
      return res.status(401).json(genericError);
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.warn(
        `[LOGIN FAILED] Invalid password: ${normalizedPhone} - IP: ${req.ip}`
      );
      return res.status(401).json(genericError);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin.id,
        type: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Admin token expires in 7 days
    );

    // Ambil permissions untuk role ini
    const role = await Role.findByPk(admin.role.id, {
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "module", "action", "description"],
          through: { attributes: [] }, // Exclude junction table attributes
        },
      ],
    });

    // AUDIT LOG: Success login
    console.log(
      `[LOGIN SUCCESS] Admin: ${admin.id}, Name: ${admin.full_name}, Role: ${admin.role.role_name} - IP: ${req.ip}`
    );

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: admin.id,
          phone_number: admin.phone_number,
          full_name: admin.full_name,
          role: {
            id: admin.role.id,
            name: admin.role.role_name,
            description: admin.role.description,
          },
          permissions: role.permissions || [],
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);

    // Handle specific database errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message:
          "Terjadi kesalahan pada database. Silakan hubungi administrator.",
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan server",
    });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: {
        id: req.user.id, // Fix: req.user.id bukan req.user.userId
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
        },
      ],
      attributes: ["id", "phone_number", "full_name", "created_at"],
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: admin.id,
          phone_number: admin.phone_number,
          full_name: admin.full_name,
          created_at: admin.created_at,
          role: {
            id: admin.role.id,
            role_name: admin.role.role_name,
            description: admin.role.description,
          },
        },
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
};
