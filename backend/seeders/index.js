/**
 * Seeder untuk kategori dan produk
 * Menambahkan data produk asli BaleTani ke database
 */

const { Category, Product } = require("../src/models");
const { seedCategories, seedProducts } = require("./productData");

const seedDatabase = async () => {
  try {
    console.log("🌱 Mulai seeding database...");

    // Hapus data lama jika ada
    await Product.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });

    console.log("🗑️ Data lama berhasil dihapus");

    // Tambahkan kategori
    console.log("📂 Menambahkan kategori...");
    const categories = await Category.bulkCreate(seedCategories, {
      returning: true,
      validate: true,
    });
    console.log(`✅ ${categories.length} kategori berhasil ditambahkan`);

    // Tambahkan produk
    console.log("🛒 Menambahkan produk...");
    const products = await Product.bulkCreate(seedProducts, {
      returning: true,
      validate: true,
    });
    console.log(`✅ ${products.length} produk berhasil ditambahkan`);

    console.log("🎉 Seeding database selesai!");
    console.log("\n📊 Ringkasan data:");
    console.log(`- Kategori: ${categories.length}`);
    console.log(`- Produk: ${products.length}`);

    // Tampilkan contoh data per kategori
    console.log("\n📋 Produk per kategori:");
    for (const category of categories) {
      const productCount = await Product.count({
        where: { categoryId: category.id },
      });
      console.log(`  - ${category.name}: ${productCount} produk`);
    }

    return { categories, products };
  } catch (error) {
    console.error("❌ Error saat seeding database:", error);
    throw error;
  }
};

// Fungsi untuk menjalankan seeder secara manual
const runSeeder = async () => {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder gagal:", error);
    process.exit(1);
  }
};

// Jalankan seeder jika file ini dijalankan langsung
if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase };
