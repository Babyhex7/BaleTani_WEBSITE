/**
 * Mock Data untuk Product & Inventory Management
 * Data dummy lengkap untuk testing UI admin
 */

// Mock Categories
export const mockCategories = [
  {
    id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Berbagai jenis sayuran segar organik",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
    deleted_at: null,
  },
  {
    id: "cat-002",
    category_name: "Buah-buahan",
    description: "Buah segar pilihan berkualitas",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
    deleted_at: null,
  },
  {
    id: "cat-003",
    category_name: "Bumbu Dapur",
    description: "Bumbu dan rempah-rempah segar",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
    deleted_at: null,
  },
  {
    id: "cat-004",
    category_name: "Daging & Protein",
    description: "Daging segar dan sumber protein",
    is_active: true,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
    deleted_at: null,
  },
  {
    id: "cat-005",
    category_name: "Telur & Susu",
    description: "Produk telur dan susu segar",
    is_active: false,
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2025-01-15T08:00:00Z",
    deleted_at: null,
  },
];

// Mock Products
export const mockProducts = [
  {
    id: "prod-001",
    name: "Bayam Hijau Segar",
    product_type: "online",
    category_id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Bayam hijau organik segar dari petani lokal",
    selling_price: 8000,
    unit: "ikat",
    shelf_life_days: 3,
    total_stock: 45,
    is_active: true,
    images: [
      {
        id: "img-001",
        image_url: "https://via.placeholder.com/300x300?text=Bayam",
        display_order: 1,
      },
    ],
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-002",
    name: "Tomat Merah",
    product_type: "online",
    category_id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Tomat merah segar, manis dan segar",
    selling_price: 12000,
    unit: "kg",
    shelf_life_days: 7,
    total_stock: 120,
    is_active: true,
    images: [
      {
        id: "img-002",
        image_url: "https://via.placeholder.com/300x300?text=Tomat",
        display_order: 1,
      },
    ],
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-003",
    name: "Bawang Merah",
    product_type: "offline",
    category_id: "cat-003",
    category_name: "Bumbu Dapur",
    description: "Bawang merah pilihan kualitas terbaik",
    selling_price: 35000,
    unit: "kg",
    shelf_life_days: 30,
    total_stock: 8,
    is_active: true,
    images: [
      {
        id: "img-003",
        image_url: "https://via.placeholder.com/300x300?text=Bawang+Merah",
        display_order: 1,
      },
    ],
    created_at: "2025-09-15T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-004",
    name: "Apel Fuji",
    product_type: "online",
    category_id: "cat-002",
    category_name: "Buah-buahan",
    description: "Apel Fuji impor segar dan manis",
    selling_price: 45000,
    unit: "kg",
    shelf_life_days: 14,
    total_stock: 65,
    is_active: true,
    images: [
      {
        id: "img-004",
        image_url: "https://via.placeholder.com/300x300?text=Apel+Fuji",
        display_order: 1,
      },
    ],
    created_at: "2025-09-20T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-005",
    name: "Wortel Organik",
    product_type: "online",
    category_id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Wortel organik segar tanpa pestisida",
    selling_price: 15000,
    unit: "kg",
    shelf_life_days: 10,
    total_stock: 2,
    is_active: true,
    images: [
      {
        id: "img-005",
        image_url: "https://via.placeholder.com/300x300?text=Wortel",
        display_order: 1,
      },
    ],
    created_at: "2025-10-05T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-006",
    name: "Daging Ayam Fillet",
    product_type: "offline",
    category_id: "cat-004",
    category_name: "Daging & Protein",
    description: "Daging ayam fillet segar tanpa tulang",
    selling_price: 38000,
    unit: "kg",
    shelf_life_days: 2,
    total_stock: 25,
    is_active: true,
    images: [
      {
        id: "img-006",
        image_url: "https://via.placeholder.com/300x300?text=Ayam+Fillet",
        display_order: 1,
      },
    ],
    created_at: "2025-10-10T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-007",
    name: "Brokoli Hijau",
    product_type: "online",
    category_id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Brokoli hijau segar import",
    selling_price: 28000,
    unit: "kg",
    shelf_life_days: 5,
    total_stock: 0,
    is_active: true,
    images: [
      {
        id: "img-007",
        image_url: "https://via.placeholder.com/300x300?text=Brokoli",
        display_order: 1,
      },
    ],
    created_at: "2025-10-12T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-008",
    name: "Cabai Merah Keriting",
    product_type: "offline",
    category_id: "cat-003",
    category_name: "Bumbu Dapur",
    description: "Cabai merah keriting pedas segar",
    selling_price: 55000,
    unit: "kg",
    shelf_life_days: 7,
    total_stock: 15,
    is_active: false,
    images: [
      {
        id: "img-008",
        image_url: "https://via.placeholder.com/300x300?text=Cabai+Merah",
        display_order: 1,
      },
    ],
    created_at: "2025-09-25T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-009",
    name: "Pisang Cavendish",
    product_type: "online",
    category_id: "cat-002",
    category_name: "Buah-buahan",
    description: "Pisang cavendish segar premium",
    selling_price: 18000,
    unit: "sisir",
    shelf_life_days: 5,
    total_stock: 50,
    is_active: true,
    images: [
      {
        id: "img-009",
        image_url: "https://via.placeholder.com/300x300?text=Pisang",
        display_order: 1,
      },
    ],
    created_at: "2025-10-08T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
  {
    id: "prod-010",
    name: "Kentang Granola",
    product_type: "online",
    category_id: "cat-001",
    category_name: "Sayuran Segar",
    description: "Kentang granola pilihan untuk berbagai masakan",
    selling_price: 22000,
    unit: "kg",
    shelf_life_days: 21,
    total_stock: 80,
    is_active: true,
    images: [
      {
        id: "img-010",
        image_url: "https://via.placeholder.com/300x300?text=Kentang",
        display_order: 1,
      },
    ],
    created_at: "2025-09-30T08:00:00Z",
    updated_at: "2025-10-20T10:30:00Z",
  },
];

// Mock Discounts
export const mockDiscounts = [
  {
    id: "disc-001",
    discount_name: "Diskon Akhir Bulan",
    discount_type: "percentage",
    value: 15,
    start_date: "2025-10-25",
    end_date: "2025-10-31",
    is_active: true,
    products: ["prod-001", "prod-002", "prod-004"],
    created_at: "2025-10-20T08:00:00Z",
    updated_at: "2025-10-20T08:00:00Z",
  },
  {
    id: "disc-002",
    discount_name: "Flash Sale Sayuran",
    discount_type: "fixed_amount",
    value: 5000,
    start_date: "2025-10-21",
    end_date: "2025-10-22",
    is_active: true,
    products: ["prod-001", "prod-005"],
    created_at: "2025-10-19T08:00:00Z",
    updated_at: "2025-10-19T08:00:00Z",
  },
  {
    id: "disc-003",
    discount_name: "Promo Buah Import",
    discount_type: "percentage",
    value: 20,
    start_date: "2025-10-15",
    end_date: "2025-10-20",
    is_active: false,
    products: ["prod-004"],
    created_at: "2025-10-14T08:00:00Z",
    updated_at: "2025-10-20T08:00:00Z",
  },
];

// Mock Procurements
export const mockProcurements = [
  {
    id: "proc-001",
    procurement_code: "PROC-20251020-001",
    procurement_type: "online",
    supplier_name: "CV Sumber Sayur Makmur",
    procurement_date: "2025-10-20",
    total_amount: 5450000,
    status: "pending",
    created_by: "user-002",
    created_by_name: "Siti Aminah",
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    rejected_by: null,
    rejected_by_name: null,
    rejected_at: null,
    notes: "Pengadaan rutin mingguan",
    created_at: "2025-10-20T08:00:00Z",
    updated_at: "2025-10-20T08:00:00Z",
    items: [
      {
        id: "proc-item-001",
        product_id: "prod-001",
        product_name: "Bayam Hijau Segar",
        quantity: 100,
        unit: "ikat",
        purchase_price_per_unit: 5000,
        subtotal: 500000,
        expiry_date: "2025-10-23",
      },
      {
        id: "proc-item-002",
        product_id: "prod-002",
        product_name: "Tomat Merah",
        quantity: 50,
        unit: "kg",
        purchase_price_per_unit: 9000,
        subtotal: 450000,
        expiry_date: "2025-10-27",
      },
      {
        id: "proc-item-003",
        product_id: "prod-010",
        product_name: "Kentang Granola",
        quantity: 200,
        unit: "kg",
        purchase_price_per_unit: 17000,
        subtotal: 3400000,
        expiry_date: "2025-11-10",
      },
    ],
  },
  {
    id: "proc-002",
    procurement_code: "PROC-20251019-001",
    procurement_type: "offline",
    supplier_name: "Toko Buah Segar Jaya",
    procurement_date: "2025-10-19",
    total_amount: 2700000,
    status: "approved",
    created_by: "user-002",
    created_by_name: "Siti Aminah",
    approved_by: "user-001",
    approved_by_name: "Ahmad Dahlan",
    approved_at: "2025-10-19T14:30:00Z",
    rejected_by: null,
    rejected_by_name: null,
    rejected_at: null,
    notes: "Pengadaan buah untuk toko offline",
    created_at: "2025-10-19T08:00:00Z",
    updated_at: "2025-10-19T14:30:00Z",
    items: [
      {
        id: "proc-item-004",
        product_id: "prod-004",
        product_name: "Apel Fuji",
        quantity: 60,
        unit: "kg",
        purchase_price_per_unit: 38000,
        subtotal: 2280000,
        expiry_date: "2025-11-02",
      },
      {
        id: "proc-item-005",
        product_id: "prod-009",
        product_name: "Pisang Cavendish",
        quantity: 30,
        unit: "sisir",
        purchase_price_per_unit: 14000,
        subtotal: 420000,
        expiry_date: "2025-10-24",
      },
    ],
  },
  {
    id: "proc-003",
    procurement_code: "PROC-20251018-001",
    procurement_type: "online",
    supplier_name: "PT Bumbu Nusantara",
    procurement_date: "2025-10-18",
    total_amount: 1750000,
    status: "approved",
    created_by: "user-003",
    created_by_name: "Budi Santoso",
    approved_by: "user-001",
    approved_by_name: "Ahmad Dahlan",
    approved_at: "2025-10-18T16:00:00Z",
    rejected_by: null,
    rejected_by_name: null,
    rejected_at: null,
    notes: null,
    created_at: "2025-10-18T09:00:00Z",
    updated_at: "2025-10-18T16:00:00Z",
    items: [
      {
        id: "proc-item-006",
        product_id: "prod-003",
        product_name: "Bawang Merah",
        quantity: 50,
        unit: "kg",
        purchase_price_per_unit: 28000,
        subtotal: 1400000,
        expiry_date: "2025-11-17",
      },
      {
        id: "proc-item-007",
        product_id: "prod-008",
        product_name: "Cabai Merah Keriting",
        quantity: 10,
        unit: "kg",
        purchase_price_per_unit: 35000,
        subtotal: 350000,
        expiry_date: "2025-10-25",
      },
    ],
  },
  {
    id: "proc-004",
    procurement_code: "PROC-20251017-001",
    procurement_type: "offline",
    supplier_name: "CV Daging Segar Sentosa",
    procurement_date: "2025-10-17",
    total_amount: 1140000,
    status: "rejected",
    created_by: "user-002",
    created_by_name: "Siti Aminah",
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    rejected_by: "user-001",
    rejected_by_name: "Ahmad Dahlan",
    rejected_at: "2025-10-17T15:00:00Z",
    notes: "Harga terlalu tinggi dari harga pasar",
    created_at: "2025-10-17T10:00:00Z",
    updated_at: "2025-10-17T15:00:00Z",
    items: [
      {
        id: "proc-item-008",
        product_id: "prod-006",
        product_name: "Daging Ayam Fillet",
        quantity: 30,
        unit: "kg",
        purchase_price_per_unit: 38000,
        subtotal: 1140000,
        expiry_date: "2025-10-19",
      },
    ],
  },
  {
    id: "proc-005",
    procurement_code: "PROC-20251021-001",
    procurement_type: "online",
    supplier_name: "Toko Sayur Berkah",
    procurement_date: "2025-10-21",
    total_amount: 840000,
    status: "pending",
    created_by: "user-003",
    created_by_name: "Budi Santoso",
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    rejected_by: null,
    rejected_by_name: null,
    rejected_at: null,
    notes: "Urgent - stok menipis",
    created_at: "2025-10-21T07:00:00Z",
    updated_at: "2025-10-21T07:00:00Z",
    items: [
      {
        id: "proc-item-009",
        product_id: "prod-005",
        product_name: "Wortel Organik",
        quantity: 30,
        unit: "kg",
        purchase_price_per_unit: 12000,
        subtotal: 360000,
        expiry_date: "2025-10-31",
      },
      {
        id: "proc-item-010",
        product_id: "prod-007",
        product_name: "Brokoli Hijau",
        quantity: 20,
        unit: "kg",
        purchase_price_per_unit: 24000,
        subtotal: 480000,
        expiry_date: "2025-10-26",
      },
    ],
  },
];

// Mock Users (untuk reference)
export const mockUsers = [
  {
    id: "user-001",
    full_name: "Ahmad Dahlan",
    role_name: "super_inventory_admin",
    phone_number: "081234567890",
  },
  {
    id: "user-002",
    full_name: "Siti Aminah",
    role_name: "inventory_admin",
    phone_number: "081234567891",
  },
  {
    id: "user-003",
    full_name: "Budi Santoso",
    role_name: "inventory_admin",
    phone_number: "081234567892",
  },
];

// Helper functions
export const getProductById = (id) => {
  return mockProducts.find((p) => p.id === id);
};

export const getCategoryById = (id) => {
  return mockCategories.find((c) => c.id === id);
};

export const getProcurementById = (id) => {
  return mockProcurements.find((p) => p.id === id);
};

export const getDiscountById = (id) => {
  return mockDiscounts.find((d) => d.id === id);
};

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date helper
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
