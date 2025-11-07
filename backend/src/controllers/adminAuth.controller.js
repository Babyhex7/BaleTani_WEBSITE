const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");

/**
 * Admin Authentication Controller
 * Handle login for admin users (using Admin model)
 */

// Function to normalize phone number
function normalizePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("0")) {
    // Convert 08xx to 628xx
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    // Convert 8xx to 628xx
    cleaned = "62" + cleaned;
  } else if (!cleaned.startsWith("62")) {
    // Add 62 if not present
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

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

    // Normalize phone number before query
    const normalizedPhone = normalizePhoneNumber(phone_number);

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
            level: admin.role.level,
          },
          permissions: role.permissions || [],
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
