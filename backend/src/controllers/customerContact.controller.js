/**
 * ============================================
 * CUSTOMER CONTACT CONTROLLER
 * ============================================
 * Handle contact form submission dari customer
 * - Submit Contact Form
 * - Get My Messages (if logged in)
 *
 * @module customerContact.controller
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { ContactMessage, Customer } = require("../models");
const { Op } = require("sequelize");

/**
 * Submit contact form
 * POST /api/customer/contact
 */
exports.submitContactForm = async (req, res, next) => {
  try {
    const { full_name, email, whatsapp_number, subject, message } = req.body;

    // Get customer ID if user is logged in
    const customerId = req.user?.id || null;

    // Validation
    if (!full_name || !whatsapp_number || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Nama, nomor WhatsApp, subjek, dan pesan wajib diisi",
      });
    }

    // Validate WhatsApp number format
    const waRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!waRegex.test(whatsapp_number)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor WhatsApp tidak valid",
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }
    }

    // Check if user has submitted too many messages today (spam prevention)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesCount = await ContactMessage.count({
      where: {
        whatsapp_number,
        created_at: { [Op.gte]: today },
      },
    });

    if (messagesCount >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Anda sudah mengirim terlalu banyak pesan hari ini. Silakan coba lagi besok.",
      });
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      customer_id: customerId,
      full_name,
      email: email || null,
      whatsapp_number,
      subject,
      message,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.",
      data: {
        id: contactMessage.id,
        created_at: contactMessage.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my contact messages (for logged in customer)
 * GET /api/customer/contact/my-messages
 */
exports.getMyMessages = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where: {
        customer_id: customerId,
      },
      attributes: [
        "id",
        "subject",
        "message",
        "status",
        "created_at",
        "replied_at",
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single message detail (for logged in customer)
 * GET /api/customer/contact/my-messages/:id
 */
exports.getMyMessageById = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const message = await ContactMessage.findOne({
      where: {
        id,
        customer_id: customerId,
      },
      attributes: [
        "id",
        "full_name",
        "email",
        "whatsapp_number",
        "subject",
        "message",
        "status",
        "created_at",
        "replied_at",
      ],
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Pesan tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message retrieved successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
