import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  TruckIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const ProcurementFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  products = [], 
  editData = null,
  isSubmitting = false 
}) => {
  const [form, setForm] = useState({
    procurement_date: new Date().toISOString().slice(0, 10),
    procurement_type: 'online',
    supplier_name: '',
    items: [
      { product_id: '', product_name: '', quantity: 1, unit_price: 0, expiry_date: '' }
    ]
  });

  useEffect(() => {
    if (editData) {
      setForm({
        procurement_date: editData.procurement_date || new Date().toISOString().slice(0, 10),
        procurement_type: editData.procurement_type || 'online',
        supplier_name: editData.supplier_name || '',
        items: editData.items && editData.items.length > 0
          ? editData.items.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.purchase_price_per_unit,
              expiry_date: item.expiry_date || ''
            }))
          : [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, expiry_date: '' }]
      });
    } else {
      setForm({
        procurement_date: new Date().toISOString().slice(0, 10),
        procurement_type: 'online',
        supplier_name: '',
        items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0, expiry_date: '' }]
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const addItemRow = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, expiry_date: '' }]
    }));
  };

  const removeItemRow = (idx) => {
    if (form.items.length === 1) return; // Keep at least one row
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const updateItem = (idx, key, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...prev, items };
    });
  };

  const handleProductSelect = (idx, productId) => {
    const product = products.find(p => (p.id || p.product_id) === productId);
    if (product) {
      updateItem(idx, 'product_id', productId);
      updateItem(idx, 'product_name', product.name || product.product_name || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.items || form.items.length === 0) {
      alert('Tambahkan minimal 1 item untuk pengadaan');
      return;
    }

    for (const item of form.items) {
      if (!item.product_id) {
        alert('Pilih produk untuk setiap baris');
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        alert('Jumlah harus lebih dari 0');
        return;
      }
      if (item.unit_price === '' || Number(item.unit_price) < 0) {
        alert('Harga satuan tidak valid');
        return;
      }
    }

    const payload = {
      procurement_date: form.procurement_date,
      procurement_type: form.procurement_type,
      supplier_name: form.supplier_name || null,
      items: form.items.map(i => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        expiry_date: i.expiry_date || null
      }))
    };

    onSubmit(payload);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  };

  const totalAmount = form.items.reduce((sum, item) => {
    return sum + (Number(item.unit_price) * Number(item.quantity || 0));
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editData ? 'Edit Pengadaan' : 'Buat Pengadaan Baru'}
              </h3>
              <p className="text-sm text-gray-600">
                {editData ? 'Ubah data pengadaan yang sudah ada' : 'Tambah pengadaan barang baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pengadaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.procurement_date}
                  onChange={(e) => setForm(prev => ({ ...prev, procurement_date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Pengadaan <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.procurement_type}
                  onChange={(e) => setForm(prev => ({ ...prev, procurement_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier (Opsional)
                </label>
                <input
                  type="text"
                  value={form.supplier_name}
                  onChange={(e) => setForm(prev => ({ ...prev, supplier_name: e.target.value }))}
                  placeholder="Nama supplier..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Daftar Item</h4>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Tambah Baris
                </button>
              </div>

              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    {/* Product Select */}
                    <div className="md:col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">
                        Produk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Pilih produk --</option>
                        {products.map(p => (
                          <option key={p.id || p.product_id} value={p.id || p.product_id}>
                            {p.name || p.product_name} ({p.product_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Jumlah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">
                        Harga/Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Subtotal (Read-only) */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Subtotal</label>
                      <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                        {formatCurrency(Number(item.unit_price) * Number(item.quantity || 0))}
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Expiry (Opsional)</label>
                      <input
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) => updateItem(idx, 'expiry_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Delete Button */}
                    {form.items.length > 1 && (
                      <div className="md:col-span-12 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-lg font-semibold text-gray-900">Total Pengadaan</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Buat Pengadaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcurementFormModal;
