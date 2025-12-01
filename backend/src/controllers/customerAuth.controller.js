const jwt = require("jsonwebtoken");
const { Customer } = require("../models");
const {
  normalizePhoneNumber,
  isValidPhoneNumber,
} = require("../utils/phoneHelper");

/**
 * Customer Authentication Controller
 * Handle registration and login for customers
 *
 * Security features:
 * - Phone number validation and normalization
 * - Password hashing (via model hooks)
 * - Audit logging for security monitoring
 * - Rate limiting (handled by middleware)
 */

// Register Customer
const registerCustomer = async (req, res) => {
  try {
    const { phone_number, full_name, password, address } = req.body;

    // Validate required fields
    if (!phone_number || !full_name || !password) {
      console.warn(`[REGISTER FAILED] Missing fields - IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: "Nomor telepon, nama lengkap, dan password wajib diisi",
      });
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone_number)) {
      console.warn(
        `[REGISTER FAILED] Invalid phone format: ${phone_number} - IP: ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        message: "Format nomor telepon tidak valid",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);
    console.log(`[REGISTER ATTEMPT] Phone: ${normalizedPhone} - IP: ${req.ip}`);

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: {
        phone_number: normalizedPhone,
      },
    });

    if (existingCustomer) {
      console.warn(
        `[REGISTER FAILED] Phone already exists: ${normalizedPhone} - IP: ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        message: "Nomor telepon sudah terdaftar",
      });
    }

    // Create new customer with normalized phone number
    const customer = await Customer.create({
      phone_number: normalizedPhone,
      full_name,
      password_hash: password, // Will be hashed by the hook
      address: address || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: customer.id,
        phone_number: customer.phone_number,
        type: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Changed to 7 days for consistency with admin
    );

    // AUDIT LOG: Success registration
    console.log(
      `[REGISTER SUCCESS] Customer: ${customer.id}, Name: ${customer.full_name} - IP: ${req.ip}`
    );

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        customer: {
          id: customer.id,
          phone_number: customer.phone_number,
          full_name: customer.full_name,
          address: customer.address,
          role: "customer", // Add role for frontend authorization
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register customer error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// Login Customer
const loginCustomer = async (req, res) => {
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

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);
    console.log(
      `[LOGIN ATTEMPT] Customer - Phone: ${normalizedPhone}, IP: ${req.ip}`
    );

    // Find customer with normalized phone number
    const customer = await Customer.findOne({
      where: {
        phone_number: normalizedPhone,
        is_active: true,
      },
    });

    // Generic error message for security
    const genericError = {
      success: false,
      message: "Nomor telepon atau password salah",
    };

    if (!customer) {
      console.warn(
        `[LOGIN FAILED] Customer not found: ${normalizedPhone} - IP: ${req.ip}`
      );
      return res.status(401).json(genericError);
    }

    // Check password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      console.warn(
        `[LOGIN FAILED] Invalid password: ${normalizedPhone} - IP: ${req.ip}`
      );
      return res.status(401).json(genericError);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: customer.id,
        phone_number: customer.phone_number,
        type: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Changed to 7 days for consistency
    );

    // AUDIT LOG: Success login
    console.log(
      `[LOGIN SUCCESS] Customer: ${customer.id}, Name: ${customer.full_name} - IP: ${req.ip}`
    );

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        customer: {
          id: customer.id,
          phone_number: customer.phone_number,
          full_name: customer.full_name,
          address: customer.address,
          role: "customer", // Add role for frontend authorization
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login customer error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

// Get Customer Profile
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.customer.id,
        is_active: true,
      },
      attributes: ["id", "phone_number", "full_name", "address", "created_at"],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          phone_number: customer.phone_number,
          full_name: customer.full_name,
          address: customer.address,
          created_at: customer.created_at,
          role: "customer", // Add role for frontend authorization
        },
      },
    });
  } catch (error) {
    console.error("Get customer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
};
