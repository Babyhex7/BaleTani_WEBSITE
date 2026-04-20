const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockHistory = sequelize.define(
  "StockHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    change_type: {
      type: DataTypes.ENUM("procurement", "order", "manual"),
      allowNull: false,
    },
    quantity_change: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    previous_qty: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    new_qty: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    actor_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reference_type: {
      type: DataTypes.ENUM("procurement", "order", "manual", "seed", "init"),
      allowNull: false,
      defaultValue: "manual",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    idempotency_key: {
      type: DataTypes.STRING(100),
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
  },
  {
    tableName: "stock_history",
    timestamps: false,
    paranoid: false,
    underscored: true,
    indexes: [
      {
        name: "idx_stock_history_product",
        fields: ["product_id"],
      },
      {
        name: "idx_stock_history_type",
        fields: ["change_type"],
      },
      {
        name: "idx_stock_history_created",
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = StockHistory;