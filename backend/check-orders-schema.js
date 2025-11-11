const { sequelize } = require("./src/config/database");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const [results] = await sequelize.query("DESCRIBE orders");

    console.log("\n=== ORDERS TABLE COLUMNS ===\n");
    results.forEach((r) => {
      console.log(
        `${r.Field.padEnd(25)} | ${r.Type.padEnd(20)} | ${
          r.Null === "YES" ? "NULL" : "NOT NULL"
        }`
      );
    });

    console.log("\n=== Checking for address-related columns ===\n");
    const addressCols = results.filter(
      (r) =>
        r.Field.includes("address") ||
        r.Field.includes("shipping") ||
        r.Field.includes("notes")
    );

    addressCols.forEach((r) => {
      console.log(`✓ ${r.Field} exists in DB`);
    });

    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
})();
