const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProcurementItem = sequelize.define(
  "ProcurementItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    procurement_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "procurements",
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "procurement_items",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProcurementItem;
