-- ============================================
-- FAQ TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `category` ENUM('umum', 'pembayaran', 'pengiriman', 'produk') NOT NULL DEFAULT 'umum',
  `order_number` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` CHAR(36) NULL,
  `updated_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_order_number` (`order_number`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` CHAR(36) NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `whatsapp_number` VARCHAR(20) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending', 'read', 'replied', 'resolved') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT NULL,
  `replied_at` DATETIME NULL,
  `replied_by` CHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_replied_by` (`replied_by`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`replied_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA - FAQ
-- ============================================
INSERT INTO `faqs` (`question`, `answer`, `category`, `order_number`, `is_active`) VALUES
('Bagaimana cara melakukan pemesanan?', 'Anda dapat melakukan pemesanan melalui website kami dengan cara: 1. Pilih produk yang diinginkan, 2. Tambahkan ke keranjang, 3. Isi data pengiriman, 4. Pilih metode pembayaran, 5. Selesaikan pembayaran.', 'umum', 1, 1),
('Metode pembayaran apa saja yang diterima?', 'Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, Dana, ShopeePay), dan COD untuk area tertentu.', 'pembayaran', 2, 1),
('Berapa lama proses pengiriman?', 'Estimasi pengiriman: 1-2 hari untuk area Jabodetabek, 3-5 hari untuk Jawa, dan 5-7 hari untuk luar Jawa. Pengiriman dilakukan setelah pembayaran dikonfirmasi.', 'pengiriman', 3, 1),
('Apakah produk yang dijual fresh?', 'Ya, semua produk sayur dan buah kami dipetik fresh dari kebun petani mitra kami. Kami menjamin kesegaran produk dengan sistem cold chain dan pengiriman cepat.', 'produk', 4, 1),
('Bagaimana jika produk yang diterima tidak sesuai?', 'Jika produk tidak sesuai atau rusak, Anda dapat mengajukan komplain maksimal 24 jam setelah produk diterima. Kami akan mengganti atau refund sesuai kebijakan kami.', 'umum', 5, 1);

-- ============================================
-- SAMPLE DATA - CONTACT MESSAGES
-- ============================================
-- Tidak perlu sample data untuk contact messages karena ini dari customer
