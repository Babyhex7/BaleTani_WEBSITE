import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

/**
 * Modal untuk melihat detail produk (Read-only)
 * Dengan galeri gambar seperti Shopee
 */
const ProductDetailModal = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [stockHistory, setStockHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && product && activeTab === 'history') {
      fetchStockHistory();
    }
  }, [isOpen, product, activeTab]);

  const fetchStockHistory = async () => {
    if (!product?.id) return;
    
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/admin/stock-history?product_id=${product.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStockHistory(data.data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !product) return null;

  // Handle different field name structures from backend
  const images = product.ProductImages || product.images || [];
  const category = product.Category || product.category || {};
  const productName = product.name || product.product_name;
  const categoryName = category.category_name;
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const getStockBadge = () => {
    const stock = product.total_stock || 0;
    
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
          <XCircleIcon className="w-4 h-4" />
          Habis
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
          <XCircleIcon className="w-4 h-4" />
          Stok Rendah ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircleIcon className="w-4 h-4" />
          Tersedia ({stock})
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <PhotoIcon className="w-6 h-6 text-green-600" /> 
              <h3 className="text-xl font-bold text-gray-900">
                Detail Produk
              </h3>
            </div>

            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detail Produk
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              History Stok
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Galeri Gambar - Kiri */}
                <div>
                  {hasImages ? (
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={getImageUrl(images[currentImageIndex]?.image_url)}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                            >
                              <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                            >
                              <ChevronRightIcon className="w-5 h-5 text-gray-800" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        {images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Thumbnails */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                          {images.map((img, index) => (
                            <button
                              key={img.image_id}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentImageIndex
                                  ? 'border-green-600 ring-2 ring-green-300'
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              <img
                                src={getImageUrl(img.image_url)}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {img.is_primary && (
                                <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs py-0.5 text-center">
                                  Utama
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-square bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-400">
                        <CubeIcon className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-sm">Tidak ada gambar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Produk - Kanan */}
                <div className="space-y-4">
                  {/* Nama Produk */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {productName}
                    </h2>
                    <div className="flex items-center gap-3">
                      {getStockBadge()}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        product.product_type === 'online'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {product.product_type === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Harga */}
                  <div className="border-t border-b border-gray-200 py-4">
                    <div className="flex items-baseline gap-3">
                      {product.discount_price && product.discount_price < product.selling_price ? (
                        <>
                          <span className="text-3xl font-bold text-green-600">
                            {formatCurrency(product.discount_price)}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            {formatCurrency(product.selling_price)}
                          </span>
                          <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                            DISKON
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          {formatCurrency(product.selling_price)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      per {product.unit || 'unit'}
                    </p>
                  </div>

                  {/* Detail Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <TagIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Kategori</p>
                        <p className="text-sm font-medium text-gray-900">
                          {categoryName || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CubeIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Stok Tersedia</p>
                        <p className="text-sm font-medium text-gray-900">
                          {product.total_stock || 0} {product.unit || 'unit'}
                        </p>
                      </div>
                    </div>

                    {product.shelf_life_days && (
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Masa Simpan</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.shelf_life_days} hari
                          </p>
                        </div>
                      </div>
                    )}

                    {product.quantity_info && (
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Info Tambahan</p>
                          <p className="text-sm font-medium text-gray-900">
                            {product.quantity_info}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">ID Produk</p>
                        <p className="text-xs font-mono text-gray-900">
                          {product.product_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  {product.description && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Deskripsi Produk
                      </h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                    <p>
                      Dibuat: {new Date(product.created_at).toLocaleString('id-ID')}
                    </p>
                    <p>
                      Diupdate: {new Date(product.updated_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Stock History Tab */
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                  <h4 className="text-lg font-medium text-gray-900">
                    History Perubahan Stok
                  </h4>
                </div>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : stockHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada history perubahan stok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stockHistory.map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            item.change_type === 'procurement' 
                              ? 'bg-green-100 text-green-600'
                              : item.change_type === 'order'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {item.change_type === 'procurement' ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : item.change_type === 'order' ? (
                              <ArrowDownIcon className="w-4 h-4" />
                            ) : (
                              <ClockIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.reason || `${item.change_type} - ${item.quantity_change > 0 ? 'Penambahan' : 'Pengurangan'} ${Math.abs(item.quantity_change)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            item.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.quantity_change > 0 ? '+' : ''}{item.quantity_change}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.change_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
