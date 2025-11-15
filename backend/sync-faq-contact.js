/**
 * ============================================
 * DATABASE SYNC SCRIPT - FAQ & CONTACT
 * ============================================
 * Script untuk sync FAQ dan Contact Message tables
 *
 * Run: node backend/sync-faq-contact.js
 */

require("dotenv").config();
const { sequelize } = require("./src/config/database");
const FAQ = require("./src/models/faq.model");
const ContactMessage = require("./src/models/contactMessage.model");
const Admin = require("./src/models/admin.model");
const Customer = require("./src/models/customer.model");

async function syncTables() {
  try {
    console.log("🔄 Starting database sync for FAQ & Contact Messages...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Sync tables (force: false = tidak drop existing data)
    await FAQ.sync({ alter: true });
    console.log("✅ FAQ table synced");

    await ContactMessage.sync({ alter: true });
    console.log("✅ Contact Messages table synced");

    // Insert sample FAQs if table is empty
    const faqCount = await FAQ.count();
    if (faqCount === 0) {
      console.log("📝 Inserting sample FAQs...");
      await FAQ.bulkCreate([
        {
          question: "Bagaimana cara melakukan pemesanan?",
          answer:
            "Anda dapat melakukan pemesanan melalui website kami dengan cara: 1. Pilih produk yang diinginkan, 2. Tambahkan ke keranjang, 3. Isi data pengiriman, 4. Pilih metode pembayaran, 5. Selesaikan pembayaran.",
          category: "umum",
          order_number: 1,
          is_active: true,
        },
        {
          question: "Metode pembayaran apa saja yang diterima?",
          answer:
            "Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, Dana, ShopeePay), dan COD untuk area tertentu.",
          category: "pembayaran",
          order_number: 2,
          is_active: true,
        },
        {
          question: "Berapa lama proses pengiriman?",
          answer:
            "Estimasi pengiriman: 1-2 hari untuk area Jabodetabek, 3-5 hari untuk Jawa, dan 5-7 hari untuk luar Jawa. Pengiriman dilakukan setelah pembayaran dikonfirmasi.",
          category: "pengiriman",
          order_number: 3,
          is_active: true,
        },
        {
          question: "Apakah produk yang dijual fresh?",
          answer:
            "Ya, semua produk sayur dan buah kami dipetik fresh dari kebun petani mitra kami. Kami menjamin kesegaran produk dengan sistem cold chain dan pengiriman cepat.",
          category: "produk",
          order_number: 4,
          is_active: true,
        },
        {
          question: "Bagaimana jika produk yang diterima tidak sesuai?",
          answer:
            "Jika produk tidak sesuai atau rusak, Anda dapat mengajukan komplain maksimal 24 jam setelah produk diterima. Kami akan mengganti atau refund sesuai kebijakan kami.",
          category: "umum",
          order_number: 5,
          is_active: true,
        },
      ]);
      console.log("✅ Sample FAQs inserted");
    } else {
      console.log(`ℹ️ FAQ table already has ${faqCount} records`);
    }

    // Insert sample Contact Messages if table is empty
    const contactCount = await ContactMessage.count();
    if (contactCount === 0) {
      console.log("📝 Inserting sample Contact Messages...");
      await ContactMessage.bulkCreate([
        {
          customer_id: null, // Non-login customer
          full_name: "Budi Santoso",
          email: "budi.santoso@email.com",
          whatsapp_number: "081234567890",
          subject: "Pertanyaan tentang pengiriman ke Surabaya",
          message:
            "Halo, saya ingin menanyakan apakah pengiriman ke Surabaya tersedia? Berapa lama estimasi waktu pengirimannya? Terima kasih.",
          status: "pending",
        },
        {
          customer_id: null, // Non-login customer
          full_name: "Siti Nurhaliza",
          email: "siti.nurhaliza@gmail.com",
          whatsapp_number: "082345678901",
          subject: "Produk sayur organik",
          message:
            "Apakah ada sayur organik tanpa pestisida? Saya tertarik untuk order rutin setiap minggu.",
          status: "read",
        },
        {
          customer_id: null, // Non-login customer
          full_name: "Ahmad Rizki",
          email: null, // Tidak pakai email, hanya WhatsApp
          whatsapp_number: "083456789012",
          subject: "Komplain pesanan tidak sesuai",
          message:
            "Saya memesan tomat 2kg tapi yang datang hanya 1.5kg. Mohon penjelasannya.",
          status: "replied",
          admin_notes: "Sudah dikonfirmasi, akan kirim kekurangan 500gr besok",
          replied_at: new Date("2024-11-14 14:30:00"),
        },
        {
          customer_id: null,
          full_name: "Dewi Lestari",
          email: "dewi.lestari@yahoo.com",
          whatsapp_number: "084567890123",
          subject: "Request partnership untuk supplier",
          message:
            "Kami dari CV Agro Sejahtera ingin menawarkan kerjasama sebagai supplier sayuran organik. Bisa dibantu hubungi saya?",
          status: "resolved",
          admin_notes: "Sudah dihubungi dan meeting terjadwal",
          replied_at: new Date("2024-11-13 10:00:00"),
        },
        {
          customer_id: null,
          full_name: "Eko Prasetyo",
          email: "eko.prasetyo@outlook.com",
          whatsapp_number: "085678901234",
          subject: "Cara pembayaran COD",
          message:
            "Apakah COD tersedia untuk daerah Tangerang? Berapa minimum order untuk COD?",
          status: "pending",
        },
        {
          customer_id: null,
          full_name: "Rina Wijaya",
          email: "rina.wijaya@email.com",
          whatsapp_number: "086789012345",
          subject: "Produk rusak saat diterima",
          message:
            "Kemarin saya terima pesanan tapi beberapa produk dalam kondisi rusak. Bagaimana proses komplainnya?",
          status: "read",
        },
      ]);
      console.log("✅ Sample Contact Messages inserted");
    } else {
      console.log(
        `ℹ️ Contact Messages table already has ${contactCount} records`
      );
    }

    // Insert sample Contact Messages if table is empty
    const contactCount = await ContactMessage.count();
    if (contactCount === 0) {
      console.log("📝 Inserting sample contact messages...");
      await ContactMessage.bulkCreate([
        {
          full_name: "Budi Santoso",
          email: "budi.santoso@email.com",
          whatsapp_number: "081234567890",
          subject: "Pertanyaan tentang produk sayuran organik",
          message:
            "Halo, saya ingin menanyakan apakah sayuran yang dijual benar-benar organik? Apakah ada sertifikat organik? Terima kasih.",
          status: "pending",
        },
        {
          full_name: "Siti Nurhaliza",
          email: "siti.nur@email.com",
          whatsapp_number: "081298765432",
          subject: "Komplain pengiriman terlambat",
          message:
            "Pesanan saya dengan nomor #12345 sudah 3 hari belum sampai. Mohon informasinya. Saya sudah menunggu cukup lama.",
          status: "read",
        },
        {
          full_name: "Ahmad Hidayat",
          email: "ahmad.hidayat@email.com",
          whatsapp_number: "081345678901",
          subject: "Request untuk produk baru",
          message:
            "Apakah bisa menyediakan buah durian montong? Saya butuh dalam jumlah banyak untuk acara keluarga minggu depan.",
          status: "replied",
          replied_at: new Date(),
        },
        {
          full_name: "Dewi Lestari",
          email: "dewi.lestari@email.com",
          whatsapp_number: "081456789012",
          subject: "Cara pembayaran untuk pesanan besar",
          message:
            "Saya mau pesan untuk kebutuhan kantor sekitar 50kg sayuran. Apakah bisa bayar dengan transfer? Ada diskon untuk pembelian banyak?",
          status: "resolved",
        },
        {
          full_name: "Eko Prasetyo",
          whatsapp_number: "081567890123",
          subject: "Kualitas produk tidak sesuai",
          message:
            "Sayur yang saya terima kondisinya kurang segar. Beberapa sudah layu. Bagaimana proses penukaran atau refund?",
          status: "pending",
        },
      ]);
      console.log("✅ Sample contact messages inserted");
    } else {
      console.log(
        `ℹ️ Contact Messages table already has ${contactCount} records`
      );
    }

    console.log("✨ Database sync completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
}

syncTables();
