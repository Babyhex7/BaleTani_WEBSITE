/**
 * OrderStatusHistory Model
 * Tracks all status changes for orders
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderStatusHistory = sequelize.define(
  "OrderStatusHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "orders",
        key: "id"
      }
    },
    old_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Previous order status"
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "New order status"
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional notes about the status change"
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Admin ID who made the change",
      references: {
        model: "admins",
        key: "id"
      }
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },
  {
    tableName: "order_status_history",
    timestamps: false,
    underscored: true
  }
);

module.exports = OrderStatusHistory;
