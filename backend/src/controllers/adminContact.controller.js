/**
 * ============================================
 * ADMIN CONTACT MESSAGE CONTROLLER
 * ============================================
 * Handle management contact messages dari customer
 * - Get All Messages (with filters & pagination)
 * - Get Single Message
 * - Update Message Status
 * - Add Admin Notes
 * - Delete Message
 * - Get Statistics
 *
 * @module adminContact.controller
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { ContactMessage, Customer, Admin } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Get all contact messages with filters
 * GET /api/admin/contacts
 */
exports.getAllMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      from_date = "",
      to_date = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter (name, email, subject, or message)
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
        { whatsapp_number: { [Op.like]: `%${search}%` } },
      ];
    }

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Date range filter
    if (from_date) {
      whereClause.created_at = { [Op.gte]: new Date(from_date) };
    }
    if (to_date) {
      if (whereClause.created_at) {
        whereClause.created_at[Op.lte] = new Date(to_date);
      } else {
        whereClause.created_at = { [Op.lte]: new Date(to_date) };
      }
    }

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Format data untuk frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      customer_id: msg.customer_id,
      name: msg.full_name,
      email: msg.email,
      phone: msg.whatsapp_number,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      admin_notes: msg.admin_notes,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      replied_at: msg.replied_at,
      replied_by: msg.replied_by,
    }));

    res.status(200).json({
      success: true,
      message: "Contact messages retrieved successfully",
      data: formattedMessages,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single contact message by ID
 * GET /api/admin/contacts/:id
 */
exports.getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Pesan tidak ditemukan",
      });
    }

    // Auto update status to 'read' if still pending
    if (message.status === "pending") {
      message.status = "read";
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: "Contact message retrieved successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update message status
 * PUT /api/admin/contacts/:id/status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const adminId = req.user.id;

    // Validate status
    const validStatuses = ["pending", "read", "replied", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid",
      });
    }

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Pesan tidak ditemukan",
      });
    }

    // Update status
    message.status = status;

    // Update admin notes if provided
    if (admin_notes) {
      message.admin_notes = admin_notes;
    }

    // If status is 'replied', set replied_at and replied_by
    if (status === "replied" && !message.replied_at) {
      message.replied_at = new Date();
      message.replied_by = adminId;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: "Status pesan berhasil diupdate",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or update admin notes
 * PUT /api/admin/contacts/:id/notes
 */
exports.updateNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Pesan tidak ditemukan",
      });
    }

    message.admin_notes = admin_notes;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Catatan berhasil diupdate",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contact message
 * DELETE /api/admin/contacts/:id
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Pesan tidak ditemukan",
      });
    }

    await message.destroy();

    res.status(200).json({
      success: true,
      message: "Pesan berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contact message statistics
 * GET /api/admin/contacts/stats
 */
exports.getStatistics = async (req, res, next) => {
  try {
    // Count by status
    const statusStats = await ContactMessage.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Total messages
    const totalMessages = await ContactMessage.count();

    // Messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await ContactMessage.count({
      where: {
        created_at: { [Op.gte]: today },
      },
    });

    // Pending messages (unread)
    const pendingMessages = await ContactMessage.count({
      where: { status: "pending" },
    });

    // Average response time (in hours)
    const avgResponseTime = await ContactMessage.findAll({
      attributes: [
        [
          sequelize.fn(
            "AVG",
            sequelize.literal("TIMESTAMPDIFF(HOUR, created_at, replied_at)")
          ),
          "avg_hours",
        ],
      ],
      where: {
        replied_at: { [Op.not]: null },
      },
      raw: true,
    });

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: {
        total: totalMessages,
        today: messagesToday,
        pending: pendingMessages,
        by_status: statusStats,
        avg_response_hours: avgResponseTime[0]?.avg_hours || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
