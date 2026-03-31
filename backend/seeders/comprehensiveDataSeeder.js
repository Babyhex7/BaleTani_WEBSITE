const { sequelize } = require("../src/config/database");
const Customer = require("../src/models/customer.model");
const Product = require("../src/models/product.model");
const Order = require("../src/models/order.model");
const OrderItem = require("../src/models/orderItem.model");
const OrderStatusHistory = require("../src/models/orderStatusHistory.model");
const PaymentDetail = require("../src/models/paymentDetail.model");
const Discount = require("../src/models/discount.model");
const ProductDiscount = require("../src/models/productDiscount.model");
const Procurement = require("../src/models/procurement.model");
const ProcurementItem = require("../src/models/procurementItem.model");
const Admin = require("../src/models/admin.model");
const FAQ = require("../src/models/faq.model");
const ContactMessage = require("../src/models/contactMessage.model");
const { v4: uuidv4 } = require("uuid");

// Sample customer data
const customersData = [
  {
    phone_number: "6281234567890",
    full_name: "Ibu Siti Nurhaliza",
    email: "siti@email.com",
    address: "Jl. Merdeka No. 123, Jakarta Pusat",
    city: "Jakarta",
    postal_code: "12345",
  },
  {
    phone_number: "6282345678901",
    full_name: "Pak Ahmad Wijaya",
    email: "ahmad@email.com",
    address: "Jl. Sudirman No. 456, Jakarta Selatan",
    city: "Jakarta",
    postal_code: "12310",
  },
  {
    phone_number: "6283456789012",
    full_name: "Ibu Rina Kartika",
    email: "rina@email.com",
    address: "Jl. Gatot Subroto No. 789, Bandung",
    city: "Bandung",
    postal_code: "40123",
  },
  {
    phone_number: "6284567890123",
    full_name: "Pak Budi Santoso",
    email: "budi@email.com",
    address: "Jl. Ahmad Yani No. 321, Surabaya",
    city: "Surabaya",
    postal_code: "60123",
  },
  {
    phone_number: "6285678901234",
    full_name: "Ibu Dewi Lestari",
    email: "dewi@email.com",
    address: "Jl. Diponegoro No. 654, Medan",
    city: "Medan",
    postal_code: "20123",
  },
  {
    phone_number: "6286789012345",
    full_name: "Pak Rudi Hermawan",
    email: "rudi@email.com",
    address: "Jl. Ray No. 987, Makassar",
    city: "Makassar",
    postal_code: "90123",
  },
  {
    phone_number: "6287890123456",
    full_name: "Ibu Susi Wijayanti",
    email: "susi@email.com",
    address: "Jl. Ahmad Dahlan No. 234, Yogyakarta",
    city: "Yogyakarta",
    postal_code: "55123",
  },
  {
    phone_number: "6288901234567",
    full_name: "Pak Hendra Gunawan",
    email: "hendra@email.com",
    address: "Jl. Jenderal Sudirman No. 567, Bekasi",
    city: "Bekasi",
    postal_code: "17123",
  },
  {
    phone_number: "6289012345678",
    full_name: "Ibu Lina Permata",
    email: "lina@email.com",
    address: "Jl. Jenderal Soedirman No. 890, Semarang",
    city: "Semarang",
    postal_code: "50123",
  },
  {
    phone_number: "6280123456789",
    full_name: "Pak Yatno Sutrisno",
    email: "yatno@email.com",
    address: "Jl. Gatot Subroto No. 111, Tangerang",
    city: "Tangerang",
    postal_code: "15123",
  },
];

// Sample discount data
const discountsData = [
  {
    discount_name: "Diskon Ikan 20%",
    discount_type: "percentage",
    value: 20,
    max_discount: 100000,
    start_date: new Date("2026-04-01"),
    end_date: new Date("2026-04-30"),
    is_active: true,
  },
  {
    discount_name: "Diskon Sayuran Rp. 5000",
    discount_type: "fixed_amount",
    value: 5000,
    start_date: new Date("2026-04-01"),
    end_date: new Date("2026-04-30"),
    is_active: true,
  },
  {
    discount_name: "Diskon Telur 15%",
    discount_type: "percentage",
    value: 15,
    max_discount: 50000,
    start_date: new Date("2026-04-15"),
    end_date: new Date("2026-05-15"),
    is_active: true,
  },
  {
    discount_name: "Diskon Bahan Pokok Rp. 10000",
    discount_type: "fixed_amount",
    value: 10000,
    start_date: new Date("2026-04-01"),
    end_date: new Date("2026-05-31"),
    is_active: true,
  },
  {
    discount_name: "Promo Buah 25%",
    discount_type: "percentage",
    value: 25,
    max_discount: 150000,
    start_date: new Date("2026-04-20"),
    end_date: new Date("2026-05-20"),
    is_active: false,
  },
];

