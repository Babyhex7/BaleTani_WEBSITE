const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    original_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: "Harga asli produk per unit",
    },
    discount_price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: "Harga setelah diskon per unit (jika ada diskon)",
    },
    final_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Harga final per unit yang dibayar customer",
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: "final_price * quantity",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
    paranoid: false,
    underscored: true,
    // FIX: Tambah indexes untuk performance (items per order, product sales tracking)
    indexes: [
      {
        name: "idx_order_item_order",
        fields: ["order_id"],
        comment: "Index untuk ambil semua items dalam 1 order",
      },
      {
        name: "idx_order_item_product",
        fields: ["product_id"],
        comment: "Index untuk tracking penjualan per product",
      },
      {
        name: "idx_order_item_created",
        fields: ["created_at"],
        comment: "Index untuk laporan penjualan berdasarkan waktu",
      },
    ],
  }
);

module.exports = OrderItem;
