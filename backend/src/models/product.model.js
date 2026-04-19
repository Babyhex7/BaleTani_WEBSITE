const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    product_type: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selling_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    quantity_info: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment:
        "Info tambahan untuk dokumentasi (contoh: '65 kg', '1 iket isi 7 batang')",
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_stock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "Jumlah stok yang ditampilkan ke customer (support decimal, contoh 0.5 kg)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "products",
    timestamps: false,
    paranoid: false,
    underscored: true,
    // FIX: Tambah indexes untuk performance (category filter, active filter, dll)
    indexes: [
      {
        name: "idx_product_category_active",
        fields: ["category_id", "is_active"],
        comment: "Index untuk filter produk per kategori dan status aktif",
      },
      {
        name: "idx_product_active",
        fields: ["is_active"],
        comment: "Index untuk filter produk aktif saja",
      },
      {
        name: "idx_product_type",
        fields: ["product_type"],
        comment: "Index untuk filter produk online/offline",
      },
      {
        name: "idx_product_created",
        fields: ["created_at"],
        comment: "Index untuk sort produk terbaru",
      },
    ],
  }
);

module.exports = Product;
