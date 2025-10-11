import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Mock user data
  const [userProfile, setUserProfile] = useState({
    name: 'Budi Customer',
    email: 'budi.customer@email.com',
    phone: '08123456789',
    bio: 'Suka belanja produk segar untuk keluarga',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: 'Jl. Mawar No. 123, Jakarta Selatan 12560',
    joinDate: '2024-01-15',
    avatar: '/api/placeholder/150/150',
    isVerified: true
  });

  const [formData, setFormData] = useState({ ...userProfile });

  // Mock cart data
  const cartItems = [
    {
      id: 1,
      name: 'Bayam Organik',
      price: 8000,
      quantity: 2,
      image: '/api/placeholder/80/80',
      seller: 'Pak Budi Farm'
    },
    {
      id: 2, 
      name: 'Tomat Cherry',
      price: 15000,
      quantity: 1,
      image: '/api/placeholder/80/80',
      seller: 'Bu Sari'
    }
  ];

  // Mock vouchers
  const userVouchers = [
    {
      id: 1,
      title: 'Diskon 20% Fresh Market',
      description: 'Minimal belanja Rp 100.000',
      discount: '20%',
      expiry: '2024-10-30',
      code: 'FRESH20',
      status: 'active'
    },
    {
      id: 2,
      title: 'Gratis Ongkir',
      description: 'Untuk semua produk',
      discount: 'Free Ship',
      expiry: '2024-11-15',
      code: 'FREESHIP',
      status: 'active'
    },
    {
      id: 3,
      title: 'Cashback 50%',
      description: 'Maksimal Rp 25.000',
      discount: '50%',
      expiry: '2024-09-30',
      code: 'CASH50',
      status: 'expired'
    }
  ];

  // Mock favorites
  const favoriteProducts = [
    {
      id: 1,
      name: 'Bayam Organik',
      price: 8000,
      image: '/api/placeholder/120/120',
      rating: 4.8,
      seller: 'Pak Budi Farm'
    },
    {
      id: 2,
      name: 'Salmon Norway',
      price: 180000,
      image: '/api/placeholder/120/120', 
      rating: 4.9,
      seller: 'Ocean Fresh'
    },
    {
      id: 3,
      name: 'Apel Fuji',
      price: 25000,
      image: '/api/placeholder/120/120',
      rating: 4.7,
      seller: 'Fresh Fruit Co'
    }
  ];

  // Mock order history with tracking
  const orderHistory = [
    {
      id: 'BT241008001',
      date: '2024-10-08',
      items: [
        { name: 'Bayam Organik', price: 8000, qty: 2, image: '/api/placeholder/60/60' },
        { name: 'Tomat Cherry', price: 15000, qty: 1, image: '/api/placeholder/60/60' }
      ],
      total: 31000,
      status: 'delivered',
      trackingNumber: 'BT24100801',
      deliveryDate: '2024-10-09',
      courier: 'GoSend',
      rating: 5,
      canReview: false,
      trackingSteps: [
        { status: 'ordered', time: '2024-10-08 09:00', desc: 'Pesanan dikonfirmasi' },
        { status: 'packed', time: '2024-10-08 14:30', desc: 'Pesanan dikemas' },
        { status: 'shipped', time: '2024-10-08 16:45', desc: 'Dalam perjalanan' },
        { status: 'delivered', time: '2024-10-09 08:15', desc: 'Pesanan sampai' }
      ]
    },
    {
      id: 'BT241005001',
      date: '2024-10-05',
      items: [
        { name: 'Daging Sapi Premium', price: 120000, qty: 1, image: '/api/placeholder/60/60' },
        { name: 'Bawang Merah', price: 28000, qty: 1, image: '/api/placeholder/60/60' }
      ],
      total: 148000,
      status: 'delivered',
      trackingNumber: 'BT24100501',
      deliveryDate: '2024-10-06',
      courier: 'AnterAja',
      rating: 4,
      canReview: false
    },
    {
      id: 'BT241010001',
      date: '2024-10-10',
      items: [
        { name: 'Salmon Norway', price: 180000, qty: 1, image: '/api/placeholder/60/60' }
      ],
      total: 180000,
      status: 'shipped',
      trackingNumber: 'BT24101001',
      estimatedDelivery: '2024-10-12',
      courier: 'JNT Express',
      rating: null,
      canReview: false,
      trackingSteps: [
        { status: 'ordered', time: '2024-10-10 10:30', desc: 'Pesanan dikonfirmasi' },
        { status: 'packed', time: '2024-10-10 15:20', desc: 'Pesanan dikemas' },
        { status: 'shipped', time: '2024-10-11 09:00', desc: 'Dalam perjalanan ke Jakarta' }
      ]
    },
    {
      id: 'BT241009001', 
      date: '2024-10-09',
      items: [
        { name: 'Paket Sayuran Sehat', price: 25000, qty: 1, image: '/api/placeholder/60/60' }
      ],
      total: 25000,
      status: 'processing',
      trackingNumber: 'BT24100901',
      estimatedDelivery: '2024-10-11',
      courier: 'Kurir Toko',
      rating: null,
      canReview: false,
      trackingSteps: [
        { status: 'ordered', time: '2024-10-09 14:15', desc: 'Pesanan diterima' },
        { status: 'processing', time: '2024-10-09 16:30', desc: 'Sedang diproses' }
      ]
    }
  ];

  // Settings data
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      sms: false
    },
    privacy: {
      showProfile: true,
      showActivity: false,
      allowMessages: true
    },
    delivery: {
      defaultAddress: 'home',
      preferredTime: 'morning'
    }
  });

  // Preferences data
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    deliveryTime: 'morning',
    favoriteCategories: ['sayuran', 'buah-buahan']
  });

  // User stats data
  const userStats = {
    totalOrders: 24,
    totalSpent: 1250000,
    favoriteProduct: 15,
    loyaltyPoints: 2450
  };

  // Help center topics
  const helpTopics = [
    { icon: '📦', title: 'Cara Berbelanja', desc: 'Panduan lengkap berbelanja di BaleTani' },
    { icon: '🚚', title: 'Pengiriman & Ongkir', desc: 'Info pengiriman dan biaya ongkos kirim' },
    { icon: '💳', title: 'Pembayaran', desc: 'Metode pembayaran yang tersedia' },
    { icon: '↩️', title: 'Pengembalian', desc: 'Kebijakan return dan refund' },
    { icon: '❓', title: 'FAQ', desc: 'Pertanyaan yang sering diajukan' },
    { icon: '📞', title: 'Hubungi Kami', desc: 'Customer service dan kontak' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    // Simulate API call
    setTimeout(() => {
      setUserProfile({ ...formData });
      setIsEditingProfile(false);
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handlePhotoUpload = () => {
    setIsUploadingPhoto(true);
    // Simulate photo upload
    setTimeout(() => {
      setIsUploadingPhoto(false);
      setSaveStatus('photo-success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 2000);
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      // Implement logout logic
      alert('Logout berhasil!');
    }
  };

  const handleSettingChange = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'shipped': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Selesai';
      case 'processing': return 'Diproses';
      case 'shipped': return 'Dikirim';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Main profile menu items
  const profileMenuItems = [
    { id: 'orders', icon: '📦', title: 'Pesanan Saya', subtitle: `${orderHistory.length} pesanan`, hasNotif: true },
    { id: 'cart', icon: '🛒', title: 'Keranjang', subtitle: `${cartItems.length} item`, hasNotif: false },
    { id: 'favorites', icon: '❤️', title: 'Favorit Saya', subtitle: `${favoriteProducts.length} produk`, hasNotif: false },
    { id: 'vouchers', icon: '🎫', title: 'Voucher Saya', subtitle: `${userVouchers.filter(v => v.status === 'active').length} aktif`, hasNotif: false },
    { id: 'help', icon: '🆘', title: 'Pusat Bantuan', subtitle: 'FAQ & Customer Service', hasNotif: false },
    { id: 'settings', icon: '⚙️', title: 'Pengaturan', subtitle: 'Notifikasi & Privasi', hasNotif: false }
  ];

  const renderContent = () => {
    if (activeSection === 'main') {
      return (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  onClick={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 bg-green-500 text-white p-2 rounded-full text-xs hover:bg-green-600 transition-colors"
                >
                  {isUploadingPhoto ? '⏳' : '📷'}
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-800">{userProfile.name}</h2>
                  {userProfile.isVerified && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Terverifikasi
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{userProfile.bio}</p>
                <p className="text-sm text-gray-500">Bergabung {new Date(userProfile.joinDate).toLocaleDateString('id-ID')}</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                ✏️ Edit
              </button>
            </div>
          </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-green-700 font-medium">
                Profile berhasil diperbarui!
              </span>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">👤 Informasi Profile</h3>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saveStatus === 'saving'}
                  className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
                    saveStatus === 'saving'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {saveStatus === 'saving' ? '💾 Menyimpan...' : '💾 Simpan'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setFormData({ ...userProfile });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  ❌ Batal
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  isEditingProfile
                    ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  isEditingProfile
                    ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditingProfile}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  isEditingProfile
                    ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membership
              </label>
              <input
                type="text"
                value={userProfile.membership}
                disabled
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Pengiriman
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditingProfile}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  isEditingProfile
                    ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{userStats.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Pesanan</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              Rp {userStats.totalSpent.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-600">Total Belanja</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-lg font-bold text-purple-600 mb-2">{userStats.favoriteProduct}</div>
            <div className="text-sm text-gray-600">Produk Favorit</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{userStats.loyaltyPoints}</div>
            <div className="text-sm text-gray-600">Loyalty Points</div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'orders') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">📦 Riwayat Pesanan</h3>
          <div className="text-sm text-gray-500">
            {orderHistory?.length || 0} pesanan total
          </div>
        </div>

        {orderHistory && orderHistory.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-1">Order #{order.id}</h4>
                <p className="text-sm text-gray-500">📅 {new Date(order.date).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            <div className="border-l-4 border-green-400 pl-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Items:</div>
              <div className="space-y-1">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="text-gray-700">• {item.name} x{item.qty}</div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600">
                Rp {order.total.toLocaleString('id-ID')}
              </div>
              
              <div className="flex items-center space-x-4">
                {order.rating && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <span className="text-yellow-500">{renderStars(order.rating)}</span>
                  </div>
                )}
                
                <div className="space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors">
                    Detail
                  </button>
                  {order.status === 'delivered' && !order.rating && (
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors">
                      Beri Rating
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors">
                      Pesan Lagi
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeSection === 'preferences') {
    return (
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-gray-800">⚙️ Pengaturan Preferensi</h3>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6">🔔 Notifikasi</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800">Email Notifications</div>
                <div className="text-sm text-gray-600">Terima notifikasi via email</div>
              </div>
              <button
                onClick={() => handlePreferenceChange('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800">SMS Notifications</div>
                <div className="text-sm text-gray-600">Terima notifikasi via SMS</div>
              </div>
              <button
                onClick={() => handlePreferenceChange('smsNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.smsNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800">Promotional Emails</div>
                <div className="text-sm text-gray-600">Terima email promo dan penawaran khusus</div>
              </div>
              <button
                onClick={() => handlePreferenceChange('promotionalEmails')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.promotionalEmails ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6">🚚 Pengiriman</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Waktu Pengiriman Preferensi
            </label>
            <select
              value={preferences.deliveryTime}
              onChange={(e) => setPreferences(prev => ({ ...prev, deliveryTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="morning">Pagi (06:00 - 12:00)</option>
              <option value="afternoon">Siang (12:00 - 18:00)</option>
              <option value="evening">Sore (18:00 - 21:00)</option>
              <option value="anytime">Kapan Saja</option>
            </select>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6">❤️ Kategori Favorit</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'sayuran', name: 'Sayuran', icon: '🥬' },
              { id: 'buah-buahan', name: 'Buah-buahan', icon: '🍎' },
              { id: 'daging', name: 'Daging', icon: '🥩' },
              { id: 'seafood', name: 'Seafood', icon: '🐟' },
              { id: 'dairy', name: 'Dairy', icon: '🥛' },
              { id: 'rempah', name: 'Rempah', icon: '🌶️' },
              { id: 'beras', name: 'Beras', icon: '🌾' },
              { id: 'frozen', name: 'Frozen', icon: '🧊' }
            ].map(category => (
              <div
                key={category.id}
                onClick={() => {
                  const newFavorites = preferences.favoriteCategories.includes(category.id)
                    ? preferences.favoriteCategories.filter(id => id !== category.id)
                    : [...preferences.favoriteCategories, category.id];
                  setPreferences(prev => ({ ...prev, favoriteCategories: newFavorites }));
                }}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                  preferences.favoriteCategories.includes(category.id)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            👤 Profile Saya
          </h1>
          <p className="text-xl text-gray-600">
            Kelola informasi profile dan preferensi Anda
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-2 mb-12">
          <button
            onClick={() => setActiveSection('main')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeSection === 'main'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeSection === 'orders'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            📦 Pesanan
          </button>
          <button
            onClick={() => setActiveSection('preferences')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              activeSection === 'preferences'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            ⚙️ Preferensi
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;