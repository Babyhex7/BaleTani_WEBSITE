const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Discount = sequelize.define(
  "Discount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    discount_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed_amount"),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
    },
  {
    tableName: "discounts",
    timestamps: false,
    paranoid: false,
    underscored: true
  }
);

module.exports = Discount;
