const { Role } = require("../src/models");

const updateRoleDescriptions = async () => {
  try {
    console.log("🚀 Updating role descriptions...");

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
      const role = await Role.findOne({
        where: { role_name: roleData.role_name },
      });

      if (role) {
        await role.update({
          description: roleData.description,
          updated_at: new Date(),
        });
        console.log(`✅ Updated role: ${roleData.role_name}`);
      } else {
        console.log(`⚠️ Role not found: ${roleData.role_name}`);
      }
    }

    console.log("✅ All role descriptions updated successfully!");
  } catch (error) {
    console.error("❌ Error updating role descriptions:", error);
  }
};

// Main execution
const main = async () => {
  try {
    const { sequelize } = require("../src/config/database");

    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await updateRoleDescriptions();

    console.log("🎉 Update completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
};

main();
