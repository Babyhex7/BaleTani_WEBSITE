const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");
const {
  Procurement,
  ProcurementItem,
  Product,
  Admin,
  StockMovement,
} = require("../models");

/**
 * GET /api/admin/procurements
 * List procurements with pagination and filters
 */
const getAllProcurements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      q = "",
      status = "",
      type = "",
      supplier = "",
      date_from = "",
      date_to = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const whereClause = {};

    if (q) {
      whereClause[Op.or] = [
        { procurement_number: { [Op.like]: `%${q}%` } },
        { supplier_name: { [Op.like]: `%${q}%` } },
      ];
    }

    if (status) whereClause.status = status;
    if (supplier) whereClause.supplier_name = { [Op.like]: `%${supplier}%` };

    if (date_from && date_to) {
      whereClause.procurement_date = {
        [Op.between]: [new Date(date_from), new Date(date_to + " 23:59:59")],
      };
    } else if (date_from) {
      whereClause.procurement_date = { [Op.gte]: new Date(date_from) };
    } else if (date_to) {
      whereClause.procurement_date = { [Op.lte]: new Date(date_to + " 23:59:59") };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build include - include items and product for optional type filtering
    const include = [
      {
        model: ProcurementItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "product_type", "shelf_life_days"],
          },
        ],
      },
      {
        model: Admin,
        as: "creator",
        attributes: ["id", "full_name"],
      },
      {
        model: Admin,
        as: "approver",
        attributes: ["id", "full_name"],
        required: false,
      },
    ];

    // If type filter provided, we'll add a where on nested product
    let havingWhere = null;
    if (type && ["online", "offline"].includes(type)) {
      // We will filter procurements which have at least one item with product.product_type = type
      // This cannot be expressed easily in where of Procurement; we use include with required true on item->product
      include[0].required = true;
      include[0].include[0].where = { product_type: type };
    }

    const { count, rows } = await Procurement.findAndCountAll({
      where: whereClause,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sort_by, sort_order]],
      distinct: true,
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    // Format for frontend
    const formatted = rows.map((r) => ({
      id: r.id,
      procurement_number: r.procurement_number,
      procurement_date: r.procurement_date,
      supplier_name: r.supplier_name,
      total_amount: parseFloat(r.total_amount || 0),
      status: r.status,
      notes: r.notes,
      created_by: r.created_by,
      created_at: r.created_at,
      approved_by: r.approved_by,
      approved_at: r.approved_at,
      creator: r.creator ? { id: r.creator.id, full_name: r.creator.full_name } : null,
      approver: r.approver ? { id: r.approver.id, full_name: r.approver.full_name } : null,
      items: (r.items || []).map((it) => ({
        id: it.id,
        product_id: it.product_id,
        product_name: it.product ? it.product.name : it.product_name,
        quantity: parseFloat(it.quantity),
        purchase_price_per_unit: parseFloat(it.purchase_price_per_unit || it.unit_price || 0),
        subtotal: parseFloat(it.subtotal || 0),
        expiry_date: it.expiry_date,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Procurements fetched",
      data: {
        items: formatted,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching procurements:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data pengadaan", error: error.message });
  }
};

/**
 * POST /api/admin/procurements
 * Create procurement with items and update stock
 */
const createProcurement = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { procurement_date, procurement_type, supplier_name, items = [] } = req.body;
    const adminId = req.user.id;

    if (!procurement_date || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Tanggal dan minimal 1 item harus diisi" });
    }

    // Validate items
    let totalAmount = 0;
    for (const it of items) {
      if (!it.product_id) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "product_id wajib di tiap item" });
      }
      if (!it.quantity || Number(it.quantity) <= 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "Quantity harus > 0" });
      }
      if (it.unit_price === undefined || Number(it.unit_price) < 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "unit_price tidak valid" });
      }
    }

    // Generate procurement number: PROC-YYYYMMDD-XXXX
    const now = new Date(procurement_date);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const procurementNumber = `PROC-${year}${month}${day}-${random}`;

    // Calculate totals and create procurement
    // We'll create procurement first with zero total then update after items
    const procurement = await Procurement.create(
      {
        procurement_number: procurementNumber,
        supplier_name: supplier_name || "-",
        procurement_date,
        total_amount: 0,
        status: "pending",
        created_by: adminId,
        created_at: getWIBDate(),
        updated_at: getWIBDate(),
      },
      { transaction }
    );

    // Create items and update product stock
    for (const it of items) {
      const product = await Product.findByPk(it.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: `Produk ${it.product_id} tidak ditemukan` });
      }

      const qty = Number(it.quantity);
      const unitPrice = Number(it.unit_price);
      const subtotal = qty * unitPrice;
      totalAmount += subtotal;

      // expiry_date: if provided use it, else use procurement_date + shelf_life_days
      let expiryDate = it.expiry_date;
      if (!expiryDate) {
        const shelfDays = Number(product.shelf_life_days || 0);
        const d = new Date(procurement_date);
        d.setDate(d.getDate() + shelfDays);
        expiryDate = d.toISOString().slice(0, 10);
      }

      await ProcurementItem.create(
        {
          procurement_id: procurement.id,
          product_id: product.id,
          quantity: qty,
          purchase_price_per_unit: unitPrice,
          subtotal,
          expiry_date: expiryDate,
          created_at: getWIBDate(),
        },
        { transaction }
      );

      // Update product stock
      const stockBefore = Number(product.total_stock || 0);
      const stockAfter = stockBefore + qty;
      await product.update({ total_stock: stockAfter, updated_at: getWIBDate() }, { transaction });

      // Create stock movement record
      try {
        await StockMovement.create(
          {
            product_id: product.id,
            movement_type: "procurement_in",
            quantity_change: qty,
            stock_before: stockBefore,
            stock_after: stockAfter,
            reference_id: procurement.id,
            reference_type: "procurement",
            created_by: adminId,
            created_at: getWIBDate(),
          },
          { transaction }
        );
      } catch (smErr) {
        // Non-fatal if stock movement fails
        console.warn("StockMovement create failed:", smErr.message || smErr);
      }
    }

    // Update procurement total
    await procurement.update({ total_amount: totalAmount, updated_at: getWIBDate() }, { transaction });

    await transaction.commit();

    // Return created procurement with items
    const created = await Procurement.findOne({
      where: { id: procurement.id },
      include: [
        { model: ProcurementItem, as: "items", include: [{ model: Product, as: "product" }] },
        { model: Admin, as: "creator", attributes: ["id", "full_name"] },
      ],
    });

    res.status(201).json({ success: true, message: "Procurement created", data: created });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error("Error creating procurement:", error);
    res.status(500).json({ success: false, message: "Gagal membuat pengadaan", error: error.message });
  }
};

module.exports = {
  getAllProcurements,
  createProcurement,
};
