/**
 * ============================================
 * FAQ MODEL
 * ============================================
 * Model untuk FAQ (Frequently Asked Questions)
 * Admin bisa manage FAQ, customer bisa view active FAQ
 *
 * @module faq.model
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FAQ = sequelize.define(
  "FAQ",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Pertanyaan tidak boleh kosong",
        },
        len: {
          args: [10, 255],
          msg: "Pertanyaan harus antara 10-255 karakter",
        },
      },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Jawaban tidak boleh kosong",
        },
        len: {
          args: [20, 5000],
          msg: "Jawaban harus antara 20-5000 karakter",
        },
      },
    },
    category: {
      type: DataTypes.ENUM("umum", "pembayaran", "pengiriman", "produk"),
      defaultValue: "umum",
      allowNull: false,
      comment: "Kategori FAQ untuk grouping",
    },
    order_number: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Urutan tampilan FAQ (semakin kecil semakin atas)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Status aktif FAQ (customer hanya lihat yang active)",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Admin ID yang membuat FAQ",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Admin ID yang terakhir update FAQ",
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "faqs",
    timestamps: true,
    underscored: true,
    paranoid: false, // Soft delete tidak diperlukan untuk FAQ
    indexes: [
      {
        fields: ["category"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["order_number"],
      },
    ],
  }
);

module.exports = FAQ;
