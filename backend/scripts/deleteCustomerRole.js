/**
 * Script untuk menghapus role "customer" dari database
 * Customer BUKAN admin, jadi tidak perlu ada di tabel roles
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

const deleteCustomerRole = async () => {
  let connection;

  try {
    console.log("🗑️  Menghapus role 'customer' dari database...");

    // Koneksi ke database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "baletani_db",
    });

    console.log("✅ Koneksi database berhasil");

    // 1. Cek apakah ada admin user yang menggunakan role customer
    const [adminCheck] = await connection.query(
      `SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE role_name = 'customer')`
    );

    if (adminCheck[0].count > 0) {
      console.log(
        `⚠️  Ditemukan ${adminCheck[0].count} admin user dengan role customer`
      );
      console.log("   User ini akan di-set ke NULL (no role)");

      // Update user yang menggunakan role customer
      await connection.query(
        `UPDATE users SET role_id = NULL WHERE role_id = (SELECT id FROM roles WHERE role_name = 'customer')`
      );
    }

    // 2. Hapus role permissions untuk customer
    await connection.query(
      `DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE role_name = 'customer')`
    );

    console.log("✅ Role permissions untuk customer berhasil dihapus");

    // 3. Hapus role customer
    const [result] = await connection.query(
      `DELETE FROM roles WHERE role_name = 'customer'`
    );

    if (result.affectedRows > 0) {
      console.log("✅ Role 'customer' berhasil dihapus dari database");
    } else {
      console.log("ℹ️  Role 'customer' tidak ditemukan di database");
    }

    // Tampilkan role yang tersisa
    const [remainingRoles] = await connection.query(
      `SELECT id, role_name, description FROM roles ORDER BY role_name ASC`
    );

    console.log("\n📋 Daftar role admin yang tersisa:");
    remainingRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ${role.role_name}`);
      console.log(`      ${role.description}`);
    });

    console.log(`\n✅ Total: ${remainingRoles.length} role admin`);
    console.log("✅ Script selesai!");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
};

// Jalankan script
deleteCustomerRole();
