/**
 * Database Helper for Cypress
 * Provides database seeding and reset functionality
 */

const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.test") });

module.exports = (on, config) => {
  /**
   * Database connection configuration
   */
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "baletani_db_test",
    port: process.env.DB_PORT || 3306,
  };

  /**
   * Task: Reset Database
   * Truncates all tables in correct order (respecting foreign keys)
   */
  on("task", {
    async "db:reset"() {
      let connection;

      try {
        connection = await mysql.createConnection(dbConfig);

        console.log("🗄️ Resetting database...");

        // Disable foreign key checks
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");

        // Truncate tables in order (child tables first)
        const tablesToTruncate = [
          "order_status_history",
          "order_items",
          "payment_details",
          "orders",
          "carts",
          "stock_movements",
          "procurement_items",
          "procurements",
          "product_images",
          "discount_products",
          "products",
          "discounts",
          "categories",
          "customers",
          "contact_messages",
          "faqs",
          "soft_delete_logs",
        ];

        for (const table of tablesToTruncate) {
          try {
            await connection.query(`TRUNCATE TABLE ${table}`);
            console.log(`  ✅ Truncated ${table}`);
          } catch (err) {
            // Table might not exist, skip
            console.log(`  ⚠️ Skipped ${table} (${err.message})`);
          }
        }

        // Re-enable foreign key checks
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("✅ Database reset complete");
        return null;
      } catch (error) {
        console.error("❌ Database reset failed:", error.message);
        throw error;
      } finally {
        if (connection) {
          await connection.end();
        }
      }
    },

    /**
     * Task: Seed Database
     * Seeds database with test data based on fixture type
     */
    async "db:seed"(fixture) {
      let connection;

      try {
        connection = await mysql.createConnection(dbConfig);

        console.log(`🌱 Seeding database with ${fixture || "default"} data...`);

        if (!fixture || fixture === "all" || fixture === "default") {
          // Seed default test data
          await seedCategories(connection);
          await seedProducts(connection);
          await seedCustomers(connection);
          await seedDiscounts(connection);
        } else if (fixture === "categories") {
          await seedCategories(connection);
        } else if (fixture === "products") {
          await seedCategories(connection);
          await seedProducts(connection);
        } else if (fixture === "customers") {
          await seedCustomers(connection);
        } else if (fixture === "discounts") {
          await seedDiscounts(connection);
        }

        console.log("✅ Database seeded successfully");
        return null;
      } catch (error) {
        console.error("❌ Database seed failed:", error.message);
        throw error;
      } finally {
        if (connection) {
          await connection.end();
        }
      }
    },
  });

  return config;
};

/**
 * Seed Categories
 */
async function seedCategories(connection) {
  const categories = [
    {
      id: "cat-001",
      name: "Beras & Serealia",
      description: "Beras dan biji-bijian berkualitas",
      image_url: "/uploads/categories/beras.jpg",
      is_active: true,
    },
    {
      id: "cat-002",
      name: "Sayuran",
      description: "Sayuran segar dari petani lokal",
      image_url: "/uploads/categories/sayuran.jpg",
      is_active: true,
    },
    {
      id: "cat-003",
      name: "Buah-buahan",
      description: "Buah segar pilihan",
      image_url: "/uploads/categories/buah.jpg",
      is_active: true,
    },
    {
      id: "cat-004",
      name: "Telur & Unggas",
      description: "Telur dan produk unggas segar",
      image_url: "/uploads/categories/telur.jpg",
      is_active: true,
    },
    {
      id: "cat-005",
      name: "Bumbu Dapur",
      description: "Bumbu dan rempah pilihan",
      image_url: "/uploads/categories/bumbu.jpg",
      is_active: true,
    },
  ];

  for (const category of categories) {
    await connection.query(
      "INSERT INTO categories (id, name, description, image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      [
        category.id,
        category.name,
        category.description,
        category.image_url,
        category.is_active,
      ]
    );
  }

  console.log("  ✅ Seeded categories");
}

