const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const {
  Procurement,
  ProcurementItem,
  Product,
  Admin,
  StockMovement,
  SoftDeleteLog,
} = require("../models");

/**
 * Generate procurement number
 * Format: PROC-YYYYMMDD-XXXX
 */
const generateProcurementNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `PROC-${dateStr}`;

  const lastProcurement = await Procurement.findOne({
    where: {
      procurement_number: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["procurement_number", "DESC"]],
  });

  let sequence = 1;
  if (lastProcurement) {
    const lastNumber = lastProcurement.procurement_number.split("-")[2];
    sequence = parseInt(lastNumber) + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, "0")}`;
};

/**
 * GET /api/admin/procurements
 * Get all procurements with filters
 */
const getAllProcurements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q = "",
      status = "",
      type = "",
      date_from = "",
      date_to = "",
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search by procurement number or supplier name
    if (q) {
      whereClause[Op.or] = [
        { procurement_number: { [Op.like]: `%${q}%` } },
        { supplier_name: { [Op.like]: `%${q}%` } },
      ];
    }

    // Filter by status
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereClause.status = status;
    }

    // Filter by type
    if (type && ["online", "offline"].includes(type)) {
      whereClause.procurement_type = type;
    }

    // Filter by date range
    if (date_from && date_to) {
      whereClause.procurement_date = {
        [Op.between]: [date_from, date_to],
      };
    } else if (date_from) {
      whereClause.procurement_date = {
        [Op.gte]: date_from,
      };
    } else if (date_to) {
      whereClause.procurement_date = {
        [Op.lte]: date_to,
      };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get procurements with related data
    const { count, rows: procurements } = await Procurement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: "creator",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: Admin,
          as: "approver",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: Admin,
          as: "rejector",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "quantity_info"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Calculate pagination
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        items: procurements,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllProcurements:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data pengadaan",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/procurements/:id
 * Get procurement by ID with full details
 */
const getProcurementById = async (req, res) => {
  try {
    const { id } = req.params;

    const procurement = await Procurement.findByPk(id, {
      include: [
        {
          model: Admin,
          as: "creator",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: Admin,
          as: "approver",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: Admin,
          as: "rejector",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "quantity_info", "total_stock"],
            },
          ],
        },
        {
          model: SoftDeleteLog,
          as: "softDeleteLog",
          required: false,
          include: [
            {
              model: Admin,
              as: "deleter",
              attributes: ["id", "phone_number", "full_name"],
            },
          ],
        },
      ],
    });

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: procurement,
    });
  } catch (error) {
    console.error("❌ Error in getProcurementById:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pengadaan",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/procurements
 * Create new procurement
 */
const createProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      procurement_date,
      procurement_type,
      supplier_name,
      items,
      notes,
    } = req.body;

    // Validate required fields
    if (!procurement_date || !items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanggal pengadaan dan items harus diisi",
      });
    }

    // Generate procurement number
    const procurement_number = await generateProcurementNumber();

    // Calculate total amount
    const total_amount = items.reduce(
      (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unit_price),
      0
    );

    // Create procurement
    const procurement = await Procurement.create(
      {
        procurement_number,
        procurement_date,
        procurement_type: procurement_type || "online",
        supplier_name,
        total_amount,
        status: "pending",
        notes,
        created_by: req.user.id,
      },
      { transaction }
    );

    // Create procurement items and update stock
    for (const item of items) {
      // Get product
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan`,
        });
      }

      // Create procurement item
      await ProcurementItem.create(
        {
          procurement_id: procurement.id,
          product_id: item.product_id,
          quantity: item.quantity,
          purchase_price_per_unit: item.unit_price,
          subtotal: parseFloat(item.quantity) * parseFloat(item.unit_price),
          expiry_date: item.expiry_date,
        },
        { transaction }
      );

      // Update product stock
      const stock_before = parseFloat(product.total_stock);
      const quantity_change = parseFloat(item.quantity);
      const stock_after = stock_before + quantity_change;

      await product.update(
        { total_stock: stock_after },
        { transaction }
      );

      // Record stock movement
      await StockMovement.create(
        {
          product_id: item.product_id,
          movement_type: "procurement_in",
          quantity_change,
          stock_before,
          stock_after,
          reference_type: "procurement",
          reference_id: procurement.id,
          created_by: req.user.id,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch created procurement with relations
    const createdProcurement = await Procurement.findByPk(procurement.id, {
      include: [
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Pengadaan berhasil dibuat",
      data: createdProcurement,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in createProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat pengadaan",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/procurements/:id
 * Update procurement (pending only)
 */
const updateProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      procurement_date,
      procurement_type,
      supplier_name,
      items,
      notes,
    } = req.body;

    // Get procurement
    const procurement = await Procurement.findByPk(id, {
      include: [
        {
          model: ProcurementItem,
          as: "items",
        },
      ],
    });

    if (!procurement) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    // Only pending procurement can be updated
    if (procurement.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Hanya pengadaan dengan status pending yang dapat diubah",
      });
    }

    // Rollback old stock movements
    for (const oldItem of procurement.items) {
      const product = await Product.findByPk(oldItem.product_id);
      const stock_before = parseFloat(product.total_stock);
      const quantity_change = -parseFloat(oldItem.quantity);
      const stock_after = stock_before + quantity_change;

      await product.update(
        { total_stock: stock_after },
        { transaction }
      );

      await StockMovement.create(
        {
          product_id: oldItem.product_id,
          movement_type: "adjustment",
          quantity_change,
          stock_before,
          stock_after,
          reference_type: "procurement",
          reference_id: procurement.id,
          created_by: req.user.id,
        },
        { transaction }
      );
    }

    // Delete old items
    await ProcurementItem.destroy({
      where: { procurement_id: id },
      transaction,
    });

    // Calculate new total amount
    const total_amount = items.reduce(
      (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.unit_price),
      0
    );

    // Update procurement
    await procurement.update(
      {
        procurement_date,
        procurement_type,
        supplier_name,
        total_amount,
        notes,
      },
      { transaction }
    );

    // Create new items and update stock
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan`,
        });
      }

      await ProcurementItem.create(
        {
          procurement_id: procurement.id,
          product_id: item.product_id,
          quantity: item.quantity,
          purchase_price_per_unit: item.unit_price,
          subtotal: parseFloat(item.quantity) * parseFloat(item.unit_price),
          expiry_date: item.expiry_date,
        },
        { transaction }
      );

      const stock_before = parseFloat(product.total_stock);
      const quantity_change = parseFloat(item.quantity);
      const stock_after = stock_before + quantity_change;

      await product.update(
        { total_stock: stock_after },
        { transaction }
      );

      await StockMovement.create(
        {
          product_id: item.product_id,
          movement_type: "procurement_in",
          quantity_change,
          stock_before,
          stock_after,
          reference_type: "procurement",
          reference_id: procurement.id,
          created_by: req.user.id,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch updated procurement
    const updatedProcurement = await Procurement.findByPk(id, {
      include: [
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Pengadaan berhasil diperbarui",
      data: updatedProcurement,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in updateProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui pengadaan",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/procurements/:id/approve
 * Approve procurement
 */
const approveProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    if (procurement.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Hanya pengadaan dengan status pending yang dapat disetujui",
      });
    }

    await procurement.update({
      status: "approved",
      approved_by: req.user.id,
      approved_at: new Date(),
      notes: notes || procurement.notes,
    });

    res.status(200).json({
      success: true,
      message: "Pengadaan berhasil disetujui",
      data: procurement,
    });
  } catch (error) {
    console.error("❌ Error in approveProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menyetujui pengadaan",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/procurements/:id/reject
 * Reject procurement and rollback stock
 */
const rejectProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan harus diisi",
      });
    }

    const procurement = await Procurement.findByPk(id, {
      include: [
        {
          model: ProcurementItem,
          as: "items",
        },
      ],
    });

    if (!procurement) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    if (procurement.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Hanya pengadaan dengan status pending yang dapat ditolak",
      });
    }

    // Rollback stock
    for (const item of procurement.items) {
      const product = await Product.findByPk(item.product_id);
      const stock_before = parseFloat(product.total_stock);
      const quantity_change = -parseFloat(item.quantity);
      const stock_after = stock_before + quantity_change;

      await product.update(
        { total_stock: stock_after },
        { transaction }
      );

      await StockMovement.create(
        {
          product_id: item.product_id,
          movement_type: "adjustment",
          quantity_change,
          stock_before,
          stock_after,
          reference_type: "procurement",
          reference_id: procurement.id,
          created_by: req.user.id,
        },
        { transaction }
      );
    }

    // Update procurement status
    await procurement.update(
      {
        status: "rejected",
        rejected_by: req.user.id,
        rejected_at: new Date(),
        rejection_reason,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Pengadaan berhasil ditolak",
      data: procurement,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in rejectProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menolak pengadaan",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/procurements/:id
 * Soft delete procurement
 */
const softDeleteProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { deleted_reason } = req.body;

    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    // Check if already deleted
    const existingLog = await SoftDeleteLog.findOne({
      where: {
        table_name: "procurements",
        record_id: id,
      },
    });

    if (existingLog) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Pengadaan sudah dihapus sebelumnya",
      });
    }

    // Soft delete (using paranoid)
    await procurement.destroy({ transaction });

    // Create soft delete log
    await SoftDeleteLog.create(
      {
        table_name: "procurements",
        record_id: id,
        deleted_by: req.user.id,
        deleted_reason: deleted_reason || null,
        deleted_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Pengadaan berhasil dihapus",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in softDeleteProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus pengadaan",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/procurements/:id/restore
 * Restore soft deleted procurement
 */
const restoreProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const procurement = await Procurement.findByPk(id, {
      paranoid: false,
    });

    if (!procurement) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Pengadaan tidak ditemukan",
      });
    }

    if (!procurement.deleted_at) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Pengadaan tidak dalam status terhapus",
      });
    }

    // Restore procurement
    await procurement.restore({ transaction });

    // Update soft delete log
    await SoftDeleteLog.update(
      {
        deleted_reason: `${SoftDeleteLog.deleted_reason || ""}\n[RESTORED at ${new Date().toISOString()}]`,
      },
      {
        where: {
          table_name: "procurements",
          record_id: id,
        },
        transaction,
      }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Pengadaan berhasil dipulihkan",
      data: procurement,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in restoreProcurement:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memulihkan pengadaan",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProcurements,
  getProcurementById,
  createProcurement,
  updateProcurement,
  approveProcurement,
  rejectProcurement,
  softDeleteProcurement,
  restoreProcurement,
};
