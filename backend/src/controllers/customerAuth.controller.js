const jwt = require("jsonwebtoken");
const { Customer } = require("../models");

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

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: {
        phone_number,
        deleted_at: null,
      },
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Nomor telepon sudah terdaftar",
      });
    }

    // Create new customer
    const customer = await Customer.create({
      phone_number,
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

    // Find customer
    const customer = await Customer.findOne({
      where: {
        phone_number,
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
        customer,
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
