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
    order_type: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "transfer", "qris"),
      allowNull: false,
    },
    payment_proof_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    delivery_method: {
      type: DataTypes.ENUM("self_pickup", "delivery"),
      allowNull: false,
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    delivery_notes: {
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
    service_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    customer_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    shipping_method: {
      type: DataTypes.ENUM("delivery", "pickup"),
      allowNull: true,
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipping_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    order_status: {
      type: DataTypes.ENUM(
        "pending_payment",
        "paid",
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "completed",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending_payment",
    },
    cancelled_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
