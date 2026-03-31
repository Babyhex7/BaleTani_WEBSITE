/**
 * PROCUREMENT SEEDER SCRIPT
 * Membuat data pengadaan (procurement) untuk testing
 */

const { sequelize } = require("../src/config/database");
const { Procurement, ProcurementItem, Product, Admin, Role } = require("../src/models");

// Data supplier dan procurement
const suppliersData = [
  { name: "CV Mitra Tani Sejahtera", products: [0, 2, 4, 6] },
  { name: "UD Seger Slamet", products: [1, 3, 5, 7] },
  { name: "PT Agro Indonesia", products: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { name: "Koperasi Tani Raya", products: [2, 4, 6, 8] },
  { name: "CV Berkah Bumi Subur", products: [1, 3, 5, 7, 8] },
];

// Fungsi untuk generate procurement number
const generateProcurementNumber = (index, date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const seq = String(index + 1).padStart(4, "0");
  return `PROC-${year}${month}${day}-${seq}`;
};

// Fungsi untuk generate tanggal random di masa lalu (1-60 hari lalu)
const getRandomPastDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 60) + 1;
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Fungsi untuk generate tanggal expiry (30-90 hari dari tanggal pengadaan)
const getExpiryDate = (procurementDate) => {
  const expiry = new Date(procurementDate);
  const expiryDays = Math.floor(Math.random() * 60) + 30; // 30-90 hari
  expiry.setDate(expiry.getDate() + expiryDays);
  return expiry;
};

// Fungsi untuk generate harga beli yang realistis
const getPurchasePrice = (sellingPrice) => {
  // Harga beli typically 60-75% dari harga jual
  const margin = 0.25 + Math.random() * 0.15; // 25-40% margin
  return Math.round(sellingPrice / (1 + margin) / 100) * 100;
};

const seedProcurements = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log("🌱 Starting Procurement Seeding...");

    // Get all products
    const products = await Product.findAll({
      attributes: ["id", "name", "selling_price", "total_stock"],
      limit: 10,
    });

    if (products.length === 0) {
      console.log("❌ No products found. Run seedProducts.js first!");
      process.exit(1);
    }

    console.log(`✓ Found ${products.length} products`);

    // Get admin user (creator of procurements)
    const admin = await Admin.findOne({
      include: [
        {
          model: Role,
          as: "role",
          where: { role_name: "super_admin" },
        },
      ],
    });

    if (!admin) {
      console.log("❌ No super_admin found. Run admin seeder first!");
      process.exit(1);
    }

    console.log(`✓ Using admin: ${admin.full_name}`);

    // Create procurements
    let procurementCount = 0;
    let itemCount = 0;

    for (let i = 0; i < suppliersData.length; i++) {
      const supplier = suppliersData[i];
      
      // Create 2-3 procurements per supplier
      const procCount = Math.floor(Math.random() * 2) + 2;

      for (let j = 0; j < procCount; j++) {
        const procurementDate = getRandomPastDate();
        const procurementNumber = generateProcurementNumber(
          i * 10 + j,
          procurementDate
        );

        // Select random products for this procurement (3-6 items)
        const itemCount_supplier = Math.floor(Math.random() * 4) + 3;
        const selectedProducts = [];
        const usedIndices = new Set();

        while (
          selectedProducts.length < itemCount_supplier &&
          selectedProducts.length < products.length
        ) {
          const randomIdx = Math.floor(Math.random() * products.length);
          if (!usedIndices.has(randomIdx)) {
            selectedProducts.push(products[randomIdx]);
            usedIndices.add(randomIdx);
          }
        }

        // Calculate total amount
        let totalAmount = 0;
        const procurementItems = [];

        for (const product of selectedProducts) {
          // Quantity: varied quantities (10-100 dengan decimal support)
          const quantity = parseFloat(
            (Math.floor(Math.random() * 90) + 10).toFixed(2)
          );

          // Purchase price
          const purchasePrice = getPurchasePrice(product.selling_price);

          // Subtotal
          const subtotal = parseFloat((quantity * purchasePrice).toFixed(2));
          totalAmount += subtotal;

          procurementItems.push({
            product_id: product.id,
            quantity,
            purchase_price_per_unit: purchasePrice,
            subtotal,
            expiry_date: getExpiryDate(procurementDate),
          });
        }

        // Create procurement
        const procurement = await Procurement.create(
          {
            procurement_number: procurementNumber,
            supplier_name: supplier.name,
            procurement_date: procurementDate,
            total_amount: parseFloat(totalAmount.toFixed(2)),
            status: Math.random() > 0.3 ? "approved" : "pending",
            created_by: admin.id,
            approved_by: Math.random() > 0.3 ? admin.id : null,
            approved_at: Math.random() > 0.3 ? new Date() : null,
            notes: `Pengadaan dari ${supplier.name} - ${selectedProducts
              .map((p) => p.name)
              .join(", ")}`,
          },
          { transaction }
        );

        // Create procurement items
        for (const item of procurementItems) {
          await ProcurementItem.create(
            {
              procurement_id: procurement.id,
              ...item,
            },
            { transaction }
          );
          itemCount++;
        }

        procurementCount++;
        console.log(
          `  ✓ Created: ${procurementNumber} (${procurementItems.length} items)`
        );
      }
    }

    await transaction.commit();

    console.log("\n✅ Procurement Seeding Completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Procurements created: ${procurementCount}`);
    console.log(`   - Procurement items: ${itemCount}`);
    console.log(`   - Average items per procurement: ${(itemCount / procurementCount).toFixed(1)}`);

    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error seeding procurements:", error);
    process.exit(1);
  }
};

// Run seeder
seedProcurements();
