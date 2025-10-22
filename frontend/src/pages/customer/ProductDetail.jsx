import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import productService from '../../services/services_customer/productService';
import ProductCard from '../../components/ui/ProductCard';

/**
 * Halaman Detail Produk - Menampilkan informasi lengkap produk dengan WhatsApp integration
 * Fitur: Image gallery, product info, seller info, reviews, WhatsApp order, quantity selector
 */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(id);
        if (response.data) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        // Fallback to mock data if API fails
        toast.info('Menggunakan data demo');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, navigate]);

  // Old mock product replaced with API call
  const mockProduct = product || {
    id: parseInt(id),
    name: 'Bayam Segar Organik Premium',
    price: 8000,
    originalPrice: 10000,
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    category: 'Sayuran',
    stock: 50,
    discount: 20,
    unit: 'ikat',
    seller: {
      name: 'Pak Budi Santoso',
      location: 'Bogor, Jawa Barat',
      phone: '6285885725027',
      rating: 4.8,
      totalProducts: 25,
      joinDate: '2022',
      verified: true
    },
    rating: 4.8,
    reviewCount: 45,
    sold: 150,
    description: `Bayam organik segar langsung dari kebun yang dirawat dengan penuh perhatian tanpa menggunakan pestisida kimia. Dipetik pagi hari untuk menjaga kesegaran dan kandungan nutrisinya.

Kelebihan produk kami:
• 100% organik tanpa pestisida
• Dipetik fresh setiap pagi
• Kaya akan zat besi dan vitamin A, C, K
• Sudah dicuci bersih dan siap masak
• Kemasan higienis dan aman

Cocok untuk berbagai olahan seperti sayur bening, tumis bayam, gado-gado, dan smoothie sehat.`,
    
    specifications: {
      'Berat': '250-300 gram per ikat',
      'Asal': 'Kebun Organik Bogor',
      'Metode Tanam': 'Organik tanpa pestisida',
      'Waktu Panen': 'Pagi hari (4-6 AM)',
      'Daya Tahan': '2-3 hari dalam kulkas',
      'Kemasan': 'Plastik food grade'
    },

    nutritionFacts: {
      'Kalori': '23 per 100g',
      'Protein': '2.9g',
      'Karbohidrat': '3.6g',
      'Serat': '2.2g',
      'Vitamin A': '469 mcg',
      'Vitamin C': '28 mg',
      'Zat Besi': '2.7 mg',
      'Kalsium': '99 mg'
    },

    reviews: [
      {
        id: 1,
        user: 'Sari Dewi',
        rating: 5,
        date: '2 hari lalu',
        comment: 'Bayamnya segar banget! Benar-benar organik, tidak layu cepat dan rasanya enak. Penjualnya ramah dan pengiriman cepat.',
        helpful: 12,
        images: ['/api/placeholder/100/100', '/api/placeholder/100/100']
      },
      {
        id: 2,
        user: 'Ibu Maya',
        rating: 5,
        date: '1 minggu lalu',
        comment: 'Sudah beberapa kali beli disini, kualitasnya konsisten bagus. Anak-anak juga suka makan sayur bayam dari sini.',
        helpful: 8,
        images: []
      },
      {
        id: 3,
        user: 'Pak Andi',
        rating: 4,
        date: '2 minggu lalu',
        comment: 'Bayam organiknya fresh, tapi packagingnya bisa diperbaiki lagi. Overall recommended untuk yang peduli kesehatan.',
        helpful: 5,
        images: ['/api/placeholder/100/100']
      }
    ],

    relatedProducts: [
      {
        id: 2,
        name: 'Kangkung Organik',
        price: 6000,
        originalPrice: 7000,
        image: '/api/placeholder/200/200',
        rating: 4.7,
        discount: 14
      },
      {
        id: 3,
        name: 'Sawi Hijau Fresh',
        price: 7000,
        originalPrice: 8500,
        image: '/api/placeholder/200/200',
        rating: 4.6,
        discount: 18
      },
      {
        id: 4,
        name: 'Selada Organik',
        price: 12000,
        originalPrice: 15000,
        image: '/api/placeholder/200/200',
        rating: 4.9,
        discount: 20
      }
    ]
  };

  // Fallback to mock if no product loaded
  useEffect(() => {
    if (!loading && !product) {
      setProduct(mockProduct);
    }
  }, [loading, product]);

  // Safe access to product properties with defaults
  const safeProduct = {
    ...mockProduct,
    ...product,
    images: product?.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : mockProduct.images,
    name: product?.name || mockProduct.name,
    price: product?.price || mockProduct.price,
    discount: product?.discount || 0,
    rating: product?.rating || mockProduct.rating,
    reviewCount: product?.reviewCount || mockProduct.reviewCount,
    sold: product?.sold || mockProduct.sold,
    stock: product?.stock || mockProduct.stock,
    unit: product?.unit || mockProduct.unit,
    category: product?.category || mockProduct.category,
    description: product?.description || mockProduct.description,
    seller: product?.seller || mockProduct.seller,
    specifications: product?.specifications || mockProduct.specifications,
    nutritionFacts: product?.nutritionFacts || mockProduct.nutritionFacts,
    reviews: product?.reviews || mockProduct.reviews,
    relatedProducts: product?.relatedProducts || mockProduct.relatedProducts,
  };

  const productImages = safeProduct.images;
  const productName = safeProduct.name;
  const productPrice = safeProduct.price;
  const productDiscount = safeProduct.discount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Produk yang Anda cari tidak tersedia.</p>
          <Link to="/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsAppOrder = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    const displayPrice = safeProduct.promoPrice || safeProduct.price;
    const totalPrice = displayPrice * quantity;
    const message = `Halo BaleTani! Saya ingin memesan:\n\n📦 ${safeProduct.name}\n💰 Rp ${displayPrice.toLocaleString('id-ID')}/${safeProduct.unit}\n📊 Jumlah: ${quantity} ${safeProduct.unit}\n💵 Total: Rp ${totalPrice.toLocaleString('id-ID')}\n\nTerima kasih!`;

    const whatsappUrl = `https://wa.me/6285885725027?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Mengarahkan ke WhatsApp...');
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    
    addItem(safeProduct, quantity);
    toast.success(`${quantity} ${safeProduct.unit} ${safeProduct.name} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    
    addItem(product, quantity);
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: safeProduct.name,
        text: `${safeProduct.name} - ${formatPrice(safeProduct.price)}/${safeProduct.unit}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link produk disalin ke clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-green-600">Beranda</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-500 hover:text-green-600">Produk</Link>
            <span className="text-gray-400">/</span>
            {safeProduct.category && (
              <>
                <Link to={`/products?category=${typeof safeProduct.category === 'string' ? safeProduct.category.toLowerCase() : safeProduct.category}`} className="text-gray-500 hover:text-green-600">
                  {safeProduct.category}
                </Link>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{safeProduct.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-sm">
              <img
                src={typeof productImages[selectedImage] === 'string' 
                  ? productImages[selectedImage] 
                  : (productImages[selectedImage]?.image_url || productImages[selectedImage]?.preview || '/api/placeholder/600/600')}
                alt={productName}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              {productDiscount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                  -{productDiscount}%
                </div>
              )}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Share2 size={18} className="text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-green-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={typeof image === 'string' 
                      ? image 
                      : (image?.image_url || image?.preview || '/api/placeholder/100/100')}
                    alt={`${productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{safeProduct.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < Math.floor(safeProduct.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{safeProduct.rating}</span>
                </div>
                <span className="text-sm text-gray-600">
                  ({safeProduct.reviewCount} ulasan)
                </span>
                <span className="text-sm text-gray-600">
                  {safeProduct.sold} terjual
                </span>
              </div>

              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(safeProduct.price)}
                </span>
                <span className="text-lg text-gray-500">/{safeProduct.unit}</span>
                {safeProduct.originalPrice > safeProduct.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(safeProduct.originalPrice)}
                  </span>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="text-green-600" size={18} />
                  <span className="text-green-800 font-medium">Jaminan Kesegaran</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Produk segar dengan garansi uang kembali jika tidak sesuai kualitas
                </p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">
                      {safeProduct.seller?.name?.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900">{safeProduct.seller?.name || 'BaleTani'}</h3>
                      {safeProduct.seller?.verified && (
                        <div className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck size={12} />
                          Terverifikasi
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} />
                      <span>{safeProduct.seller?.location || 'Bogor, Jawa Barat'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1 text-yellow-600 justify-end">
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold">{safeProduct.seller?.rating || 4.8}</span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {safeProduct.seller?.totalProducts || 25} produk
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(safeProduct.stock, val)));
                        }}
                        className="w-16 px-4 py-2 text-center font-medium focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(safeProduct.stock, quantity + 1))}
                        disabled={quantity >= safeProduct.stock}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Stok: {safeProduct.stock} {safeProduct.unit}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-gray-900">Total:</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">
                        Rp {((safeProduct.promoPrice || safeProduct.price) * quantity).toLocaleString('id-ID')}
                      </span>
                      {safeProduct.promoPrice && safeProduct.promoPrice < safeProduct.price && (
                        <div className="text-sm text-gray-400 line-through">
                          Rp {(safeProduct.price * quantity).toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Beli Sekarang
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Tambah ke Keranjang
                    </button>
                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Chat WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Truck className="text-green-600" size={20} />
                <span className="font-medium text-gray-900">Informasi Pengiriman</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Dikirim dalam 1-2 hari kerja</span>
                </div>
                <div>• Pengiriman dengan sistem cold chain</div>
                <div>• Garansi kesegaran produk</div>
                <div>• Bisa COD untuk area Jabodetabek</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'Deskripsi' },
                { id: 'specifications', label: 'Spesifikasi' },
                { id: 'nutrition', label: 'Informasi Gizi' },
                { id: 'reviews', label: `Ulasan (${safeProduct.reviewCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {safeProduct.description}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(safeProduct.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(safeProduct.nutritionFacts).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{value}</div>
                    <div className="text-sm text-gray-600">{key}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {safeProduct.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {review.user.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.user}</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={`${
                                      i < review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        {review.images.length > 0 && (
                          <div className="flex space-x-2 mb-3">
                            {review.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Review ${index + 1}`}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                        <button className="text-sm text-gray-500 hover:text-green-600">
                          👍 Membantu ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {safeProduct.relatedProducts && safeProduct.relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Serupa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {safeProduct.relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedsafeProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
