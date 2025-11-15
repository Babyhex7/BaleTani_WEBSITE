/**
 * ============================================
 * CONTACT MESSAGE MODEL
 * ============================================
 * Model untuk pesan kontak dari customer
 * Admin bisa view, reply, dan manage status pesan
 *
 * @module contactMessage.model
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ContactMessage = sequelize.define(
  "ContactMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Customer ID jika user sudah login (optional)",
      references: {
        model: "customers",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Nama lengkap tidak boleh kosong",
        },
        len: {
          args: [3, 100],
          msg: "Nama lengkap harus antara 3-100 karakter",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Format email tidak valid",
        },
      },
      comment: "Email opsional, bisa pakai WhatsApp saja",
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Nomor WhatsApp tidak boleh kosong",
        },
        is: {
          args: /^(\+62|62|0)[0-9]{9,13}$/,
          msg: "Format nomor WhatsApp tidak valid",
        },
      },
      comment: "Nomor WhatsApp untuk kontak balik",
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Subjek tidak boleh kosong",
        },
        len: {
          args: [5, 255],
          msg: "Subjek harus antara 5-255 karakter",
        },
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Pesan tidak boleh kosong",
        },
        len: {
          args: [20, 5000],
          msg: "Pesan harus antara 20-5000 karakter",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "read", "replied", "resolved"),
      defaultValue: "pending",
      allowNull: false,
      comment: "Status pemrosesan pesan",
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Catatan internal dari admin",
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Waktu admin reply pesan",
    },
    replied_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Admin ID yang reply",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "contact_messages",
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["customer_id"],
      },
      {
        fields: ["replied_by"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = ContactMessage;
