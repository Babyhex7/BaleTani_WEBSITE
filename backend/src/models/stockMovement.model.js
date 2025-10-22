const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockMovement = sequelize.define(
  "StockMovement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    movement_type: {
      type: DataTypes.ENUM("procurement_in", "sale_out", "adjustment"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_type: {
      type: DataTypes.ENUM("procurement", "order", "manual"),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "stock_movements_reporting",
    timestamps: true,
    underscored: true,
  }
);

module.exports = StockMovement;
