const jwt = require("jsonwebtoken");
const { Customer } = require("../models");

// Utility function to normalize phone number to +62 format
const normalizePhoneNumber = (phone) => {
  if (!phone) return phone;

  // Remove all spaces and dashes
  let normalized = phone.replace(/[\s-]/g, "");

  // If starts with 0, replace with +62
  if (normalized.startsWith("0")) {
    normalized = "+62" + normalized.substring(1);
  }
  // If starts with 62, add +
  else if (normalized.startsWith("62") && !normalized.startsWith("+62")) {
    normalized = "+" + normalized;
  }
  // If doesn't start with +62, assume it needs +62
  else if (!normalized.startsWith("+62")) {
    normalized = "+62" + normalized;
  }

  return normalized;
};

// Register Customer
const registerCustomer = async (req, res) => {
  try {
    const { phone_number, full_name, password, address } = req.body;

    // Validate required fields
    if (!phone_number || !full_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon, nama lengkap, dan password wajib diisi",
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: {
        phone_number: normalizedPhone,
        deleted_at: null,
      },
    });

    if (existingCustomer) {
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
        id: customer.id,
        phone_number: customer.phone_number,
        type: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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
      return res.status(400).json({
        success: false,
        message: "Nomor telepon dan password wajib diisi",
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone_number);

    // Find customer with normalized phone number
    const customer = await Customer.findOne({
      where: {
        phone_number: normalizedPhone,
        deleted_at: null,
        is_active: true,
      },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
    }

    // Check password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nomor telepon atau password salah",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: customer.id,
        phone_number: customer.phone_number,
        type: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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
        deleted_at: null,
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
