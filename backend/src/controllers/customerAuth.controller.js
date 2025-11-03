const jwt = require("jsonwebtoken");
const { Customer } = require("../models");

// Utility function to normalize phone number to 62 format (consistent with model)
const normalizePhoneNumber = (phone) => {
  if (!phone) return phone;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

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
