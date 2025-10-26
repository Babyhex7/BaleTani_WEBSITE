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
    quantity_per_unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Jumlah per satuan (contoh: 65 untuk 65kg per pack)",
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Satuan berat/volume (kg, liter, gram, pcs, dll)",
    },
    unit_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "unit",
      comment: "Tipe kemasan (pack, box, karton, unit, dll)",
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_stock: {
      type: DataTypes.INTEGER, // Changed from DECIMAL to INTEGER (no decimals, like Shopee)
      defaultValue: 0,
      comment: "Jumlah unit yang tersedia (contoh: 5 pack)",
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
