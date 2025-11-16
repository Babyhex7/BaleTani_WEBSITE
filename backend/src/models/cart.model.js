const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: "carts",
    timestamps: false,
    paranoid: false,
    underscored: true,
    // FIX: Tambah indexes untuk performance (cart per customer, cart per product)
    indexes: [
      {
        name: "idx_cart_customer",
        fields: ["customer_id"],
        comment: "Index untuk ambil semua cart items per customer",
      },
      {
        name: "idx_cart_product",
        fields: ["product_id"],
        comment: "Index untuk cek product ada di cart siapa aja",
      },
      {
        name: "idx_cart_customer_product",
        fields: ["customer_id", "product_id"],
        unique: true,
        comment: "Unique index untuk prevent duplicate product dalam cart",
      },
    ],
  }
);

module.exports = Cart;