// Sample FAQ data
const faqsData = [
  {
    question: "Bagaimana cara melakukan pemesanan?",
    answer:
      "Anda bisa melakukan pemesanan melalui aplikasi atau website kami. Pilih produk yang diinginkan, masukkan jumlah, dan lakukan pembayaran.",
    category: "Pemesanan",
    is_active: true,
  },
  {
    question: "Apakah ada biaya pengiriman?",
    answer:
      "Biaya pengiriman tergantung dari lokasi Anda. Kami menawarkan gratis ongkir untuk pembelian minimal Rp 100.000.",
    category: "Pengiriman",
    is_active: true,
  },
  {
    question: "Berapa lama waktu pengiriman?",
    answer:
      "Waktu pengiriman biasanya 1-2 hari kerja untuk area Jakarta, dan 2-5 hari untuk area lainnya.",
    category: "Pengiriman",
    is_active: true,
  },
  {
    question: "Apa yang harus dilakukan jika produk rusak?",
    answer:
      "Hubungi customer service kami segera dengan bukti foto produk. Kami siap memberikan penggantian atau refund.",
    category: "Keluhan",
    is_active: true,
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima pembayaran via Bank Transfer, E-wallet (OVO, GoPay, Dana), dan COD (Cash on Delivery) untuk area tertentu.",
    category: "Pembayaran",
    is_active: true,
  },
  {
    question: "Apakah produk organik?",
    answer:
      "Sebagian besar produk kami adalah hasil pertanian lokal berkualitas. Untuk produk organik, silakan hubungi customer service.",
    category: "Produk",
    is_active: true,
  },
  {
    question: "Bagaimana garansi kesegaran produk?",
    answer:
      "Kami menjamin produk sampai di tangan Anda dalam kondisi segar. Jika ada masalah, hubungi kami dalam 24 jam setelah penerimaan.",
    category: "Produk",
    is_active: true,
  },
  {
    question: "Apakah ada program member atau loyalty?",
    answer:
      "Ya, setiap pembelian Anda akan mendapatkan poin yang bisa ditukar dengan diskon atau produk gratis.",
    category: "Program",
    is_active: true,
  },
];

// Sample contact message data
const contactMessagesData = [
  {
    full_name: "Muhammadly Ahmad",
    email: "muhammadly@email.com",
    whatsapp_number: "6281234567891",
    subject: "Pertanyaan tentang kualitas produk",
    message:
      "Saya ingin bertanya tentang standar kualitas produk ikan yang Anda berikan. Apakah semuanya segar?",
    status: "resolved",
  },
  {
    full_name: "Sinta Wijaya",
    email: "sinta@email.com",
    whatsapp_number: "6282345678902",
    subject: "Komplain pengiriman",
    message:
      "Paket saya terlambat sampai 3 hari. Apakah ada kompensasi untuk keterlambatan ini?",
    status: "resolved",
  },
  {
    full_name: "Bobby Pratama",
    email: "bobby@email.com",
    whatsapp_number: "6283456789013",
    subject: "Feedback positif",
    message:
      "Saya sangat puas dengan layanan dan kualitas produk Anda. Akan terus berbelanja di toko ini.",
    status: "resolved",
  },
  {
    full_name: "Cindy Santoso",
    email: "cindy@email.com",
    whatsapp_number: "6284567890124",
    subject: "Saran produk baru",
    message:
      "Apakah bisa menambahkan produk daging sapi? Saya sering mencari daging berkualitas.",
    status: "pending",
  },
  {
    full_name: "Dennis Wijaya",
    email: "dennis@email.com",
    whatsapp_number: "6285678901235",
    subject: "Pertanyaan harga grosir",
    message:
      "Berapa harga jika saya ingin beli dalam jumlah besar? Apakah ada diskon grosir?",
    status: "pending",
  },
];

