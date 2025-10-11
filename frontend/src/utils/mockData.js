// Mock data untuk demo frontend tanpa backend
export const mockUsers = {
  admin: {
    id: 1,
    fullName: "Ahmad Admin",
    email: "admin@baletani.com",
    role: "admin"
  },
  customer: {
    id: 2,
    fullName: "Budi Customer", 
    email: "customer@baletani.com",
    role: "customer"
  }
};

export const mockProducts = [
  {
    id: 1,
    name: "Bayam Segar Organik",
    description: "Bayam organik segar langsung dari kebun, kaya akan zat besi dan vitamin A, C, K",
    price: 8000,
    originalPrice: 10000,
    stock: 50,
    category: { name: "Sayuran", slug: "sayuran" },
    image: "/api/placeholder/300/200",
    seller: "Kebun Segar Bogor",
    location: "Bogor",
    unit: "ikat",
    discount: 20,
    rating: 4.8,
    reviews: 45,
    specifications: {
      freshness: "Dipetik pagi hari",
      origin: "Bogor, Jawa Barat",
      certification: "Organik Tersertifikasi"
    }
  },
  {
    id: 2,
    name: "Tomat Cherry Premium",
    description: "Tomat cherry manis dan segar, cocok untuk salad dan garnish makanan sehat",
    price: 15000,
    originalPrice: 18000,
    stock: 30,
    category: { name: "Sayuran", slug: "sayuran" },
    image: "/api/placeholder/300/200",
    seller: "Fresh Farm Cianjur",
    location: "Cianjur",
    unit: "kg",
    discount: 17,
    rating: 4.9,
    reviews: 67,
    reviews: [
      {
        id: 2,
        user: "Pak Joko",
        rating: 5,
        comment: "Tomat cherry termanis yang pernah saya beli!"
      }
    ],
    specifications: {
      sweetness: "High Brix Level",
      origin: "Cianjur, Jawa Barat",
      size: "Premium Grade"
    }
  },
  {
    id: 3,
    name: "Apel Fuji Import",
    description: "Apel Fuji import premium dari Jepang, manis, renyah, dan kaya vitamin C",
    price: 35000,
    originalPrice: 45000,
    stock: 25,
    category: { name: "Buah-buahan", slug: "buah" },
    image: "/api/placeholder/300/200",
    seller: "Premium Fruit Co",
    location: "Jakarta",
    unit: "kg",
    discount: 22,
    rating: 4.9,
    reviews: 32,
    reviews: [
      {
        id: 3,
        user: "Ibu Sari",
        rating: 5,
        comment: "Apel yang sangat manis dan renyah, anak-anak suka sekali"
      }
    ],
    specifications: {
      origin: "Fuji, Japan",
      grade: "Premium A",
      sweetness: "14-16 Brix"
    }
  },
  {
    id: 4,
    name: "Daging Sapi Premium",
    description: "Daging sapi segar premium pilihan terbaik, cocok untuk steak dan rendang",
    price: 120000,
    originalPrice: 140000,
    stock: 15,
    category: { name: "Daging & Unggas", slug: "daging" },
    image: "/api/placeholder/300/200",
    seller: "Premium Meat Market",
    location: "Jakarta",
    unit: "kg",
    discount: 14,
    rating: 4.7,
    reviews: 28,
    reviews: [
      {
        id: 4,
        user: "Chef Anton",
        rating: 5,
        comment: "Kualitas daging sangat baik, empuk dan fresh"
      }
    ],
    specifications: {
      cut: "Sirloin",
      grade: "Premium",
      freshness: "Dipotong hari ini"
    }
  },
  {
    id: 5,
    name: "Ikan Salmon Segar",
    description: "Ikan salmon segar import berkualitas tinggi, kaya omega-3 dan protein",
    price: 85000,
    originalPrice: 100000,
    stock: 20,
    category: { name: "Seafood", slug: "seafood" },
    image: "/api/placeholder/300/200",
    seller: "Ocean Fresh Seafood",
    location: "Jakarta",
    unit: "kg",
    discount: 15,
    rating: 4.8,
    reviews: 41,
    reviews: [
      {
        id: 5,
        user: "Bu Dewi",
        rating: 5,
        comment: "Salmon sangat segar, tidak amis sama sekali!"
      }
    ],
    specifications: {
      origin: "Norway",
      freshness: "Air Flown Daily",
      omega3: "High Content"
    }
  }
];

export const mockCategories = [
  { id: 1, name: "Sayuran", slug: "sayuran", description: "Sayuran segar dan organik langsung dari petani" },
  { id: 2, name: "Buah-buahan", slug: "buah", description: "Buah-buahan segar premium pilihan terbaik" },
  { id: 3, name: "Daging & Unggas", slug: "daging", description: "Daging segar dan unggas berkualitas tinggi" },
  { id: 4, name: "Seafood", slug: "seafood", description: "Ikan dan seafood segar hasil tangkapan terbaik" },
  { id: 5, name: "Susu & Telur", slug: "dairy", description: "Produk susu dan telur segar dari peternakan lokal" }
];

export const mockAuth = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === "admin@baletani.com" && credentials.password === "admin123") {
      return {
        user: mockUsers.admin,
        token: "mock-admin-token",
        message: "Login berhasil!"
      };
    } else if (credentials.email === "customer@baletani.com" && credentials.password === "customer123") {
      return {
        user: mockUsers.customer,
        token: "mock-customer-token", 
        message: "Login berhasil!"
      };
    } else {
      throw new Error("Email atau password salah");
    }
  },

  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser = {
      id: Date.now(),
      ...userData,
      role: "customer"
    };
    
    return {
      success: true,
      data: {
        user: newUser,
        token: "mock-new-user-token"
      },
      message: "Registrasi berhasil!"
    };
  }
};