import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

/**
 * Modal Form untuk Create & Edit Product
 * Upload multiple images (max 5) seperti Shopee
 */
const ProductFormModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' atau 'edit'
  product = null,
  categories = [], // Default empty array
  onSubmit 
}) => {
  // Ensure categories is always an array
  const categoriesList = Array.isArray(categories) ? categories : [];
  
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category_id: '',
    product_type: 'online',
    selling_price: '',
    discount_price: '',
    unit: 'kg',
    shelf_life_days: '',
    initial_stock: '', // Tambah field stok awal
    is_active: true
  });

  const [images, setImages] = useState([]); // File objects untuk upload
  const [imagePreviews, setImagePreviews] = useState([]); // URLs untuk preview
  const [existingImages, setExistingImages] = useState([]); // Gambar dari server (edit mode)
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load data saat edit mode
  useEffect(() => {
    if (product && mode === 'edit') {
      // Handle both 'name' and 'product_name' field names
      const productName = product.name || product.product_name;
      const productImages = product.ProductImages || product.images || [];
      
      setFormData({
        product_name: productName || '',
        description: product.description || '',
        category_id: product.category_id || '',
        product_type: product.product_type || 'online',
        selling_price: product.selling_price || '',
        discount_price: product.discount_price || '',
        unit: product.unit || 'kg',
        shelf_life_days: product.shelf_life_days || '',
        initial_stock: product.total_stock || '', // Load existing stock (read-only)
        is_active: product.is_active ?? true
      });
      
      // Set existing images dari server
      if (productImages.length > 0) {
        setExistingImages(productImages);
      }
    } else if (mode === 'create') {
      // Reset form untuk create mode
      resetForm();
    }
  }, [product, mode, isOpen]);

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      category_id: '',
      product_type: 'online',
      selling_price: '',
      discount_price: '',
      unit: 'kg',
      shelf_life_days: '',
      initial_stock: '', // Reset stok awal
      is_active: true
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error untuk field ini
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 5) {
      alert('Maksimal 5 gambar (termasuk gambar yang sudah ada)');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Hanya file JPG, PNG, dan WEBP yang diperbolehkan');
      return;
    }

    // Validate file sizes (max 2MB per file)
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Ukuran file maksimal 2MB per gambar');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(prev => prev.filter(img => img.image_id !== imageId));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Nama produk wajib diisi';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori wajib dipilih';
    }
    
    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Harga jual harus lebih dari 0';
    }
    
    if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.selling_price)) {
      newErrors.discount_price = 'Harga diskon harus lebih kecil dari harga jual';
    }

    // Validasi minimal 1 gambar untuk create mode
    if (mode === 'create' && images.length === 0) {
      newErrors.images = 'Minimal 1 gambar produk';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      // Prepare FormData for multipart/form-data
      const submitData = new FormData();
      
      // Map field names: frontend -> backend
      const fieldMapping = {
        'product_name': 'name',  // Frontend uses product_name, backend expects name
        'description': 'description',
        'category_id': 'category_id',
        'product_type': 'product_type',
        'selling_price': 'selling_price',
        'discount_price': 'discount_price',
        'unit': 'unit',
        'shelf_life_days': 'shelf_life_days',
        'initial_stock': 'initial_stock', // Tambah mapping stok awal
        'is_active': 'is_active'
      };
      
      // Append formData dengan mapping yang benar
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== '') {
          const backendFieldName = fieldMapping[key] || key;
          submitData.append(backendFieldName, value);
        }
      });
      
      // Debug: Log FormData contents
      console.log('FormData to submit:');
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Append new images
      images.forEach((file) => {
        submitData.append('images', file);
      });
      
      // Untuk edit mode, kirim info gambar yang dihapus
      if (mode === 'edit' && product.ProductImages) {
        const deletedImageIds = product.ProductImages
          .filter(img => !existingImages.find(ei => ei.image_id === img.image_id))
          .map(img => img.image_id);
        
        if (deletedImageIds.length > 0) {
          submitData.append('deleted_image_ids', JSON.stringify(deletedImageIds));
        }
      }
      
      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk';
  const submitButtonText = mode === 'create' ? 'Tambah Produk' : 'Update Produk';

  const totalImages = existingImages.length + images.length;

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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
            <h3 className="text-xl font-bold text-white">
              {modalTitle}
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              
              {/* Upload Images - Seperti Shopee */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Produk <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({totalImages}/5 gambar)
                  </span>
                </label>
                
                <div className="grid grid-cols-5 gap-3">
                  {/* Existing Images dari Server */}
                  {existingImages.map((img) => (
                    <div key={img.image_id} className="relative group">
                      <img
                        src={img.image_url}
                        alt="Product"
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.image_id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      {img.is_primary && (
                        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {/* New Images Preview */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                        Baru
                      </span>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  {totalImages < 5 && (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  )}
                </div>
                
                {errors.images && (
                  <p className="mt-2 text-sm text-red-500">{errors.images}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Format: JPG, PNG, WEBP. Maksimal 2MB per gambar. Gambar pertama akan menjadi foto utama.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Produk */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.product_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Tomat Merah Organik"
                  />
                  {errors.product_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.product_name}</p>
                  )}
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categoriesList.map(cat => {
                      // Handle both 'id' and 'category_id' field names
                      const catId = cat.id || cat.category_id;
                      const catName = cat.category_name;
                      return (
                        <option key={catId} value={catId}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                  )}
                </div>

                {/* Tipe Produk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Produk
                  </label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Harga Jual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    step="100"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.selling_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50000"
                  />
                  {errors.selling_price && (
                    <p className="mt-1 text-sm text-red-500">{errors.selling_price}</p>
                  )}
                </div>

                {/* Harga Diskon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    name="discount_price"
                    value={formData.discount_price}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    step="100"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.discount_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="45000"
                  />
                  {errors.discount_price && (
                    <p className="mt-1 text-sm text-red-500">{errors.discount_price}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="pack">Pack</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>

                {/* Shelf Life */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masa Simpan (hari)
                  </label>
                  <input
                    type="number"
                    name="shelf_life_days"
                    value={formData.shelf_life_days}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="7"
                  />
                </div>

                {/* Stok Awal - Hanya untuk Create Mode */}
                {mode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Awal (opsional)
                    </label>
                    <input
                      type="number"
                      name="initial_stock"
                      value={formData.initial_stock}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      step="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      onKeyPress={(e) => {
                        // Prevent decimal point input
                        if (e.key === '.' || e.key === ',') {
                          e.preventDefault();
                        }
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Hanya angka bulat (contoh: 10, 50, 100). Kosongkan jika ingin diisi lewat Procurement
                    </p>
                  </div>
                )}

                {/* Stok Saat Ini - READ ONLY untuk Edit Mode */}
                {mode === 'edit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={`${formData.initial_stock || 0} ${formData.unit}`}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Stok hanya bisa diubah lewat Procurement
                    </p>
                  </div>
                )}

                {/* Deskripsi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Produk
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Deskripsi detail tentang produk..."
                  />
                </div>

                {/* Status Aktif */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Produk Aktif (Tampil di Customer)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  submitButtonText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
