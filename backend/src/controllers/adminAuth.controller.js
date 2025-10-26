const jwt = require("jsonwebtoken");
const { Admin, Role } = require("../models");

/**
 * Admin Authentication Controller
 * Handle login for admin users (using Admin model)
 */

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Validate required fields
    if (!phone_number || !password) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon dan password wajib diisi",
      });
    }

    // Find admin with role information
    const admin = await Admin.findOne({
      where: {
        phone_number,
        deleted_at: null,
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

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
    }

    // Check if user has admin role
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
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Anda bukan admin.",
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
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
            role_name: admin.role.role_name,
            description: admin.role.description,
          },
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: {
        id: req.user.id, // Fix: req.user.id bukan req.user.userId
        deleted_at: null,
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
