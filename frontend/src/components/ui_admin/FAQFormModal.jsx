/**
 * ============================================
 * FAQ FORM MODAL COMPONENT
 * ============================================
 * Modal component untuk create/edit FAQ
 * dengan form validation
 * 
 * @component FAQFormModal
 * @author BaleTani Development Team
 * @created 2025-11-15
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import faqService from '../../services/services_admin/faqService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const FAQFormModal = ({ isOpen, onClose, onSuccess, faq, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'umum',
    order_number: 0,
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories
  const categories = [
    { value: 'umum', label: 'Umum' },
    { value: 'pembayaran', label: 'Pembayaran' },
    { value: 'pengiriman', label: 'Pengiriman' },
    { value: 'produk', label: 'Produk' }
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && faq) {
        setFormData({
          question: faq.question || '',
          answer: faq.answer || '',
          category: faq.category || 'umum',
          order_number: faq.order_number || 0,
          is_active: faq.is_active !== undefined ? faq.is_active : true
        });
      } else {
        setFormData({
          question: '',
          answer: '',
          category: 'umum',
          order_number: 0,
          is_active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, faq, mode]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Pertanyaan wajib diisi';
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Pertanyaan minimal 10 karakter';
    }

    if (!formData.answer.trim()) {
      newErrors.answer = 'Jawaban wajib diisi';
    } else if (formData.answer.trim().length < 20) {
      newErrors.answer = 'Jawaban minimal 20 karakter';
    }

    if (formData.order_number < 0) {
      newErrors.order_number = 'Urutan tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      if (mode === 'edit') {
        response = await faqService.updateFAQ(faq.id, formData);
      } else {
        response = await faqService.createFAQ(formData);
      }

      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan FAQ';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {mode === 'edit' ? 'Edit FAQ' : 'Tambah FAQ Baru'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Submit Error */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
            Pertanyaan <span className="text-red-500">*</span>
          </label>
          <Input
            id="question"
            name="question"
            type="text"
            value={formData.question}
            onChange={handleChange}
            placeholder="Masukkan pertanyaan FAQ"
            className={errors.question ? 'border-red-500' : ''}
          />
          {errors.question && (
            <p className="mt-1 text-sm text-red-600">{errors.question}</p>
          )}
        </div>

        {/* Answer */}
        <div>
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
            Jawaban <span className="text-red-500">*</span>
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={4}
            value={formData.answer}
            onChange={handleChange}
            placeholder="Masukkan jawaban FAQ"
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.answer ? 'border-red-500' : ''
            }`}
          />
          {errors.answer && (
            <p className="mt-1 text-sm text-red-600">{errors.answer}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.answer.length}/5000 karakter
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Number */}
          <div>
            <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 mb-2">
              Urutan
            </label>
            <Input
              id="order_number"
              name="order_number"
              type="number"
              min="0"
              value={formData.order_number}
              onChange={handleChange}
              placeholder="0"
              className={errors.order_number ? 'border-red-500' : ''}
            />
            {errors.order_number && (
              <p className="mt-1 text-sm text-red-600">{errors.order_number}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Semakin kecil semakin atas
            </p>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Aktifkan FAQ (tampil di halaman customer)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'edit' ? 'Menyimpan...' : 'Membuat...') 
              : (mode === 'edit' ? 'Simpan Perubahan' : 'Tambah FAQ')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FAQFormModal;