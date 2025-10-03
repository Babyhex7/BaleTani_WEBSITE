/**
 * Script untuk force sync database
 * Fungsi: Memperbarui struktur tabel database sesuai dengan model terbaru
 * Peringatan: Script ini akan menghapus semua data yang ada!
 */

const { sequelize } = require("../src/config/database");
const models = require("../src/models");

/**
 * Fungsi untuk force sync database
 * Force sync akan drop dan recreate semua tabel sesuai model
 */
const forceSyncDatabase = async () => {
  try {
    console.log("🔄 Memulai force sync database...");

    // Force sync akan drop semua tabel dan membuat ulang
    await sequelize.sync({ force: true });

    console.log("✅ Database berhasil di-sync dengan force!");
    console.log("📋 Struktur tabel telah diperbarui sesuai dengan model");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error saat force sync database:", error);
    process.exit(1);
  }
};

// Jalankan force sync
forceSyncDatabase();
