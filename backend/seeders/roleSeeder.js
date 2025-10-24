const { Role, User } = require("../src/models");
const bcrypt = require("bcryptjs");

const createRoles = async () => {
  try {
    console.log("🚀 Creating default roles...");

    const roles = [
      {
        role_name: "customer",
        description:
          "Browse products, place orders, send details via WhatsApp, make payment, and track delivery",
      },
      {
        role_name: "super_admin",
        description:
          "Full system access: manage users, products, transactions, and configurations",
      },
      {
        role_name: "super_whatsapp_admin",
        description:
          "Create, view, and update (status only) online/offline transactions; cancel orders; manage customer data",
      },
      {
        role_name: "super_cashier",
        description:
          "Create, view, and update (status only) online/offline transactions; cancel orders; manage customer data",
      },
      {
        role_name: "whatsapp_admin",
        description:
          "Create and view only online transactions; update order statuses",
      },
      {
        role_name: "cashier",
        description:
          "Create and view only offline transactions; update order statuses",
      },
      {
        role_name: "finance_admin",
        description: "View inventory, procurement, and transaction reports",
      },
      {
        role_name: "inventory_admin",
        description:
          "Create, Update (until the procurement is proposed) procurement records",
      },
      {
        role_name: "super_inventory_admin",
        description: "CRUD Procurement, CRUD Product, Approval Procurement",
      },
    ];

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { role_name: roleData.role_name },
        defaults: {
          ...roleData,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (created) {
        console.log(`✅ Created role: ${role.role_name}`);
      } else {
        console.log(`⚠️ Role already exists: ${role.role_name}`);
      }
    }

    console.log("✅ All roles created successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error creating roles:", error);
    return false;
  }
};

const createSuperAdmin = async () => {
  try {
    console.log("🚀 Creating super admin user...");

    // Get super_admin role
    const superAdminRole = await Role.findOne({
      where: { role_name: "super_admin" },
    });

    if (!superAdminRole) {
      console.error("❌ Super admin role not found!");
      return false;
    }

    // Create super admin user
    const [superAdmin, created] = await User.findOrCreate({
      where: { phone_number: "6282111111111" }, // Default super admin phone
      defaults: {
        phone_number: "6282111111111",
        full_name: "Super Administrator",
        role_id: superAdminRole.id,
        password_hash: "admin123", // Will be hashed by the hook
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (created) {
      console.log("✅ Super admin created successfully!");
      console.log("📱 Phone: 6282111111111 (or 082111111111)");
      console.log("🔑 Password: admin123");
      console.log("⚠️ PLEASE CHANGE THE DEFAULT PASSWORD IMMEDIATELY!");
    } else {
      console.log("⚠️ Super admin already exists");
    }

    return true;
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
    return false;
  }
};

const seedRolesAndAdmin = async () => {
  try {
    console.log("🌱 Starting roles and admin seeding...");

    const rolesCreated = await createRoles();
    if (!rolesCreated) {
      throw new Error("Failed to create roles");
    }

    const adminCreated = await createSuperAdmin();
    if (!adminCreated) {
      throw new Error("Failed to create super admin");
    }

    console.log("🎉 Roles and admin seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

module.exports = {
  createRoles,
  createSuperAdmin,
  seedRolesAndAdmin,
};
