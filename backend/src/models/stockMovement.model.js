const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockMovement = sequelize.define(
  "StockMovement",
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
    movement_type: {
      type: DataTypes.ENUM("procurement_in", "sale_out", "adjustment", "expired"),
      allowNull: false,
    },
    quantity_change: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_before: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock_after: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
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
    tableName: "stock_movements_reporting",
    timestamps: false,
    paranoid: false,
    underscored: true,
  }
);

module.exports = StockMovement;
