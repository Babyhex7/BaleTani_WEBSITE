/**
 * Admin Customer Controller
 * Kelola data customer untuk admin
 */

const { Op } = require("sequelize");
const { Customer, Order, OrderItem } = require("../models");

/**
 * GET /api/admin/customers
 * Ambil semua customer dengan filter dan pagination
 */
const getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      is_active = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {};

    // Search by nama atau nomor HP
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by status aktif
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    // Hitung total customers
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "phone_number",
        "full_name",
        "address",
        "is_active",
        "created_at",
        "updated_at",
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
      distinct: true,
    });

    // Hitung total order dan spending per customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await Order.findOne({
          where: { customer_id: customer.id },
          attributes: [
            [
              Order.sequelize.fn("COUNT", Order.sequelize.col("id")),
              "total_orders",
            ],
            [
              Order.sequelize.fn("SUM", Order.sequelize.col("total_amount")),
              "total_spending",
            ],
          ],
          raw: true,
        });

        return {
          ...customer.toJSON(),
          total_orders: parseInt(orderStats?.total_orders || 0),
          total_spending: parseFloat(orderStats?.total_spending || 0),
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Data customer berhasil diambil",
      data: customersWithStats,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / parseInt(limit)),
        current_page: parseInt(page),
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data customer",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/customers/:id
 * Ambil detail customer beserta history order
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id },
      attributes: [
        "id",
        "phone_number",
        "full_name",
        "address",
        "is_active",
        "created_at",
        "updated_at",
      ],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    // Ambil history order customer
    const orders = await Order.findAll({
      where: { customer_id: id },
      attributes: [
        "id",
        "order_number",
        "transaction_type",
        "payment_method",
        "payment_status",
        "order_status",
        "total_amount",
        "created_at",
      ],
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["product_name", "quantity", "subtotal"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    // Hitung statistik
    const orderStats = await Order.findOne({
      where: { customer_id: id },
      attributes: [
        [
          Order.sequelize.fn("COUNT", Order.sequelize.col("id")),
          "total_orders",
        ],
        [
          Order.sequelize.fn("SUM", Order.sequelize.col("total_amount")),
          "total_spending",
        ],
      ],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: "Detail customer berhasil diambil",
      data: {
        ...customer.toJSON(),
        total_orders: parseInt(orderStats?.total_orders || 0),
        total_spending: parseFloat(orderStats?.total_spending || 0),
        recent_orders: orders,
      },
    });
  } catch (error) {
    console.error("Get customer by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil detail customer",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/customers/:id
 * Update data customer
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, address, is_active } = req.body;

    // Validasi input
    if (!full_name || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap dan nomor HP wajib diisi",
      });
    }

    const customer = await Customer.findOne({ where: { id } });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    // Cek apakah nomor HP sudah digunakan customer lain
    if (phone_number !== customer.phone_number) {
      const existingCustomer = await Customer.findOne({
        where: {
          phone_number,
          id: { [Op.ne]: id },
        },
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "Nomor HP sudah digunakan customer lain",
        });
      }
    }

    // Update data customer
    await customer.update({
      full_name,
      phone_number,
      address: address || customer.address,
      is_active: is_active !== undefined ? is_active : customer.is_active,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Data customer berhasil diperbarui",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data customer",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/customers/:id/status
 * Toggle status aktif customer
 */
const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({ where: { id } });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    // Toggle status
    await customer.update({
      is_active: !customer.is_active,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Customer berhasil ${
        customer.is_active ? "diaktifkan" : "dinonaktifkan"
      }`,
      data: {
        id: customer.id,
        full_name: customer.full_name,
        is_active: customer.is_active,
      },
    });
  } catch (error) {
    console.error("Toggle customer status error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengubah status customer",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/customers/:id
 * Hard delete customer (orders tetap disimpan)
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({ where: { id } });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan",
      });
    }

    const customerName = customer.full_name;

    // Hard delete customer (orders tetap ada untuk audit)
    await customer.destroy();

    return res.status(200).json({
      success: true,
      message: "Customer berhasil dihapus",
      data: {
        id,
        full_name: customerName,
      },
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus customer",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
  deleteCustomer,
};
