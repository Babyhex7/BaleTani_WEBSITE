const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
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
    tableName: "users", // Still use users table
    timestamps: false,
    paranoid: false,
    underscored: true,
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password_hash) {
          const salt = await bcrypt.genSalt(10);
          admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
        }
        // Normalize phone number
        if (admin.phone_number) {
          admin.phone_number = normalizePhoneNumber(admin.phone_number);
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed("password_hash")) {
          const salt = await bcrypt.genSalt(10);
          admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
        }
        // Normalize phone number
        if (admin.changed("phone_number")) {
          admin.phone_number = normalizePhoneNumber(admin.phone_number);
        }
      }
    }
  }
);

// Function to normalize phone number
function normalizePhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("0")) {
    // Convert 08xx to 628xx
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    // Convert 8xx to 628xx
    cleaned = "62" + cleaned;
  } else if (!cleaned.startsWith("62")) {
    // Add 62 if not present
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

// Instance method to check password
Admin.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = Admin;
