/**
 * Category Seeder
 * Seeds categories for BaleTani products
 */

const { Category } = require("../src/models");

const categorySeeder = async () => {
  try {
    console.log("🌱 Seeding categories...");

    const categories = [
      {
        category_name: "Sayuran Segar",
        description: "Berbagai jenis sayuran segar langsung dari petani lokal",
      },
      {
        category_name: "Buah-buahan",
        description:
          "Buah segar berkualitas tinggi dengan rasa yang manis dan alami",
      },
      {
        category_name: "Benih Tanaman",
        description:
          "Benih tanaman berkualitas unggul untuk hasil panen maksimal",
      },
      {
        category_name: "Pupuk Organik",
        description: "Pupuk organik ramah lingkungan untuk tanaman lebih sehat",
      },
      {
        category_name: "Bumbu Dapur",
        description: "Bumbu dan rempah segar untuk masakan lebih nikmat",
      },
      {
        category_name: "Hasil Olahan",
        description: "Produk olahan dari hasil pertanian berkualitas",
      },
      {
        category_name: "Alat Pertanian",
        description: "Peralatan dan perlengkapan untuk kebutuhan pertanian",
      },
      {
        category_name: "Tanaman Hias",
        description: "Berbagai tanaman hias untuk mempercantik rumah Anda",
      },
    ];

    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({
        where: { category_name: categoryData.category_name },
      });

      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.category_name}`);
      } else {
        console.log(
          `⚠️  Category already exists: ${categoryData.category_name}`
        );
      }
    }

    console.log("✅ Category seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

module.exports = categorySeeder;

// Run if called directly
if (require.main === module) {
  const { sequelize } = require("../src/config/database");

  categorySeeder()
    .then(() => {
      console.log("🎉 Category seeder finished successfully");
      sequelize.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Category seeder failed:", error);
      sequelize.close();
      process.exit(1);
    });
}
