const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PaymentDetail = sequelize.define(
  "PaymentDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    payment_method: {
      type: DataTypes.ENUM("bank_transfer", "cod", "e_wallet"),
      defaultValue: "bank_transfer",
    },
    bank_name: {
      type: DataTypes.ENUM("BRI", "BCA", "MANDIRI"),
      defaultValue: null,
      allowNull: true,
    },
    virtual_account: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Generated VA number",
    },
    account_name: {
      type: DataTypes.STRING(100),
      defaultValue: "BaleTani Fresh Market",
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "expired"),
      defaultValue: "pending",
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_proof: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Upload bukti transfer",
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "VA expiry time (24 hours from order)",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payment_details",
    timestamps: false,
    underscored: true,
  }
);

/**
 * Generate Virtual Account Number
 * Format: [BANK_CODE][TIMESTAMP][RANDOM]
 * Contoh: BRI20251106123456789
 */
PaymentDetail.generateVA = function (bankName) {
  const bankCodes = {
    BRI: "002",
    BCA: "014",
    MANDIRI: "008",
  };

  const bankCode = bankCodes[bankName] || "000";
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${bankCode}${timestamp}${random}`;
};

/**
 * Calculate VA expiry time (24 hours from now)
 */
PaymentDetail.getExpiryTime = function () {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
};

module.exports = PaymentDetail;
