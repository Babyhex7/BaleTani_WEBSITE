import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import inventoryService from '../../services/services_admin/inventoryService';

/**
 * Modal untuk assign products ke discount
 */
const AssignProductModal = ({ 
  isOpen, 
  onClose, 
  discount,
  onSuccess 
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);

  // Already assigned product IDs
  const assignedProductIds = discount?.products?.map(p => p.id || p.product_id) || [];

  useEffect(() => {
    if (isOpen && discount) {
      fetchProducts();
    }
  }, [isOpen, discount, currentPage, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchQuery,
        is_active: true,
      };

      const data = await inventoryService.getProducts(params);

      if (data.success) {
        setProducts(data.data.products || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (productId) => {
    if (assignedProductIds.includes(productId)) return; // Already assigned

    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    const availableProducts = products
      .filter(p => !assignedProductIds.includes(p.id || p.product_id))
      .map(p => p.id || p.product_id);

    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(availableProducts);
    }
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      alert('Pilih minimal 1 produk');
      return;
    }

    try {
      setSaving(true);
      const discountId = discount.id || discount.discount_id;
      await inventoryService.addProductsToDiscount(discountId, selectedProducts);
      
      alert(`Berhasil menambahkan ${selectedProducts.length} produk ke diskon!`);
      setSelectedProducts([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning products:', err);
      alert(err.message || 'Gagal menambahkan produk');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (!isOpen || !discount) return null;

  const availableProducts = products.filter(
    p => !assignedProductIds.includes(p.id || p.product_id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CubeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Tambah Produk ke Diskon
                </h3>
                <p className="text-sm text-gray-500">
                  {discount.discount_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search & Info */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">{selectedProducts.length}</span> produk dipilih
              </p>
              {availableProducts.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {selectedProducts.length === availableProducts.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              )}
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 text-green-600 animate-spin" />
                <span className="ml-3 text-gray-600">Memuat produk...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Tidak ada produk tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((product) => {
                  const productId = product.id || product.product_id;
                  const isAssigned = assignedProductIds.includes(productId);
                  const isSelected = selectedProducts.includes(productId);

                  return (
                    <div
                      key={productId}
                      onClick={() => !isAssigned && handleToggleProduct(productId)}
                      className={`
                        relative p-4 border rounded-lg cursor-pointer transition-all
                        ${isAssigned 
                          ? 'bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-green-50 border-green-500 border-2'
                            : 'bg-white border-gray-200 hover:border-green-300'
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div className="flex items-start gap-3">
                        <div className={`
                          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-1
                          ${isAssigned
                            ? 'bg-gray-300 border-gray-400'
                            : isSelected
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300'
                          }
                        `}>
                          {(isSelected || isAssigned) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {product.name || product.product_name}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              Stok: {product.total_stock || 0} {product.unit || 'unit'}
                            </span>
                            {product.Category?.category_name && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {product.Category.category_name}
                              </span>
                            )}
                          </div>

                          {isAssigned && (
                            <div className="mt-2">
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                                ✓ Sudah Terdaftar
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && products.length > 0 && totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedProducts.length === 0 || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : `Tambahkan ${selectedProducts.length} Produk`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProductModal;
