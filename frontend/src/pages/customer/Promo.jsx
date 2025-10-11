import React, { useState, useEffect } from 'react';

const Promo = () => {
  const [activeTab, setActiveTab] = useState('flash-sale');
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer untuk flash sale
  useEffect(() => {
    const targetTime = new Date();
    targetTime.setHours(23, 59, 59, 999); // Set ke akhir hari

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetTime - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = [
    {
      id: 1,
      name: "Bayam Organik Premium",
      originalPrice: 12000,
      promoPrice: 8000,
      discount: 33,
      stock: 25,
      sold: 18,
      image: "/api/placeholder/300/200",
      category: "Sayuran"
    },
    {
      id: 2,
      name: "Apel Fuji Impor",
      originalPrice: 35000,
      promoPrice: 25000,
      discount: 29,
      stock: 15,
      sold: 8,
      image: "/api/placeholder/300/200",
      category: "Buah"
    },
    {
      id: 3,
      name: "Daging Sapi Premium",
      originalPrice: 150000,
      promoPrice: 120000,
      discount: 20,
      stock: 10,
      sold: 7,
      image: "/api/placeholder/300/200",
      category: "Daging"
    },
    {
      id: 4,
      name: "Salmon Fresh Norway",
      originalPrice: 200000,
      promoPrice: 150000,
      discount: 25,
      stock: 8,
      sold: 3,
      image: "/api/placeholder/300/200",
      category: "Seafood"
    }
  ];

  const bundleDeals = [
    {
      id: 1,
      name: "Paket Sayuran Sehat",
      description: "Bayam + Kangkung + Sawi + Tomat Cherry",
      originalPrice: 35000,
      bundlePrice: 25000,
      discount: 29,
      items: ["Bayam Segar", "Kangkung Organik", "Sawi Hijau", "Tomat Cherry"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 2,
      name: "Paket Buah Tropis",
      description: "Mangga + Pisang + Pepaya + Jeruk",
      originalPrice: 65000,
      bundlePrice: 45000,
      discount: 31,
      items: ["Mangga Harum Manis", "Pisang Cavendish", "Pepaya California", "Jeruk Medan"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      name: "Paket BBQ Special",
      description: "Daging Sapi + Sosis + Sayuran + Bumbu",
      originalPrice: 185000,
      bundlePrice: 150000,
      discount: 19,
      items: ["Daging Sapi 500g", "Sosis Bratwurst", "Mix Vegetables", "Bumbu BBQ"],
      image: "/api/placeholder/400/250"
    }
  ];

  const membershipOffers = [
    {
      id: 1,
      tier: "Silver Member",
      discount: "5%",
      benefits: ["Diskon 5% semua produk", "Free ongkir min. 100k", "Priority customer service"],
      price: "Gratis",
      color: "from-gray-400 to-gray-600"
    },
    {
      id: 2,
      tier: "Gold Member",
      discount: "10%",
      benefits: ["Diskon 10% semua produk", "Free ongkir min. 50k", "Early access to sales", "Monthly fresh box"],
      price: "Rp 50.000/bulan",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      id: 3,
      tier: "Platinum Member",
      discount: "15%",
      benefits: ["Diskon 15% semua produk", "Free ongkir tanpa minimal", "Personal shopper", "Premium fresh box", "Exclusive events"],
      price: "Rp 150.000/bulan",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const weeklyDeals = [
    {
      day: "Senin",
      title: "Manic Monday Vegetables",
      description: "Diskon 20% semua sayuran segar",
      emoji: "🥬",
      discount: "20%"
    },
    {
      day: "Selasa",
      title: "Tropical Tuesday",
      description: "Buy 2 Get 1 semua buah tropis",
      emoji: "🥭",
      discount: "B2G1"
    },
    {
      day: "Rabu",
      title: "Wonderful Wednesday Meat",
      description: "Diskon 15% daging sapi & ayam",
      emoji: "🥩",
      discount: "15%"
    },
    {
      day: "Kamis",
      title: "Seafood Thursday",
      description: "Fresh from ocean, diskon 25%",
      emoji: "🐟",
      discount: "25%"
    },
    {
      day: "Jumat",
      title: "Fresh Friday Bundle",
      description: "Paket hemat mix kategori",
      emoji: "📦",
      discount: "30%"
    },
    {
      day: "Sabtu",
      title: "Saturday Surprise",
      description: "Mystery discount hingga 40%",
      emoji: "🎁",
      discount: "40%"
    },
    {
      day: "Minggu",
      title: "Sunday Family Pack",
      description: "Paket keluarga super hemat",
      emoji: "👨‍👩‍👧‍👦",
      discount: "35%"
    }
  ];

  const tabContent = {
    'flash-sale': (
      <div className="space-y-8">
        {/* Flash Sale Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">⚡ FLASH SALE ⚡</h2>
          <p className="text-xl mb-6">Diskon hingga 50% - Terbatas!</p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 min-w-[80px]">
                <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-sm">Jam</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 min-w-[80px]">
                <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-sm">Menit</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4 min-w-[80px]">
                <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-sm">Detik</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Sale Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashSaleProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{product.discount}%
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl font-bold text-red-500">
                    Rp {product.promoPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    Rp {product.originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Terjual: {product.sold}</span>
                    <span>Stok: {product.stock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors">
                  🛒 Beli Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'bundle-deals': (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">📦 Paket Hemat</h2>
          <p className="text-xl text-gray-600">Beli paket, hemat lebih banyak!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {bundleDeals.map(bundle => (
            <div key={bundle.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-2 rounded-full">
                    Hemat {bundle.discount}%
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{bundle.name}</h3>
                <p className="text-gray-600 mb-4">{bundle.description}</p>
                
                <div className="space-y-2 mb-6">
                  {bundle.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-3xl font-bold text-green-600">
                      Rp {bundle.bundlePrice.toLocaleString('id-ID')}
                    </span>
                    <div className="text-sm text-gray-500 line-through">
                      Rp {bundle.originalPrice.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-500">
                      Hemat Rp {(bundle.originalPrice - bundle.bundlePrice).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors">
                  🛒 Ambil Paket Ini
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    'membership': (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">👑 Membership Eksklusif</h2>
          <p className="text-xl text-gray-600">Bergabunglah dan nikmati keuntungan lebih!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {membershipOffers.map(offer => (
            <div key={offer.id} className={`relative bg-gradient-to-br ${offer.color} rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{offer.tier}</h3>
                <div className="text-5xl font-bold mb-2">{offer.discount}</div>
                <div className="text-sm opacity-90">Diskon untuk semua produk</div>
              </div>

              <div className="space-y-3 mb-8">
                {offer.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-yellow-300">✨</span>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold">{offer.price}</div>
              </div>

              <button className="w-full bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                {offer.id === 1 ? 'Gratis Daftar' : 'Upgrade Sekarang'}
              </button>

              {offer.id === 2 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                    POPULER
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ),

    'weekly-deals': (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">📅 Promo Harian</h2>
          <p className="text-xl text-gray-600">Setiap hari ada kejutan spesial!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weeklyDeals.map((deal, index) => {
            const today = new Date().getDay();
            const dealDay = (index + 1) % 7;
            const isToday = today === dealDay;
            
            return (
              <div 
                key={deal.day} 
                className={`p-6 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-2 ${
                  isToday 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl scale-105' 
                    : 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="text-4xl mb-3">{deal.emoji}</div>
                <h3 className={`font-bold mb-2 ${isToday ? 'text-white' : 'text-gray-800'}`}>
                  {deal.day}
                </h3>
                <div className={`text-2xl font-bold mb-2 ${isToday ? 'text-yellow-200' : 'text-green-600'}`}>
                  {deal.discount}
                </div>
                <h4 className={`font-semibold text-sm mb-2 ${isToday ? 'text-white' : 'text-gray-700'}`}>
                  {deal.title}
                </h4>
                <p className={`text-xs ${isToday ? 'text-gray-100' : 'text-gray-600'}`}>
                  {deal.description}
                </p>
                {isToday && (
                  <div className="mt-4">
                    <span className="bg-yellow-400 text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
                      HARI INI!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎉 Promo Spesial BaleTani
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Jangan lewatkan penawaran terbaik untuk produk segar berkualitas tinggi. 
            Hemat lebih banyak, makan lebih sehat!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center space-x-2 mb-12">
          <button
            onClick={() => setActiveTab('flash-sale')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'flash-sale'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            ⚡ Flash Sale
          </button>
          <button
            onClick={() => setActiveTab('bundle-deals')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'bundle-deals'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            📦 Paket Hemat
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'membership'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            👑 Membership
          </button>
          <button
            onClick={() => setActiveTab('weekly-deals')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeTab === 'weekly-deals'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            📅 Promo Harian
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {tabContent[activeTab]}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">📧 Jangan Lewatkan Promo Terbaru!</h3>
          <p className="text-lg mb-6">Daftarkan email Anda dan dapatkan notifikasi promo eksklusif</p>
          <div className="flex justify-center">
            <div className="flex max-w-md w-full">
              <input
                type="email"
                placeholder="Masukkan email Anda..."
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-800 focus:outline-none"
              />
              <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-6 py-3 rounded-r-lg transition-colors">
                Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promo;