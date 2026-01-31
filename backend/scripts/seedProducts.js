const { sequelize } = require("../src/config/database");
const Product = require("../src/models/product.model");
const Category = require("../src/models/category.model");
const { v4: uuidv4 } = require("uuid");

// Define categories untuk produk
const categoryMapping = {
  // Seafood
  "Udang sedang 1": "Seafood",
  "Udang sedang 2": "Seafood",
  "Udang besar": "Seafood",
  "Udang kecil": "Seafood",
  Cumi: "Seafood",
  "Ikan Kembung": "Seafood",
  Bawal: "Seafood",
  Tongkol: "Seafood",

  // Daging & Ayam
  "Ayam filet": "Daging & Ayam",
  "Ceker Ayam": "Daging & Ayam",
  "Sayap Ayam": "Daging & Ayam",
  "Ayam potong (all part)": "Daging & Ayam",
  Ayam: "Daging & Ayam",

  // Telur
  "telor puyuh": "Telur",
  "Telur Ayam Kampung": "Telur",
  "Telur Ayam Ras": "Telur",

  // Bumbu Dapur
  Sereh: "Bumbu Dapur",
  Jahe: "Bumbu Dapur",
  Cikur: "Bumbu Dapur",
  Lengkuas: "Bumbu Dapur",
  Koneng: "Bumbu Dapur",
  Salam: "Bumbu Dapur",
  "Daun jeruk": "Bumbu Dapur",
  "Bawang putih": "Bumbu Dapur",

  // Sayuran
  Tomat: "Sayuran",
  Kentang: "Sayuran",
  Pete: "Sayuran",
  Cengek: "Sayuran",
  "Cabe Kriting": "Sayuran",
  Suraung: "Sayuran",
  Sledri: "Sayuran",
  Wortel: "Sayuran",
  "Daun bawang": "Sayuran",
  "Jagung Manis": "Sayuran",
  "Jagung Pipilan": "Sayuran",
  "Kentang Lokal Dieng": "Sayuran",
  "Ketela Pohon": "Sayuran",
  "Kol/Kubis": "Sayuran",

  // Buah-buahan
  Apel: "Buah-buahan",
  "Lemon premium": "Buah-buahan",
  "Lemon biasa": "Buah-buahan",
  Salak: "Buah-buahan",
  Mangis: "Buah-buahan",
  Nanas: "Buah-buahan",
  "Jeruk 1 Kg": "Buah-buahan",
  "Pisang 1 Kg": "Buah-buahan",

  // Kacang-kacangan
  "Kacang Hijau": "Kacang-kacangan",
  "Kacang Kedelai": "Kacang-kacangan",
  "Kacang Tanah": "Kacang-kacangan",

  // Bahan Pokok
  "Mie Instan": "Bahan Pokok",
  "Minyak Goreng (Curah)": "Bahan Pokok",
  "Minyak Goreng (Kemasan)": "Bahan Pokok",
  "LPG 3KG": "Bahan Pokok",
  "Susu Kental Manis": "Bahan Pokok",
  "Tepung Terigu Cakra Kembar": "Bahan Pokok",

  // Olahan Kedelai
  "Tempe 1 Kg": "Olahan Kedelai",
  "Tahu Mentah 1 Kg": "Olahan Kedelai",
};

// Products data
const productsData = [
  { name: "Udang sedang 1", unit: "kg", price: 65000 },
  { name: "Udang sedang 2", unit: "kg", price: 70000 },
  { name: "Udang besar", unit: "kg", price: 85000 },
  { name: "Udang kecil", unit: "kg", price: 40000 },
  { name: "Cumi", unit: "kg", price: 65000 },
  { name: "Ikan Kembung", unit: "kg", price: 30000 },
  { name: "Ayam filet", unit: "kg", price: 43000 },
  { name: "Ceker Ayam", unit: "kg", price: 15000 },
  { name: "Sayap Ayam", unit: "kg", price: 35000 },
  { name: "Ayam potong (all part)", unit: "kg", price: 35000 },
  { name: "telor puyuh", unit: "kg", price: 40000 },
  { name: "Ayam", unit: "kg", price: 27000 },
  { name: "Sereh", unit: "kg", price: 12000 },
  { name: "Jahe", unit: "kg", price: 32000 },
  { name: "Bawal", unit: "kg", price: 35000 },
  { name: "Cikur", unit: "kg", price: 50000 },
  { name: "Lengkuas", unit: "kg", price: 20000 },
  { name: "Koneng", unit: "kg", price: 18000 },
  { name: "Tomat", unit: "kg", price: 10000 },
  { name: "Salam", unit: "iket", price: 500 },
  { name: "Daun jeruk", unit: "pak", price: 2000 },
  { name: "Kentang", unit: "kg", price: 18000 },
  { name: "Pete", unit: "iket", price: 30000 },
  { name: "Apel", unit: "kg", price: 30000 },
  { name: "Lemon premium", unit: "kg", price: 32000 },
  { name: "Lemon biasa", unit: "kg", price: 20000 },
  { name: "Salak", unit: "kg", price: 10000 },
  { name: "Mangis", unit: "kg", price: 17000 },
  { name: "Nanas", unit: "pcs", price: 12000 },
  { name: "Tongkol", unit: "kg", price: 40000 },
  { name: "Cengek", unit: "kg", price: 75000 },
  { name: "Bawang putih", unit: "kg", price: 40000 },
  { name: "Cabe Kriting", unit: "kg", price: 72000 },
  { name: "Suraung", unit: "iket", price: 15000 },
  { name: "Sledri", unit: "kg", price: 20000 },
  { name: "Wortel", unit: "kg", price: 14000 },
  { name: "Daun bawang", unit: "kg", price: 12000 },
  { name: "Jagung Manis", unit: "kg", price: 10000 },
  { name: "Jagung Pipilan", unit: "kg", price: 12000 },
  { name: "Jeruk 1 Kg", unit: "kg", price: 24000 },
  { name: "Kacang Hijau", unit: "kg", price: 24000 },
  { name: "Kacang Kedelai", unit: "kg", price: 14000 },
  { name: "Kacang Tanah", unit: "kg", price: 28000 },
  { name: "Kentang Lokal Dieng", unit: "kg", price: 17000 },
  { name: "Ketela Pohon", unit: "pcs", price: 5000 },
  { name: "Kol/Kubis", unit: "kg", price: 7000 },
  { name: "Mie Instan", unit: "pcs", price: 3000 },
  { name: "Minyak Goreng (Curah)", unit: "kg", price: 18000 },
  { name: "Minyak Goreng (Kemasan)", unit: "kg", price: 20000 },
  { name: "LPG 3KG", unit: "pcs", price: 22000 },
  { name: "Pisang 1 Kg", unit: "kg", price: 24000 },
  { name: "Susu Kental Manis", unit: "pcs", price: 12000 },
  { name: "Telur Ayam Kampung", unit: "pcs", price: 3000 },
  { name: "Telur Ayam Ras", unit: "kg", price: 29000 },
  { name: "Tempe 1 Kg", unit: "kg", price: 12000 },
  { name: "Tahu Mentah 1 Kg", unit: "kg", price: 8000 },
  { name: "Tepung Terigu Cakra Kembar", unit: "kg", price: 13000 },
];