/**
 * Seed Products
 */
async function seedProducts(connection) {
  const products = [
    {
      id: "prod-001",
      name: "Beras Premium 5kg",
      description: "Beras berkualitas tinggi pilihan",
      price: 75000,
      stock: 100,
      unit: "kg",
      category_id: "cat-001",
      image_url: "/uploads/products/beras-premium.jpg",
      is_active: true,
    },
    {
      id: "prod-002",
      name: "Telur Ayam Kampung 10 Butir",
      description: "Telur segar dari ayam kampung",
      price: 30000,
      stock: 50,
      unit: "pack",
      category_id: "cat-004",
      image_url: "/uploads/products/telur-kampung.jpg",
      is_active: true,
    },
    {
      id: "prod-003",
      name: "Sayuran Organik Mix 1kg",
      description: "Paket sayuran organik segar",
      price: 25000,
      stock: 30,
      unit: "kg",
      category_id: "cat-002",
      image_url: "/uploads/products/sayuran-mix.jpg",
      is_active: true,
    },
    {
      id: "prod-004",
      name: "Jeruk Manis 1kg",
      description: "Jeruk manis segar",
      price: 20000,
      stock: 40,
      unit: "kg",
      category_id: "cat-003",
      image_url: "/uploads/products/jeruk.jpg",
      is_active: true,
    },
    {
      id: "prod-005",
      name: "Cabai Merah 500g",
      description: "Cabai merah segar pilihan",
      price: 15000,
      stock: 0, // Out of stock for testing
      unit: "gram",
      category_id: "cat-005",
      image_url: "/uploads/products/cabai.jpg",
      is_active: true,
    },
  ];

  for (const product of products) {
    await connection.query(
      `INSERT INTO products 
       (id, name, description, price, stock, unit, category_id, image_url, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.stock,
        product.unit,
        product.category_id,
        product.image_url,
        product.is_active,
      ]
    );
  }

  console.log("  ✅ Seeded products");
}

/**
 * Seed Customers
 */
async function seedCustomers(connection) {
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const customers = [
    {
      id: "cust-001",
      phone_number: "6281234567890",
      full_name: "Test Customer",
      password_hash: hashedPassword,
      address: "Jl. Test No. 123, Jakarta",
      is_active: true,
    },
    {
      id: "cust-002",
      phone_number: "6281234567891",
      full_name: "Customer Dua",
      password_hash: hashedPassword,
      address: "Jl. Test No. 456, Bandung",
      is_active: true,
    },
  ];

  for (const customer of customers) {
    await connection.query(
      `INSERT INTO customers 
       (id, phone_number, full_name, password_hash, address, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        customer.id,
        customer.phone_number,
        customer.full_name,
        customer.password_hash,
        customer.address,
        customer.is_active,
      ]
    );
  }

  console.log("  ✅ Seeded customers");
}

/**
 * Seed Discounts
 */
async function seedDiscounts(connection) {
  const discounts = [
    {
      id: "disc-001",
      name: "Diskon Telur 10%",
      description: "Diskon 10% untuk telur",
      discount_type: "percentage",
      discount_value: 10,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      is_active: true,
    },
  ];

  for (const discount of discounts) {
    await connection.query(
      `INSERT INTO discounts 
       (id, name, description, discount_type, discount_value, start_date, end_date, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        discount.id,
        discount.name,
        discount.description,
        discount.discount_type,
        discount.discount_value,
        discount.start_date,
        discount.end_date,
        discount.is_active,
      ]
    );

    // Assign discount to product
    await connection.query(
      `INSERT INTO discount_products (discount_id, product_id, created_at) 
       VALUES (?, ?, NOW())`,
      [discount.id, "prod-002"] // Telur Ayam Kampung
    );
  }

  console.log("  ✅ Seeded discounts");
}
