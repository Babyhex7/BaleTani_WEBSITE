const { User, Category, Product } = require("../src/models");
const bcrypt = require("bcryptjs");

/**
 * Seeder untuk data admin testing
 * Membuat user admin, staff, customer dan beberapa produk/kategori
 */

const seedAdminData = async () => {
  try {
    console.log("🌱 Starting admin data seeding...");

    // 1. Create test users
    console.log("Creating test users...");

    const users = [
      {
        fullName: "Ahmad Admin",
        email: "admin@baletani.com",
        password: "admin123", // Let model handle hashing
        role: "admin",
      },
      {
        fullName: "Siti Staff",
        email: "staff@baletani.com",
        password: "staff123", // Let model handle hashing
        role: "staff",
      },
      {
        fullName: "Budi Customer",
        email: "customer@baletani.com",
        password: "customer123", // Let model handle hashing
        role: "customer",
      },
      {
        fullName: "Rina Farmer",
        email: "rina@customer.com",
        password: "customer123", // Let model handle hashing
        role: "customer",
      },
      {
        fullName: "Joko Petani",
        email: "joko@customer.com",
        password: "customer123", // Let model handle hashing
        role: "customer",
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    // 2. Create categories
    console.log("\nCreating categories...");

    const categories = [
      { name: "Benih", description: "Benih tanaman berkualitas tinggi" },
      { name: "Pupuk", description: "Pupuk organik dan anorganik" },
      { name: "Pestisida", description: "Pestisida dan herbisida" },
      { name: "Alat Pertanian", description: "Peralatan dan mesin pertanian" },
      { name: "Irigasi", description: "Sistem irigasi dan penyiraman" },
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({
        where: { name: categoryData.name },
      });
      if (!existingCategory) {
        const category = await Category.create(categoryData);
        createdCategories.push(category);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        createdCategories.push(existingCategory);
        console.log(`⚠️  Category already exists: ${categoryData.name}`);
      }
    }

    // 3. Create products
    console.log("\nCreating products...");

    const products = [
      {
        name: "Benih Padi Unggul IR64",
        description:
          "Benih padi varietas unggul dengan hasil panen tinggi dan tahan terhadap hama",
        base_price: 15000,
        stock: 150,
        category_id: createdCategories[0].id, // Benih
        image_url: null,
      },
      {
        name: "Benih Jagung Hibrida",
        description:
          "Benih jagung hibrida dengan produktivitas tinggi dan adaptasi luas",
        base_price: 45000,
        stock: 5, // Low stock untuk testing
        category_id: createdCategories[0].id, // Benih
        image_url: null,
      },
      {
        name: "Pupuk NPK 16-16-16",
        description:
          "Pupuk majemuk untuk pertumbuhan optimal tanaman dengan kandungan NPK seimbang",
        base_price: 85000,
        stock: 75,
        category_id: createdCategories[1].id, // Pupuk
        image_url: null,
      },
      {
        name: "Pupuk Organik Kompos",
        description: "Pupuk organik dari bahan kompos berkualitas tinggi",
        base_price: 25000,
        stock: 120,
        category_id: createdCategories[1].id, // Pupuk
        image_url: null,
      },
      {
        name: "Pestisida Organik Neem",
        description:
          "Pestisida alami dari ekstrak neem untuk pengendalian hama ramah lingkungan",
        base_price: 125000,
        stock: 25,
        category_id: createdCategories[2].id, // Pestisida
        image_url: null,
      },
      {
        name: "Herbisida Sistemik",
        description: "Herbisida sistemik untuk pengendalian gulma efektif",
        base_price: 95000,
        stock: 0, // Out of stock untuk testing
        category_id: createdCategories[2].id, // Pestisida
        image_url: null,
      },
      {
        name: "Alat Semprot Manual",
        description:
          "Alat semprot manual berkualitas tinggi untuk aplikasi pestisida dan pupuk cair",
        base_price: 350000,
        stock: 12,
        category_id: createdCategories[3].id, // Alat Pertanian
        image_url: null,
      },
      {
        name: "Cangkul Baja",
        description:
          "Cangkul dengan mata baja berkualitas tinggi dan gagang kayu",
        base_price: 75000,
        stock: 8, // Low stock
        category_id: createdCategories[3].id, // Alat Pertanian
        image_url: null,
      },
      {
        name: "Selang Irigasi Tetes",
        description:
          "Selang irigasi tetes untuk sistem penyiraman efisien dan hemat air",
        base_price: 180000,
        stock: 45,
        category_id: createdCategories[4].id, // Irigasi
        image_url: null,
      },
      {
        name: "Sprinkler Otomatis",
        description:
          "Sprinkler otomatis dengan timer untuk penyiraman terjadwal",
        base_price: 450000,
        stock: 3, // Low stock
        category_id: createdCategories[4].id, // Irigasi
        image_url: null,
      },
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        where: { name: productData.name },
      });
      if (!existingProduct) {
        await Product.create(productData);
        console.log(
          `✅ Created product: ${productData.name} (Stock: ${productData.stock})`
        );
      } else {
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log("\n🎉 Admin data seeding completed successfully!");
    console.log("\n📝 Test Accounts Created:");
    console.log("Admin: admin@baletani.com / admin123");
    console.log("Staff: staff@baletani.com / staff123");
    console.log("Customer: customer@baletani.com / customer123");
    console.log("\n🚀 You can now test the admin interface!");
  } catch (error) {
    console.error("❌ Error seeding admin data:", error);
    throw error;
  }
};

module.exports = { seedAdminData };

// Run seeder if this file is executed directly
if (require.main === module) {
  const { sequelize } = require("../src/config/database");

  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connected successfully.");
      return seedAdminData();
    })
    .then(() => {
      console.log("Seeding completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
