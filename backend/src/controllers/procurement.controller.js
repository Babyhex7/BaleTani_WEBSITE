const {
  Procurement,
  ProcurementItem,
  Product,
  User,
  StockMovement,
} = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

// Generate procurement number
const generateProcurementNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `PROC-${year}${month}`;

  const lastProcurement = await Procurement.findOne({
    where: {
      procurement_number: {
        [Op.like]: `${prefix}%`,
      },
    },
    order: [["created_at", "DESC"]],
  });

  let sequence = 1;
  if (lastProcurement) {
    const lastNumber = parseInt(lastProcurement.procurement_number.split("-").pop());
    sequence = lastNumber + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
};

// Get all procurements
const getAllProcurements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { procurement_number: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Procurement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "rejecter",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        procurements: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching procurements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch procurements",
      error: error.message,
    });
  }
};

// Get single procurement
const getProcurementById = async (req, res) => {
  try {
    const { id } = req.params;

    const procurement = await Procurement.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "rejecter",
          attributes: ["id", "fullName", "email"],
        },
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

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: "Procurement not found",
      });
    }

    res.json({
      success: true,
      data: procurement,
    });
  } catch (error) {
    console.error("Error fetching procurement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch procurement",
      error: error.message,
    });
  }
};

// Create procurement
const createProcurement = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Procurement items are required",
      });
    }

    // Generate procurement number
    const procurementNumber = await generateProcurementNumber();

    // Calculate total cost
    let totalCost = 0;
    items.forEach((item) => {
      totalCost += item.quantity * item.unit_price;
    });

    // Create procurement
    const procurement = await Procurement.create(
      {
        procurement_number: procurementNumber,
        created_by: req.user.id,
        status: "pending",
        total_cost: totalCost,
        notes,
      },
      { transaction: t }
    );

    // Create procurement items
    const procurementItems = items.map((item) => ({
      procurement_id: procurement.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      expiry_date: item.expiry_date || null,
    }));

    await ProcurementItem.bulkCreate(procurementItems, { transaction: t });

    await t.commit();

    // Fetch complete procurement data
    const completeProcurement = await Procurement.findByPk(procurement.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
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
      message: "Procurement created successfully",
      data: completeProcurement,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error creating procurement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create procurement",
      error: error.message,
    });
  }
};

// Approve procurement
const approveProcurement = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const procurement = await Procurement.findByPk(id, {
      include: [
        {
          model: ProcurementItem,
          as: "items",
        },
      ],
    });

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: "Procurement not found",
      });
    }

    if (procurement.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending procurements can be approved",
      });
    }

    // Update procurement status
    procurement.status = "approved";
    procurement.approved_by = req.user.id;
    procurement.approved_at = new Date();
    await procurement.save({ transaction: t });

    // Update product stock and create stock movements
    for (const item of procurement.items) {
      // Update product stock
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (product) {
        product.total_stock = (product.total_stock || 0) + item.quantity;
        await product.save({ transaction: t });

        // Create stock movement record
        await StockMovement.create(
          {
            product_id: item.product_id,
            movement_type: "procurement_in",
            quantity: item.quantity,
            reference_type: "procurement",
            reference_id: procurement.id,
            notes: `Procurement ${procurement.procurement_number} approved`,
            created_by: req.user.id,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    // Fetch updated procurement
    const updatedProcurement = await Procurement.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "fullName", "email"],
        },
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

    res.json({
      success: true,
      message: "Procurement approved successfully",
      data: updatedProcurement,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error approving procurement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve procurement",
      error: error.message,
    });
  }
};

// Reject procurement
const rejectProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const procurement = await Procurement.findByPk(id);

    if (!procurement) {
      return res.status(404).json({
        success: false,
        message: "Procurement not found",
      });
    }

    if (procurement.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending procurements can be rejected",
      });
    }

    // Update procurement status
    procurement.status = "rejected";
    procurement.rejected_by = req.user.id;
    procurement.rejected_at = new Date();
    procurement.rejection_reason = rejection_reason;
    await procurement.save();

    // Fetch updated procurement
    const updatedProcurement = await Procurement.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "fullName", "email"],
        },
        {
          model: User,
          as: "rejecter",
          attributes: ["id", "fullName", "email"],
        },
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

    res.json({
      success: true,
      message: "Procurement rejected successfully",
      data: updatedProcurement,
    });
  } catch (error) {
    console.error("Error rejecting procurement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject procurement",
      error: error.message,
    });
  }
};

// Get procurement statistics
const getProcurementStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const totalProcurements = await Procurement.count({ where: whereClause });

    const pendingProcurements = await Procurement.count({
      where: { ...whereClause, status: "pending" },
    });

    const approvedProcurements = await Procurement.count({
      where: { ...whereClause, status: "approved" },
    });

    const rejectedProcurements = await Procurement.count({
      where: { ...whereClause, status: "rejected" },
    });

    const totalCost = await Procurement.sum("total_cost", {
      where: { ...whereClause, status: "approved" },
    });

    res.json({
      success: true,
      data: {
        totalProcurements,
        pendingProcurements,
        approvedProcurements,
        rejectedProcurements,
        totalCost: totalCost || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching procurement stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch procurement statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProcurements,
  getProcurementById,
  createProcurement,
  approveProcurement,
  rejectProcurement,
  getProcurementStats,
};
