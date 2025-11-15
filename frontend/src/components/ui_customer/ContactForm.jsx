/**
 * ============================================
 * CONTACT FORM COMPONENT
 * ============================================
 * Form component untuk customer submit pesan kontak
 * dengan validasi dan loading states
 * 
 * @component ContactForm
 * @author BaleTani Development Team
 * @created 2025-11-15
 */

import { useState } from 'react';
import useAuthStore from '../../store/store_customer/useAuthStore';
import contactService from '../../services/services_customer/contactService';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ContactForm = ({ onSuccess, onError }) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    whatsapp_number: user?.phone_number || '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi';
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Nama minimal 3 karakter';
    }

    if (!formData.whatsapp_number.trim()) {
      newErrors.whatsapp_number = 'Nomor WhatsApp wajib diisi';
    } else if (!/^(\+62|62|0)[0-9]{9,13}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'Format nomor WhatsApp tidak valid';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek wajib diisi';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subjek minimal 5 karakter';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Pesan minimal 20 karakter';
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
      const response = await contactService.submitContactForm(formData);
      
      if (response.success) {
        // Reset form
        setFormData({
          full_name: user?.name || '',
          email: user?.email || '',
          whatsapp_number: user?.phone_number || '',
          subject: '',
          message: ''
        });
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.message);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mengirim pesan';
      
      // Call error callback
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-responsive">
      <div className="mb-6">
        <h3 className="heading-sub mb-2">
          Kirim Pesan
        </h3>
        <p className="text-body text-gray-600">
          Kami akan membalas pesan Anda melalui WhatsApp dalam 1x24 jam
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Lengkap */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap Anda"
            className={errors.full_name ? 'border-red-500' : ''}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
          )}
        </div>

        {/* Email (Optional) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (Opsional)
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp Number */}
        <div>
          <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
            Nomor WhatsApp <span className="text-red-500">*</span>
          </label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            type="tel"
            value={formData.whatsapp_number}
            onChange={handleChange}
            placeholder="08123456789 atau +6281234567890"
            className={errors.whatsapp_number ? 'border-red-500' : ''}
          />
          {errors.whatsapp_number && (
            <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subjek <span className="text-red-500">*</span>
          </label>
          <Input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Pertanyaan tentang produk, keluhan, dll"
            className={errors.subject ? 'border-red-500' : ''}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tuliskan pesan Anda dengan detail..."
            className={`input-field ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.message && (
            <p className="mt-1 text-caption text-red-600">{errors.message}</p>
          )}
          <p className="mt-1 text-caption text-gray-500">
            Minimal 20 karakter ({formData.message.length}/20)
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            variant="primary"
            className="w-full btn-touch"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;