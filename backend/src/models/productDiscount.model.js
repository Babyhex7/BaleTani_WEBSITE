const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductDiscount = sequelize.define(
  "ProductDiscount",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    discount_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Harga asli produk saat di-assign ke diskon"
    },
    discounted_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Harga setelah diskon"
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
    },
  {
    tableName: "product_discounts",
    timestamps: false,
    paranoid: false,
    underscored: true
  }
);

module.exports = ProductDiscount;
