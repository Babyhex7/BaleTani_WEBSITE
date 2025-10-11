// Mock data untuk admin dashboard dan management
export const mockDashboardStats = {
  todayOrders: 12,
  totalSales: 2450000,
  pendingOrders: 5,
  lowStock: 3,
  ordersGrowth: 15.2,
  salesGrowth: 8.7,
  pendingGrowth: -12.3,
  stockGrowth: -25.0
};

export const mockRecentOrders = [
  {
    id: 1,
    customer: "Budi Santoso",
    items: "Bayam Segar (3 ikat), Tomat Cherry (2kg)",
    total: 54000,
    status: "pending",
    time: "2 jam yang lalu"
  },
  {
    id: 2,
    customer: "Siti Rahayu",
    items: "Apel Fuji (1kg), Pisang Cavendish (2 sisir)",
    total: 59000,
    status: "completed",
    time: "4 jam yang lalu"
  },
  {
    id: 3,
    customer: "Ahmad Wijaya",
    items: "Daging Sapi Premium (500g), Salmon (300g)",
    total: 145500,
    status: "processing",
    time: "6 jam yang lalu"
  },
  {
    id: 4,
    customer: "Rina Permata",
    items: "Telur Ayam Kampung (2 rak), Ayam Kampung (1 ekor)",
    total: 95000,
    status: "completed",
    time: "1 hari yang lalu"
  },
  {
    id: 5,
    customer: "Joko Susilo",
    items: "Kangkung Hidroponik (5 ikat), Bayam (2 ikat)",
    total: 41000,
    status: "pending",
    time: "1 hari yang lalu"
  }
];

export const mockLowStockProducts = [
  {
    id: 1,
    name: "Pisang Cavendish",
    category: "Buah-buahan",
    currentStock: 8,
    minStock: 15,
    status: "warning"
  },
  {
    id: 2,
    name: "Ikan Salmon Segar",
    category: "Seafood", 
    currentStock: 0,
    minStock: 10,
    status: "critical"
  },
  {
    id: 3,
    name: "Kangkung Hidroponik",
    category: "Sayuran",
    currentStock: 5,
    minStock: 20,
    status: "critical"
  }
];

export const mockInventoryData = [
  {
    id: 1,
    name: "Bayam Segar Organik",
    category: "Sayuran",
    stock: 50,
    price: 8000,
    status: "in-stock",
    supplier: "Kebun Segar Bogor",
    lastUpdated: "2024-10-10"
  },
  {
    id: 2,
    name: "Tomat Cherry Premium",
    category: "Sayuran",
    stock: 30,
    price: 15000,
    status: "in-stock",
    supplier: "Fresh Farm Cianjur",
    lastUpdated: "2024-10-09"
  },
  {
    id: 3,
    name: "Apel Fuji Import",
    category: "Buah-buahan",
    stock: 25,
    price: 35000,
    status: "in-stock",
    supplier: "Premium Fruit Co",
    lastUpdated: "2024-10-08"
  },
  {
    id: 4,
    name: "Pisang Cavendish",
    category: "Buah-buahan",
    stock: 8,
    price: 12000,
    status: "low-stock",
    supplier: "Kebun Pisang Lampung",
    lastUpdated: "2024-10-07"
  },
  {
    id: 5,
    name: "Daging Sapi Premium",
    category: "Daging & Unggas",
    stock: 15,
    price: 120000,
    status: "in-stock",
    supplier: "Premium Meat Market",
    lastUpdated: "2024-10-06"
  },
  {
    id: 6,
    name: "Ikan Salmon Segar",
    category: "Seafood",
    stock: 0,
    price: 85000,
    status: "out-of-stock",
    supplier: "Ocean Fresh Seafood",
    lastUpdated: "2024-10-05"
  },
  {
    id: 7,
    name: "Ayam Kampung",
    category: "Daging & Unggas",
    stock: 12,
    price: 65000,
    status: "in-stock",
    supplier: "Peternakan Sehat",
    lastUpdated: "2024-10-04"
  },
  {
    id: 8,
    name: "Telur Ayam Kampung",
    category: "Susu & Telur",
    stock: 45,
    price: 2500,
    status: "in-stock",
    supplier: "Peternakan Organik",
    lastUpdated: "2024-10-03"
  }
];

export const mockUserData = [
  {
    id: 1,
    fullName: "Budi Santoso",
    email: "budi@customer.com",
    role: "customer",
    status: "active",
    joinDate: "2024-08-15",
    totalOrders: 8,
    totalSpent: 650000,
    lastLogin: "2024-10-10"
  },
  {
    id: 2,
    fullName: "Siti Rahayu",
    email: "siti@customer.com", 
    role: "customer",
    status: "active",
    joinDate: "2024-07-20",
    totalOrders: 12,
    totalSpent: 890000,
    lastLogin: "2024-10-09"
  },
  {
    id: 3,
    fullName: "Ahmad Wijaya",
    email: "ahmad@customer.com",
    role: "customer", 
    status: "active",
    joinDate: "2024-09-01",
    totalOrders: 5,
    totalSpent: 430000,
    lastLogin: "2024-10-08"
  },
  {
    id: 4,
    fullName: "Rina Staff",
    email: "rina@baletani.com",
    role: "staff",
    status: "active",
    joinDate: "2024-06-10",
    totalOrders: 0,
    totalSpent: 0,
    lastLogin: "2024-10-10"
  },
  {
    id: 5,
    fullName: "Joko Customer",
    email: "joko@customer.com",
    role: "customer",
    status: "inactive",
    joinDate: "2024-05-15",
    totalOrders: 2,
    totalSpent: 180000,
    lastLogin: "2024-09-20"
  }
];