// Categories to create
const categoriesData = [
  {
    category_name: "Seafood",
    description: "Berbagai jenis ikan, udang, cumi dan hasil laut lainnya",
  },
  {
    category_name: "Daging & Ayam",
    description: "Daging ayam segar dan berbagai bagiannya",
  },
  { category_name: "Telur", description: "Berbagai jenis telur segar" },
  {
    category_name: "Bumbu Dapur",
    description: "Rempah dan bumbu dapur tradisional",
  },
  { category_name: "Sayuran", description: "Sayuran segar berkualitas" },
  { category_name: "Buah-buahan", description: "Buah-buahan segar pilihan" },
  {
    category_name: "Kacang-kacangan",
    description: "Berbagai jenis kacang-kacangan",
  },
  {
    category_name: "Bahan Pokok",
    description: "Kebutuhan pokok sehari-hari",
  },
  {
    category_name: "Olahan Kedelai",
    description: "Produk olahan dari kedelai seperti tempe dan tahu",
  },
];

async function seedProducts() {
  try {
    console.log("🔄 Starting product seeder...\n");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // Step 1: Create categories first
    console.log("📁 Creating categories...");
    const categoryMap = {};

    for (const cat of categoriesData) {
      const [category, created] = await Category.findOrCreate({
        where: { category_name: cat.category_name },
        defaults: {
          id: uuidv4(),
          category_name: cat.category_name,
          description: cat.description,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      categoryMap[cat.category_name] = category.id;

      if (created) {
        console.log(`   ✅ Created category: ${cat.category_name}`);
      } else {
        console.log(`   ⏭️  Category exists: ${cat.category_name}`);
      }
    }
    console.log("");

    // Step 2: Create products
    console.log("🛒 Creating products...");
    let createdCount = 0;
    let skippedCount = 0;

    for (const prod of productsData) {
      const categoryName = categoryMapping[prod.name];
      const categoryId = categoryMap[categoryName] || null;

      // Check if product already exists
      const existingProduct = await Product.findOne({
        where: { name: prod.name },
      });

      if (existingProduct) {
        console.log(`   ⏭️  Product exists: ${prod.name}`);
        skippedCount++;
        continue;
      }

      // Determine shelf life based on category
      let shelfLifeDays = 7; // default
      if (categoryName === "Seafood") shelfLifeDays = 3;
      else if (categoryName === "Daging & Ayam") shelfLifeDays = 5;
      else if (categoryName === "Telur") shelfLifeDays = 14;
      else if (categoryName === "Bumbu Dapur") shelfLifeDays = 14;
      else if (categoryName === "Sayuran") shelfLifeDays = 7;
      else if (categoryName === "Buah-buahan") shelfLifeDays = 10;
      else if (categoryName === "Kacang-kacangan") shelfLifeDays = 30;
      else if (categoryName === "Bahan Pokok") shelfLifeDays = 180;
      else if (categoryName === "Olahan Kedelai") shelfLifeDays = 3;

      await Product.create({
        id: uuidv4(),
        name: prod.name,
        product_type: "online",
        category_id: categoryId,
        description: `${prod.name} segar berkualitas, dijual per ${prod.unit}`,
        selling_price: prod.price,
        quantity_info: `1 ${prod.unit}`,
        shelf_life_days: shelfLifeDays,
        total_stock: Math.floor(Math.random() * 100) + 10, // Random stock 10-110
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log(
        `   ✅ Created: ${prod.name} - Rp${prod.price.toLocaleString("id-ID")}/${prod.unit}`
      );
      createdCount++;
    }

    console.log("\n========================================");
    console.log("🎉 Seeding completed!");
    console.log(`   📁 Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   🛒 Products created: ${createdCount}`);
    console.log(`   ⏭️  Products skipped: ${skippedCount}`);
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedProducts();
