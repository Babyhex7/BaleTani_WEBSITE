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
import { MessageCircle, MapPin, Phone, Mail, HelpCircle, Clock } from 'lucide-react';
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
        <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white hero-gradient">
          <div className="container-app section-py text-center">
            <h1 className="heading-hero mb-4">
              Hubungi Kami
            </h1>
            <p className="text-body text-green-50 max-w-2xl mx-auto">
              Punya pertanyaan atau butuh bantuan? Tim dukungan kami siap membantu Anda. 
              Kami berkomitmen memberikan layanan terbaik untuk Anda.
            </p>
          </div>
        </section>

        {/* Notification */}
        {notification && (
          <div className="container-app pt-6">
            <div className={`card-responsive ${
              notification.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-800' 
                : 'bg-red-50 border-l-4 border-red-500 text-red-800'
            }`}>
              <p className="font-medium text-body">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Contact Info Cards - Fixed/Sticky */}
        <section className="bg-gradient-to-b from-gray-50 to-white section-py">
          <div className="container-app">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="heading-section mb-4">
                Cara Menghubungi Kami
              </h2>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Pilih cara yang paling nyaman untuk Anda. Kami tersedia melalui berbagai channel komunikasi.
              </p>
            </div>
            
            {/* Cards Grid - Sticky pada Desktop */}
            <div className="relative">
              <div className="lg:sticky lg:top-20 z-10">
                <ContactInfoCards />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content: Contact Form & Sidebar Info */}
        <section className="container-app section-py bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Contact Form - 2 columns on desktop */}
            <div className="lg:col-span-2">
              <ContactForm 
                onSuccess={handleContactSuccess}
                onError={handleContactError}
              />
            </div>

            {/* Sidebar - Jam Operasional - 1 column on desktop */}
            <div>
              {/* Jam Operasional Card */}
              <div className="card-responsive bg-white border-2 border-green-200 h-full">
                <div className="flex items-center mb-6">
                  <div className="bg-green-600 p-3 rounded-lg shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 ml-3">
                    Jam Operasional
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-semibold text-gray-800">Senin - Jumat</span>
                    </div>
                    <span className="text-green-600 font-bold text-lg">08:00 - 21:00</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-semibold text-gray-800">Sabtu</span>
                    </div>
                    <span className="text-green-600 font-bold text-lg">08:00 - 22:00</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-semibold text-gray-800">Minggu</span>
                    </div>
                    <span className="text-green-600 font-bold text-lg">07:00 - 20:00</span>
                  </div>
                  <div className="bg-green-600 text-white rounded-lg p-4 flex items-center justify-center shadow-md mt-6">
                    <Clock className="w-5 h-5 mr-2" />
                    <p className="text-base font-bold">Buka Sekarang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Maps Section - Full Width */}
        <section className="bg-white section-py">
          <div className="container-app">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="heading-section ml-3">
                  Peta Lokasi Toko Kami
                </h3>
              </div>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Kunjungi toko kami untuk melihat langsung produk-produk segar berkualitas
              </p>
            </div>

            <div className="card rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={MAPS_CONFIG.embedUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Toko BaleTani"
                className="w-full h-64 md:h-96 lg:h-[500px]"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white section-py">
          <div className="container-app">
            <div className="text-center mb-8 md:mb-10">
              <div className="flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 mr-3" />
                <h3 className="heading-section">
                  Pertanyaan yang Sering Diajukan
                </h3>
              </div>
              <p className="text-body text-gray-600 max-w-2xl mx-auto">
                Temukan jawaban untuk pertanyaan umum sebelum menghubungi kami
              </p>
            </div>

            <div className="card-responsive max-w-5xl mx-auto">
              {/* FAQ Categories Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {faqCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`btn-touch px-4 rounded-full text-caption font-medium transition-all ${
                        selectedCategory === category.value
                          ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
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
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        </section>
      </div>
      
      <Footer />
    </>
  );
};

export default ContactPage;