const { Op } = require("sequelize");
const { Product, StockHistory } = require("../src/models");

async function run() {
  try {
    console.log("🚀 Starting stock_history backfill...");

    const products = await Product.findAll({ attributes: ["id", "name", "total_stock"] });
    console.log(`Found ${products.length} products`);

    let createdCount = 0;

    for (const p of products) {
      const productId = p.id;
      // Skip if already backfilled (by idempotency_key or reference_type)
      const exists = await StockHistory.findOne({
        where: {
          product_id: productId,
          [Op.or]: [
            { idempotency_key: `backfill:init:${productId}` },
            { reference_type: "init" },
          ],
        },
        attributes: ["id"],
      });

      if (exists) {
        continue;
      }

      const t = await Product.sequelize.transaction();
      try {
        const currentStock = parseFloat(p.total_stock || 0);

        await StockHistory.create(
          {
            product_id: productId,
            change_type: "manual",
            quantity_change: currentStock,
            previous_qty: 0,
            new_qty: currentStock,
            actor_id: null,
            reason: "Backfill initial stock",
            reference_id: null,
            reference_type: "init",
            metadata: null,
            idempotency_key: `backfill:init:${productId}`,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );

        await t.commit();
        createdCount++;
        console.log(`Backfilled product ${productId} (${p.name}) - stock ${currentStock}`);
      } catch (err) {
        await t.rollback();
        console.error(`Failed to backfill product ${productId}:`, err.message);
      }
    }

    console.log(`✅ Backfill complete. Created ${createdCount} stock_history entries`);
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err.message);
    process.exit(1);
  }
}

run();
