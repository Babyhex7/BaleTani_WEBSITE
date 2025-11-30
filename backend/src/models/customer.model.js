const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");
const { normalizePhoneNumber } = require("../utils/phoneHelper");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  },
  {
    tableName: "customers",
    timestamps: false, // We handle timestamps manually
    paranoid: false, // We handle soft deletes manually
    underscored: true,
    hooks: {
      beforeCreate: async (customer) => {
        // Normalize phone number
        if (customer.phone_number) {
          customer.phone_number = normalizePhoneNumber(customer.phone_number);
        }

        // Hash password if it's being set
        if (customer.password_hash) {
          const salt = await bcrypt.genSalt(10);
          customer.password_hash = await bcrypt.hash(
            customer.password_hash,
            salt
          );
        }
      },
      beforeUpdate: async (customer) => {
        // Normalize phone number
        if (customer.changed("phone_number")) {
          customer.phone_number = normalizePhoneNumber(customer.phone_number);
        }

        // Hash password if it's being changed
        if (customer.changed("password_hash")) {
          const salt = await bcrypt.genSalt(10);
          customer.password_hash = await bcrypt.hash(
            customer.password_hash,
            salt
          );
        }
      },
    },
  }
);

// Instance method to compare password
Customer.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Customer;
