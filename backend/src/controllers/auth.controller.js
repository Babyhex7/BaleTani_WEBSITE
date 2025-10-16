const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User, Role } = require("../models");

// Normalize phone number function
const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return phoneNumber;

  // Remove all non-numeric characters
  let phone = phoneNumber.replace(/\D/g, "");

  // Convert 0xxx to 62xxx (Indonesian format)
  if (phone.startsWith("0")) {
    phone = "62" + phone.substring(1);
  }

  return phone;
};

// Generate JWT Token
const generateToken = (userId, userType = "admin") => {
  return jwt.sign(
    {
      userId,
      type: userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );
};

// Admin Login Controller (No Registration - Admin accounts are created by super admin)
const loginAdmin = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Admin login validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Data tidak valid",
        errors: errors.array(),
      });
    }

    const { phone_number, password } = req.body;
    console.log(`🔐 Admin login attempt for: ${phone_number}`);

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);
    console.log(`📱 Normalized phone: ${normalizedPhone}`);

    // Find user by phone number with role
    const user = await User.findOne({
      where: {
        phone_number: normalizedPhone,
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

    console.log(
      `👤 User found:`,
      user
        ? `ID: ${user.id}, Phone: ${user.phone_number}, Role: ${
            user.role ? user.role.role_name : "NO ROLE"
          }`
        : "NOT FOUND"
    );

    if (!user) {
      console.log(`❌ Admin user not found: ${phone_number}`);
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
    }

    // Check if user has admin role (not customer)
    if (user.role.role_name === "customer") {
      console.log(`❌ Customer trying to access admin: ${phone_number}`);
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    console.log(
      `✅ Admin user found: ${user.phone_number} (${user.role.role_name})`
    );

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for admin: ${phone_number}`);
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
    }

    console.log(`✅ Admin login successful for: ${phone_number}`);

    // Generate token
    const token = generateToken(user.id, "admin");

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          phone_number: user.phone_number,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    next(error);
  }
};

// Get Admin Profile Controller
const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
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
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
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

module.exports = {
  loginAdmin,
  getAdminProfile,
};