async function seedComprehensiveData() {
  try {
    console.log("🚀 Starting comprehensive database seeder...\n");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // ============================================
    // 1. SEED CUSTOMERS
    // ============================================
    console.log("👥 Seeding customers...");
    let customerCreated = 0;
    const customerIds = [];

    for (const custData of customersData) {
      // Create customer with plaintext password - let beforeCreate hook handle hashing
      const [customer, created] = await Customer.findOrCreate({
        where: { phone_number: custData.phone_number },
        defaults: {
          id: uuidv4(),
          phone_number: custData.phone_number,
          full_name: custData.full_name,
          password_hash: "customer12345", // Plain password - hook will hash it
          address: custData.address,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (created) {
        console.log(
          `   ✅ Created customer: ${custData.full_name} (${custData.phone_number})`,
        );
        customerCreated++;
        customerIds.push(customer.id);
      } else {
        console.log(`   ⏭️  Customer exists: ${custData.full_name}`);
        customerIds.push(customer.id);
      }
    }
    console.log(`   📊 Total customers: ${customerIds.length}\n`);

    // ============================================
    // 2. SEED DISCOUNTS
    // ============================================
    console.log("🏷️  Seeding discounts...");
    let discountCreated = 0;
    const discountIds = [];

    for (const discData of discountsData) {
      const [discount, created] = await Discount.findOrCreate({
        where: { discount_name: discData.discount_name },
        defaults: {
          id: uuidv4(),
          discount_name: discData.discount_name,
          discount_type: discData.discount_type,
          value: discData.value,
          max_discount: discData.max_discount || null,
          start_date: discData.start_date,
          end_date: discData.end_date,
          is_active: discData.is_active,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (created) {
        console.log(`   ✅ Created discount: ${discData.discount_name}`);
        discountCreated++;
        discountIds.push(discount.id);
      } else {
        console.log(`   ⏭️  Discount exists: ${discData.discount_name}`);
        discountIds.push(discount.id);
      }
    }
    console.log(`   📊 Total discounts: ${discountIds.length}\n`);

    // ============================================
    // 3. ASSIGN DISCOUNTS TO PRODUCTS
    // ============================================
    console.log("🔗 Assigning discounts to products...");
    let productDiscountCreated = 0;

    // Get first 2 products for discount 1 (Ikan 20%)
    const allProducts = await Product.findAll({ limit: 20 });

    if (allProducts.length > 0 && discountIds.length > 0) {
      // Assign "Diskon Ikan 20%" to seafood products
      const seafoodProducts = allProducts.filter((p) =>
        p.name.toLowerCase().includes("ikan"),
      );

      for (const product of seafoodProducts.slice(0, 5)) {
        const [_, created] = await ProductDiscount.findOrCreate({
          where: {
            product_id: product.id,
            discount_id: discountIds[0],
          },
          defaults: {
            id: uuidv4(),
            product_id: product.id,
            discount_id: discountIds[0],
          },
        });
        if (created) productDiscountCreated++;
      }

      console.log(
        `   ✅ Assigned ${productDiscountCreated} product-discount mappings\n`,
      );
    }

    // ============================================
    // 4. SEED FAQS
    // ============================================
    console.log("❓ Seeding FAQs...");
    let faqCreated = 0;

    for (const faqData of faqsData) {
      // Map category to allowed enum values
      const categoryMap = {
        Pemesanan: "umum",
        Pengiriman: "pengiriman",
        Pembayaran: "pembayaran",
        Produk: "produk",
        Keluhan: "umum",
        Program: "umum",
      };

      const mappedCategory = categoryMap[faqData.category] || "umum";

      const [faq, created] = await FAQ.findOrCreate({
        where: { question: faqData.question },
        defaults: {
          question: faqData.question,
          answer: faqData.answer,
          category: mappedCategory,
          order_number: 0,
          is_active: faqData.is_active,
        },
      });

      if (created) {
        console.log(`   ✅ Created FAQ: ${faqData.question.substring(0, 40)}...`);
        faqCreated++;
      } else {
        console.log(
          `   ⏭️  FAQ exists: ${faqData.question.substring(0, 40)}...`,
        );
      }
    }
    console.log(`   📊 Total FAQs: ${faqCreated}\n`);

    // ============================================
    // 5. SEED CONTACT MESSAGES
    // ============================================
    console.log("💬 Seeding contact messages...");
    let contactCreated = 0;

    for (const contactData of contactMessagesData) {
      const [contact, created] = await ContactMessage.findOrCreate({
        where: {
          email: contactData.email,
          subject: contactData.subject,
        },
        defaults: {
          full_name: contactData.full_name,
          email: contactData.email,
          whatsapp_number: contactData.whatsapp_number,
          subject: contactData.subject,
          message: contactData.message,
          status: contactData.status,
        },
      });

      if (created) {
        console.log(
          `   ✅ Created message from: ${contactData.full_name} (${contactData.status})`,
        );
        contactCreated++;
      } else {
        console.log(
          `   ⏭️  Message exists from: ${contactData.full_name}`,
        );
      }
    }
    console.log(`   📊 Total messages: ${contactCreated}\n`);

    // ============================================
    // 6. SEED SAMPLE ORDERS
    // ============================================
    if (customerIds.length > 0 && allProducts.length > 0) {
      console.log("📦 Seeding sample orders...");
      let orderCreated = 0;
      const superAdminId = (await Admin.findOne({ where: { full_name: "Super Admin" } }))?.id;

      for (let i = 0; i < 5; i++) {
        const customerId = customerIds[i % customerIds.length];
        const customer = await Customer.findByPk(customerId);
        const orderDate = new Date(2026, 2, Math.floor(Math.random() * 28) + 1); // Random date in March

        // Generate unique order number
        const dateStr = `${orderDate.getFullYear()}${String(
          orderDate.getMonth() + 1
        ).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}`;
        const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
        const orderNumber = `ORD-${dateStr}-${randomNum}`;

        const order = await Order.create({
          id: uuidv4(),
          order_number: orderNumber,
          order_type: "online",
          transaction_type: "online",
          customer_id: customerId,
          customer_name: customer.full_name,
          customer_phone: customer.phone_number,
          order_status: ["pending_payment", "confirmed", "completed"][
            Math.floor(Math.random() * 3)
          ],
          payment_status:
            Math.random() > 0.3 ? "confirmed" : "pending",
          payment_method: ["transfer", "cash", "qris"][Math.floor(Math.random() * 3)],
          delivery_method: ["delivery", "self_pickup"][Math.floor(Math.random() * 2)],
          delivery_address: customer.address || "Jakarta",
          item_subtotal: 0,
          delivery_fee: 10000,
          discount_amount: 0,
          total_amount: 0,
          created_at: orderDate,
          updated_at: orderDate,
        });

        // Add order items
        const numItems = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;

        for (let j = 0; j < numItems; j++) {
          const product = allProducts[Math.floor(Math.random() * allProducts.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
          const itemTotal = product.selling_price * quantity;

          totalAmount += itemTotal;

          await OrderItem.create({
            id: uuidv4(),
            order_id: order.id,
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            original_price: product.selling_price,
            discount_price: 0,
            final_price: product.selling_price,
            subtotal: itemTotal,
            created_at: orderDate,
            updated_at: orderDate,
          });
        }

        // Update order totals
        const deliveryFee = order.delivery_method === "delivery" ? 10000 : 0;
        order.item_subtotal = totalAmount;
        order.delivery_fee = deliveryFee;
        order.total_amount = totalAmount + deliveryFee;
        await order.save();

        // Add status history
        await OrderStatusHistory.create({
          id: uuidv4(),
          order_id: order.id,
          old_status: null,
          new_status: order.order_status,
          changed_by: superAdminId || null,
          notes: `Sample order created - ${order.order_status}`,
          changed_at: orderDate,
        });

        // Add payment detail if confirmed
        if (order.payment_status === "confirmed") {
          const paymentDate = new Date(orderDate.getTime() + 3600000); // 1 hour after order
          const paymentMethodMap = {
            "transfer": "bank_transfer",
            "cash": "cod",
            "qris": "e_wallet"
          };
          
          await PaymentDetail.create({
            order_id: order.id,
            payment_method: paymentMethodMap[order.payment_method] || "bank_transfer",
            bank_name: order.payment_method === "transfer" ? "BRI" : null,
            account_name: "BaleTani Fresh Market",
            amount: order.total_amount,
            payment_status: "paid",
            paid_at: paymentDate,
            created_at: paymentDate,
            updated_at: paymentDate,
          });
        }

        console.log(
          `   ✅ Created order ${orderNumber} for ${customer.full_name} (Rp${order.total_amount.toLocaleString("id-ID")})`,
        );
        orderCreated++;
      }
      console.log(`   📊 Total orders created: ${orderCreated}\n`);
    }

    // ============================================
    // 7. SEED SAMPLE PROCUREMENTS
    // ============================================
    // SKIPPED: Use dedicated seedProcurements.js script instead
    // Run with: npm run seed:procurements
    console.log("🏭 Procurements: Will be seeded separately with seedProcurements.js\n");

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log("=".repeat(60));
    console.log("🎉 ALL DATA SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`
✅ Summary:
   👥 Customers: ${customerIds.length}
   🏷️  Discounts: ${discountIds.length}
   ❓ FAQs: ${faqCreated}
   💬 Contact Messages: ${contactCreated}
   📦 Sample Orders: 5
   
⏭️  Additional Seeding:
   To seed procurements, run: npm run seed:procurements
   
💡 Next Steps:
   1. Login dengan salah satu customer account (password: customer12345)
   2. Browse produk dan lakukan pemesanan
   3. Admin bisa track order dan manage procurement
   4. Check FAQ dan contact message di admin
   
📍 Database is now ready for testing and development!
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedComprehensiveData();