export const mockUserStats = {
  totalUsers: 24,
  totalCustomers: 21,
  totalStaff: 2,
  totalAdmin: 1,
  newUsersThisMonth: 5,
  activeUsers: 18,
  inactiveUsers: 6
};

export const mockAdminServices = {
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      data: mockDashboardStats
    };
  },

  getRecentOrders: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      data: mockRecentOrders
    };
  },

  getLowStockProducts: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: mockLowStockProducts
    };
  },

  getInventoryData: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    let data = [...mockInventoryData];
    
    // Filter by category
    if (params.category && params.category !== 'all') {
      data = data.filter(item => item.category.toLowerCase() === params.category.toLowerCase());
    }
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      data = data.filter(item => item.status === params.status);
    }
    
    // Search by name
    if (params.search) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: data,
      totalItems: data.length
    };
  },

  getUserData: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let data = [...mockUserData];
    
    // Filter by role
    if (params.role && params.role !== 'all') {
      data = data.filter(user => user.role === params.role);
    }
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      data = data.filter(user => user.status === params.status);
    }
    
    // Search by name or email
    if (params.search) {
      data = data.filter(user => 
        user.fullName.toLowerCase().includes(params.search.toLowerCase()) ||
        user.email.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: data,
      stats: mockUserStats
    };
  },

  updateUserStatus: async (userId, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUserData.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUserData[userIndex].status = status;
    }
    
    return {
      success: true,
      message: `Status user berhasil diubah menjadi ${status}`
    };
  },

  deleteUser: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUserData.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUserData.splice(userIndex, 1);
    }
    
    return {
      success: true,
      message: "User berhasil dihapus"
    };
  },

  updateInventoryStock: async (productId, newStock) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const productIndex = mockInventoryData.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      mockInventoryData[productIndex].stock = newStock;
      
      // Update status based on stock
      if (newStock === 0) {
        mockInventoryData[productIndex].status = 'out-of-stock';
      } else if (newStock <= 10) {
        mockInventoryData[productIndex].status = 'low-stock';
      } else {
        mockInventoryData[productIndex].status = 'in-stock';
      }
      
      mockInventoryData[productIndex].lastUpdated = new Date().toISOString().split('T')[0];
    }
    
    return {
      success: true,
      message: "Stok berhasil diperbarui"
    };
  },

  // CRUD Operations for Products
  createProduct: async (productData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newProduct = {
      id: Date.now(), // Generate unique ID
      ...productData,
      status: productData.stock > 10 ? 'in-stock' : productData.stock > 0 ? 'low-stock' : 'out-of-stock',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    mockInventoryData.push(newProduct);
    
    return {
      success: true,
      data: newProduct,
      message: "Produk berhasil ditambahkan"
    };
  },

  updateProduct: async (productId, productData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const productIndex = mockInventoryData.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      mockInventoryData[productIndex] = {
        ...mockInventoryData[productIndex],
        ...productData,
        status: productData.stock > 10 ? 'in-stock' : productData.stock > 0 ? 'low-stock' : 'out-of-stock',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      return {
        success: true,
        data: mockInventoryData[productIndex],
        message: "Produk berhasil diperbarui"
      };
    }
    
    throw new Error("Produk tidak ditemukan");
  },

  deleteProduct: async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const productIndex = mockInventoryData.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      const deletedProduct = mockInventoryData.splice(productIndex, 1)[0];
      
      return {
        success: true,
        data: deletedProduct,
        message: "Produk berhasil dihapus"
      };
    }
    
    throw new Error("Produk tidak ditemukan");
  },

  getProductById: async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const product = mockInventoryData.find(product => product.id === productId);
    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }
    
    return {
      success: true,
      data: product
    };
  },

  // CRUD Operations for Users
  createUser: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser = {
      id: Date.now(),
      ...userData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      lastLogin: 'Belum pernah login'
    };
    
    mockUserData.push(newUser);
    
    return {
      success: true,
      data: newUser,
      message: "User berhasil ditambahkan"
    };
  },

  updateUser: async (userId, userData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userIndex = mockUserData.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      mockUserData[userIndex] = {
        ...mockUserData[userIndex],
        ...userData
      };
      
      return {
        success: true,
        data: mockUserData[userIndex],
        message: "User berhasil diperbarui"
      };
    }
    
    throw new Error("User tidak ditemukan");
  },

  getUserById: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUserData.find(user => user.id === userId);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }
    
    return {
      success: true,
      data: user
    };
  }
};