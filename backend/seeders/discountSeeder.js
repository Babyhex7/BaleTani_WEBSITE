/**
 * Discount Seeder - Membuat sample discount untuk testing pagination
 * Run: node backend/seeders/discountSeeder.js
 */

const { Discount, Product } = require("../src/models");

const sampleDiscounts = [
  {
    discount_name: "Flash Sale 25% Premium",
    discount_code: "FLASH25",
    discount_type: "percentage",
    discount_value: 25.0,
    description: "Diskon 25% untuk produk premium",
    start_date: new Date("2025-10-23"),
    end_date: new Date("2025-11-23"),
    max_usage: null,
    current_usage: 0,
    min_purchase: 100000,
    max_discount: 50000,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Diskon Sayuran Segar 15%",
    discount_code: "SAYUR15",
    discount_type: "percentage",
    discount_value: 15.0,
    description: "Hemat 15% untuk semua sayuran",
    start_date: new Date("2025-11-01"),
    end_date: new Date("2025-11-30"),
    max_usage: 100,
    current_usage: 25,
    min_purchase: 50000,
    max_discount: 30000,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Potongan Rp 50.000",
    discount_code: "POTONG50",
    discount_type: "fixed_amount",
    discount_value: 50000,
    description: "Potongan langsung Rp 50.000 untuk belanja min 300rb",
    start_date: new Date("2025-11-01"),
    end_date: new Date("2025-12-31"),
    max_usage: 50,
    current_usage: 10,
    min_purchase: 300000,
    max_discount: null,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Buah Tropis 20%",
    discount_code: "BUAH20",
    discount_type: "percentage",
    discount_value: 20.0,
    description: "Diskon khusus buah-buahan tropis",
    start_date: new Date("2025-10-15"),
    end_date: new Date("2025-11-15"),
    max_usage: null,
    current_usage: 0,
    min_purchase: 75000,
    max_discount: 40000,
    is_active: false,
    status: "expired",
  },
  {
    discount_name: "Member Baru Rp 25.000",
    discount_code: "NEWMEMBER25",
    discount_type: "fixed_amount",
    discount_value: 25000,
    description: "Selamat datang member baru!",
    start_date: new Date("2025-11-01"),
    end_date: new Date("2025-12-31"),
    max_usage: 200,
    current_usage: 50,
    min_purchase: 100000,
    max_discount: null,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Weekend Special 30%",
    discount_code: "WEEKEND30",
    discount_type: "percentage",
    discount_value: 30.0,
    description: "Diskon weekend untuk semua produk",
    start_date: new Date("2025-11-08"),
    end_date: new Date("2025-11-10"),
    max_usage: null,
    current_usage: 0,
    min_purchase: 150000,
    max_discount: 100000,
    is_active: false,
    status: "scheduled",
  },
  {
    discount_name: "Paket Hemat Rp 100.000",
    discount_code: "HEMAT100",
    discount_type: "fixed_amount",
    discount_value: 100000,
    description: "Paket hemat untuk belanja besar",
    start_date: new Date("2025-11-01"),
    end_date: new Date("2025-11-30"),
    max_usage: 20,
    current_usage: 15,
    min_purchase: 500000,
    max_discount: null,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Organik 10%",
    discount_code: "ORGANIC10",
    discount_type: "percentage",
    discount_value: 10.0,
    description: "Diskon produk organik pilihan",
    start_date: new Date("2025-10-01"),
    end_date: new Date("2025-10-31"),
    max_usage: 100,
    current_usage: 100,
    min_purchase: 80000,
    max_discount: 25000,
    is_active: false,
    status: "expired",
  },
  {
    discount_name: "Ramadhan Berkah 35%",
    discount_code: "RAMADHAN35",
    discount_type: "percentage",
    discount_value: 35.0,
    description: "Diskon spesial Ramadhan",
    start_date: new Date("2025-12-01"),
    end_date: new Date("2025-12-31"),
    max_usage: null,
    current_usage: 0,
    min_purchase: 200000,
    max_discount: 150000,
    is_active: false,
    status: "scheduled",
  },
  {
    discount_name: "Flash Hour Rp 75.000",
    discount_code: "FLASH75",
    discount_type: "fixed_amount",
    discount_value: 75000,
    description: "Diskon kilat 1 jam saja!",
    start_date: new Date("2025-11-05"),
    end_date: new Date("2025-11-05"),
    max_usage: 10,
    current_usage: 8,
    min_purchase: 400000,
    max_discount: null,
    is_active: false,
    status: "scheduled",
  },
  {
    discount_name: "Loyalty Member 40%",
    discount_code: "LOYAL40",
    discount_type: "percentage",
    discount_value: 40.0,
    description: "Terima kasih untuk pelanggan setia",
    start_date: new Date("2025-11-01"),
    end_date: new Date("2026-01-31"),
    max_usage: null,
    current_usage: 0,
    min_purchase: 250000,
    max_discount: 200000,
    is_active: true,
    status: "active",
  },
  {
    discount_name: "Promo Tengah Bulan Rp 40.000",
    discount_code: "TENGAH40",
    discount_type: "fixed_amount",
    discount_value: 40000,
    description: "Promo spesial tanggal 15",
    start_date: new Date("2025-11-15"),
    end_date: new Date("2025-11-16"),
    max_usage: 30,
    current_usage: 0,
    min_purchase: 200000,
    max_discount: null,
    is_active: false,
    status: "scheduled",
  },
];

const seedDiscounts = async () => {
  try {
    console.log("🌱 Starting discount seeder...\n");

    // Clear existing discounts (optional)
    // await Discount.destroy({ where: {} });

    let created = 0;
    let skipped = 0;

    for (const discountData of sampleDiscounts) {
      const exists = await Discount.findOne({
        where: { discount_code: discountData.discount_code },
      });

      if (!exists) {
        await Discount.create(discountData);
        created++;
        console.log(`✅ Created: ${discountData.discount_name}`);
      } else {
        skipped++;
        console.log(
          `⏭️  Skipped: ${discountData.discount_name} (already exists)`
        );
      }
    }

    console.log(`\n✨ Seeder completed!`);
    console.log(`   Created: ${created} discounts`);
    console.log(`   Skipped: ${skipped} discounts`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding discounts:", error);
    process.exit(1);
  }
};

seedDiscounts();
