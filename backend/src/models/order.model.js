const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "transfer", "qris"),
      allowNull: false,
    },
    delivery_method: {
      type: DataTypes.ENUM("self_pickup", "delivery"),
      allowNull: false,
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item_subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      allowNull: false,
    },
    order_status: {
      type: DataTypes.ENUM(
        "checkout",
        "paid",
        "processing",
        "out_for_delivery",
        "completed",
        "cancelled"
      ),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
    paranoid: false,
    underscored: true,
  }
);

module.exports = Order;
