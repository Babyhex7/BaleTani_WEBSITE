const { Customer, Order } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

/**
 * GET /api/customer/profile
 * Ambil data profile customer + statistik
 */
const getProfile = async (req, res) => {
  try {
    const customerId = req.customer.id;

    // Ambil data customer
    const customer = await Customer.findOne({
      where: { id: customerId },
      attributes: [
        "id",
        "phone_number",
        "full_name",
        "is_active",
        "created_at",
      ],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    // Hitung statistik order
    const totalOrders = await Order.count({
      where: {
        customer_id: customerId,
        order_status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    const totalSpending = await Order.sum("total_amount", {
      where: {
        customer_id: customerId,
        payment_status: "paid",
        order_status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    // Ambil order terakhir
    const lastOrder = await Order.findOne({
      where: { customer_id: customerId },
      order: [["created_at", "DESC"]],
      attributes: ["created_at"],
    });

    return res.status(200).json({
      success: true,
      message: "Data profile berhasil diambil",
      data: {
        id: customer.id,
        phone_number: customer.phone_number,
        full_name: customer.full_name,
        is_active: customer.is_active,
        member_since: customer.created_at,
        statistics: {
          total_orders: totalOrders || 0,
          total_spending: parseFloat(totalSpending) || 0,
          last_order_date: lastOrder?.created_at || null,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data profile",
      error: error.message,
    });
  }
};

/**
 * PUT /api/customer/profile
 * Update profile customer (nama saja)
 */
const updateProfile = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { full_name } = req.body;

    // Validasi
    if (!full_name || full_name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap minimal 3 karakter",
      });
    }

    // Update customer
    const customer = await Customer.findOne({ where: { id: customerId } });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    await customer.update({
      full_name: full_name.trim(),
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Profile berhasil diperbarui",
      data: {
        id: customer.id,
        full_name: customer.full_name,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profile",
      error: error.message,
    });
  }
};

/**
 * PUT /api/customer/profile/password
 * Ganti password customer
 */
const changePassword = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { old_password, new_password, confirm_password } = req.body;

    // Validasi input
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Konfirmasi password tidak cocok",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Ambil customer
    const customer = await Customer.findOne({ where: { id: customerId } });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    // Cek password lama
    const isPasswordValid = await bcrypt.compare(
      old_password,
      customer.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password lama tidak sesuai",
      });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await customer.update({
      password: hashedPassword,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengubah password",
      error: error.message,
    });
  }
};

/**
 * Logout customer
 * Frontend akan menghapus token dari localStorage
 */
const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat logout",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
