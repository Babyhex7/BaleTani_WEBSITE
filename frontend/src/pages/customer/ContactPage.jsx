/**
 * ============================================
 * CUSTOMER CONTACT PAGE
 * ============================================
 * Halaman kontak untuk customer dengan:
 * - Contact form
 * - FAQ accordion
 * - Contact info cards
 * - Google Maps
 * 
 * @page ContactPage
 * @author BaleTani Development Team
 * @created 2025-11-15
 */

import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, Phone, Mail, HelpCircle } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ContactForm from '../../components/ui_customer/ContactForm';
import ContactInfoCards from '../../components/ui_customer/ContactInfoCards';
import FAQAccordion from '../../components/ui_customer/FAQAccordion';
import faqService from '../../services/services_customer/faqService';
import { MAPS_CONFIG } from '../../utils/contactConfig';

const ContactPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
    fetchFAQCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoadingFAQs(true);
      const response = await faqService.getActiveFAQs();
      if (response.success) {
        setFaqs(response.data.all || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setIsLoadingFAQs(false);
    }
  };

  const fetchFAQCategories = async () => {
    try {
      const response = await faqService.getCategories();
      if (response.success) {
        setFaqCategories([
          { value: 'all', label: 'Semua Kategori', count: 0 },
          ...response.data
        ]);
      }
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
    }
  };

  // Handle contact form success
  const handleContactSuccess = (message) => {
    setNotification({
      type: 'success',
      message: message
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle contact form error
  const handleContactError = (message) => {
    setNotification({
      type: 'error',
      message: message
    });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
                Hubungi Kami
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-green-50 max-w-2xl mx-auto px-4">
                Punya pertanyaan atau butuh bantuan? Tim dukungan kami siap membantu Anda. 
                Kami berkomitmen memberikan layanan terbaik untuk Anda.
              </p>
            </div>
          </div>
        </div>

      {/* Notification */}
      {notification && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6`}>
          <div className={`p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

        {/* Contact Info Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Cara Menghubungi Kami
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Pilih cara yang paling nyaman untuk Anda. Kami tersedia melalui berbagai channel komunikasi.
            </p>
          </div>
          
          <ContactInfoCards />
        </div>

        {/* Google Maps Section */}
        <div className="bg-white py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <MapPin className="w-6 h-6 md:w-7 md:h-7 text-green-600 mr-2" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Lokasi Toko Kami
                </h3>
              </div>
              <p className="text-sm md:text-base text-gray-600 px-4">
                Kunjungi toko kami untuk melihat langsung produk-produk berkualitas
              </p>
            </div>

            <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={MAPS_CONFIG.embedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Toko BaleTani"
                className="w-full h-64 md:h-96 lg:h-[450px]"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Main Content: Contact Form & Map */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <ContactForm 
                onSuccess={handleContactSuccess}
                onError={handleContactError}
              />
            </div>

            {/* Info Tambahan atau Ilustrasi */}
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 md:p-8 h-full">
                <div className="flex items-center mb-4 md:mb-6">
                  <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-green-600 mr-3" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Kirim Pesan
                  </h3>
                </div>
                <div className="space-y-4 text-sm md:text-base text-gray-700">
                  <p>
                    Isi formulir di samping untuk mengirim pesan kepada kami. 
                    Tim customer service kami akan merespons pesan Anda secepatnya.
                  </p>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Jam Operasional</p>
                        <p className="text-sm text-gray-600">Senin - Sabtu: 08:00 - 17:00 WIB</p>
                        <p className="text-sm text-gray-600">Minggu & Tanggal Merah: Tutup</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MessageCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Waktu Respon</p>
                        <p className="text-sm text-gray-600">Kami akan merespons dalam 1x24 jam</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white rounded-lg p-4">
                    <p className="font-medium mb-2">💡 Tips</p>
                    <p className="text-sm">
                      Untuk respons lebih cepat, hubungi kami melalui WhatsApp atau cek FAQ di bawah
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-green-600 mr-3" />
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Pertanyaan yang Sering Diajukan
                </h3>
              </div>
              <p className="text-sm md:text-base text-gray-600 px-4">
                Temukan jawaban untuk pertanyaan umum sebelum menghubungi kami
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8">
              {/* FAQ Categories Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {faqCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label} {category.count > 0 && `(${category.count})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Accordion */}
              {isLoadingFAQs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <FAQAccordion 
                  faqs={faqs}
                  category={selectedCategory}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ContactPage;