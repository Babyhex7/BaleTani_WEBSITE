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
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_stock: {
      type: DataTypes.INTEGER, // Changed from DECIMAL to INTEGER (no decimals, like Shopee)
      defaultValue: 0,
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
    tableName: "products",
    timestamps: false,
    paranoid: false,
    underscored: true,
  }
);

module.exports = Product;
