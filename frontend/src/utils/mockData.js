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
    description: "Bayam organik segar yang dipetik langsung dari kebun tanpa penggunaan pestisida kimia. Setiap ikat bayam dipilih dengan cermat untuk memastikan kualitas terbaik. Bayam ini kaya akan zat besi yang sangat baik untuk mencegah anemia, vitamin A untuk kesehatan mata, vitamin C untuk meningkatkan daya tahan tubuh, dan vitamin K untuk kesehatan tulang. Cocok untuk berbagai masakan seperti sayur bening, tumis bayam, smoothie hijau, atau campuran salad. Bayam ini sudah dicuci bersih dan siap untuk dimasak. Dengan tekstur yang renyah dan rasa yang segar, bayam organik ini menjadi pilihan sempurna untuk keluarga yang peduli kesehatan. Kemasan higienis memastikan kesegaran terjaga hingga sampai ke tangan Anda.",
    price: 8000,
    originalPrice: 10000,
    stock: 50,
    category: { name: "Sayuran", slug: "sayuran" },
    image: "/api/placeholder/300/200",
    location: "Bogor",
    unit: "ikat",
    discount: 20
  },
  {
    id: 2,
    name: "Tomat Cherry Premium",
    description: "Tomat cherry premium dengan rasa manis alami yang sempurna untuk berbagai kebutuhan kuliner Anda. Setiap buah tomat cherry memiliki ukuran yang seragam dengan warna merah cerah yang menandakan kematangan optimal. Teksturnya renyah dengan kandungan air yang pas, tidak terlalu berair sehingga cocok untuk salad, pasta, pizza, atau dimakan langsung sebagai camilan sehat. Tomat cherry ini kaya akan likopen, antioksidan kuat yang baik untuk kesehatan jantung dan kulit. Juga mengandung vitamin C tinggi untuk meningkatkan sistem kekebalan tubuh. Kulitnya tipis dan mudah dicerna, dengan rasa manis yang menyegarkan di setiap gigitan. Ideal untuk garnish makanan, bento anak-anak, atau sebagai bahan utama salad buah dan sayur. Dikemas dengan hati-hati untuk menjaga kesegaran dan mencegah kerusakan selama pengiriman.",
    price: 15000,
    originalPrice: 18000,
    stock: 30,
    category: { name: "Sayuran", slug: "sayuran" },
    image: "/api/placeholder/300/200",
    location: "Cianjur",
    unit: "kg",
    discount: 17
  },
  {
    id: 3,
    name: "Apel Fuji Import",
    description: "Apel Fuji import berkualitas premium dengan karakteristik rasa manis alami yang khas. Setiap buah apel memiliki warna merah cerah dengan gradasi kuning yang indah, menandakan tingkat kematangan yang sempurna. Teksturnya sangat renyah dengan kadar air yang pas, memberikan sensasi segar di setiap gigitan. Apel Fuji terkenal dengan kandungan gulanya yang tinggi namun tetap menyehatkan karena kaya akan serat, vitamin C, dan antioksidan. Cocok dikonsumsi langsung sebagai buah segar, dibuat jus, smoothie, salad buah, atau sebagai topping untuk oatmeal dan yogurt. Kulitnya tipis dan bisa dimakan, mengandung banyak nutrisi penting. Ukurannya besar dan seragam, dengan berat rata-rata 200-250 gram per buah. Apel ini disimpan dalam kondisi optimal untuk mempertahankan kerenyahan dan kesegarannya. Sempurna untuk camilan sehat keluarga, bekal anak sekolah, atau oleh-oleh untuk orang terkasih.",
    price: 35000,
    originalPrice: 45000,
    stock: 25,
    category: { name: "Buah-buahan", slug: "buah" },
    image: "/api/placeholder/300/200",
    location: "Jakarta",
    unit: "kg",
    discount: 22
  },
  {
    id: 4,
    name: "Daging Sapi Premium",
    description: "Daging sapi premium kualitas terbaik dengan marbling yang sempurna, memberikan kelembutan dan cita rasa yang luar biasa. Daging ini berasal dari sapi pilihan yang dipelihara dengan standar tinggi untuk memastikan kualitas daging yang konsisten. Teksturnya empuk dengan serat halus, ideal untuk berbagai olahan seperti steak, rendang, semur, sate, atau shabu-shabu. Setiap potongan dipilih dengan cermat dan dipotong sesuai standar butcher profesional. Daging ini kaya akan protein berkualitas tinggi, zat besi, zinc, dan vitamin B12 yang penting untuk kesehatan tubuh. Disimpan dalam suhu optimal sejak pemotongan hingga pengiriman untuk menjaga kesegaran dan kualitas. Cocok untuk acara spesial keluarga, BBQ party, atau memasak menu istimewa di rumah. Kemasan vakum memastikan daging tetap higienis dan tahan lama. Proses penyimpanan yang tepat membuat daging ini mempertahankan kelembutan dan rasa hingga sampai di dapur Anda.",
    price: 120000,
    originalPrice: 140000,
    stock: 15,
    category: { name: "Daging & Unggas", slug: "daging" },
    image: "/api/placeholder/300/200",
    location: "Jakarta",
    unit: "kg",
    discount: 14
  },
  {
    id: 5,
    name: "Ikan Salmon Segar",
    description: "Ikan salmon segar import dengan kualitas premium yang terjamin kesegarannya. Daging salmon berwarna orange cerah dengan tekstur yang kenyal dan lembut, menandakan kesegaran optimal. Salmon ini kaya akan omega-3, asam lemak esensial yang sangat baik untuk kesehatan jantung, otak, dan mengurangi inflamasi dalam tubuh. Juga mengandung protein tinggi, vitamin D, vitamin B12, dan selenium yang penting untuk metabolisme tubuh. Cocok untuk berbagai olahan seperti salmon teriyaki, salmon panggang, sushi, sashimi, salmon mentai, atau salmon steak dengan bumbu favorit Anda. Tidak memiliki bau amis yang menyengat karena penanganan yang tepat sejak penangkapan hingga distribusi. Setiap fillet dipotong dengan presisi untuk memudahkan proses memasak. Dikemas dengan es gel dan styrofoam untuk menjaga suhu dingin selama pengiriman. Ideal untuk menu diet sehat, menu keluarga, atau hidangan spesial di acara penting. Tekstur dagingnya yang lembut membuatnya mudah dimasak dan disukai oleh semua kalangan usia.",
    price: 85000,
    originalPrice: 100000,
    stock: 20,
    category: { name: "Seafood", slug: "seafood" },
    image: "/api/placeholder/300/200",
    location: "Jakarta",
    unit: "kg",
    discount: 15
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