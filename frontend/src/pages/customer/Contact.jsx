import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: ''
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: '📱',
      title: 'WhatsApp Customer Service',
      description: 'Chat langsung dengan tim CS kami',
      value: '+62 812-3456-7890',
      action: 'Chat Sekarang',
      color: 'from-green-400 to-green-600',
      link: 'https://wa.me/6281234567890'
    },
    {
      icon: '📞',
      title: 'Telepon Langsung',
      description: 'Hubungi kami untuk informasi lebih lanjut',
      value: '(021) 5555-1234',
      action: 'Telepon',
      color: 'from-blue-400 to-blue-600',
      link: 'tel:+622155551234'
    },
    {
      icon: '✉️',
      title: 'Email Support',
      description: 'Kirim pertanyaan via email',
      value: 'info@baletani.com',
      action: 'Kirim Email',
      color: 'from-purple-400 to-purple-600',
      link: 'mailto:info@baletani.com'
    },
    {
      icon: '📍',
      title: 'Kunjungi Toko',
      description: 'Datang langsung ke fresh market kami',
      value: 'Jl. Fresh Market No. 123, Jakarta Selatan',
      action: 'Lihat Peta',
      color: 'from-red-400 to-red-600',
      link: '#'
    }
  ];

  const operationalHours = [
    { day: 'Senin - Jumat', hours: '06:00 - 21:00 WIB', active: true },
    { day: 'Sabtu', hours: '06:00 - 22:00 WIB', active: true },
    { day: 'Minggu', hours: '07:00 - 20:00 WIB', active: true },
    { day: 'Hari Libur Nasional', hours: '08:00 - 18:00 WIB', active: false }
  ];

  const faqs = [
    {
      question: 'Bagaimana cara menjamin kesegaran produk?',
      answer: 'Kami bekerja sama langsung dengan petani lokal dan memiliki sistem cold chain yang memastikan produk tetap segar dari farm to table. Semua produk dipetik/dipanen maksimal H-1 sebelum dikirim ke customer.'
    },
    {
      question: 'Area pengiriman mencakup wilayah mana saja?',
      answer: 'Saat ini kami melayani area Jabodetabek dengan layanan same-day delivery. Untuk wilayah luar, kami menyediakan layanan next-day delivery dengan packaging khusus.'
    },
    {
      question: 'Apakah tersedia layanan berlangganan?',
      answer: 'Ya! Kami memiliki paket berlangganan mingguan dan bulanan dengan diskon hingga 15%. Anda bisa customize produk sesuai kebutuhan keluarga.'
    },
    {
      question: 'Bagaimana kebijakan return/refund?',
      answer: 'Jika produk tidak sesuai ekspektasi atau rusak saat diterima, kami memberikan garansi 100% money back atau replacement dalam 24 jam.'
    }
  ];

  const teamMembers = [
    {
      name: 'Pak Budi Santoso',
      role: 'Founder & CEO',
      description: 'Ex-petani yang berpengalaman 20+ tahun',
      image: 'https://placehold.co/150x150',
      contact: 'budi@baletani.com'
    },
    {
      name: 'Bu Sari Indah',
      role: 'Quality Control Manager',
      description: 'Ahli nutrisi dan food safety',
      image: 'https://placehold.co/150x150',
      contact: 'sari@baletani.com'
    },
    {
      name: 'Mas Joko',
      role: 'Customer Happiness',
      description: 'Siap membantu 24/7',
      image: 'https://placehold.co/150x150',
      contact: 'joko@baletani.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Punya pertanyaan atau butuh bantuan? Tim BaleTani siap membantu Anda 24/7. 
            Kami berkomitmen memberikan pelayanan terbaik untuk kepuasan Anda.
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">&lt; 5min</div>
              <div className="text-sm text-gray-600">Respon Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600">Kepuasan Customer</div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Cara Menghubungi Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${method.color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{method.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                  <p className="text-sm opacity-90 mb-4">{method.description}</p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold break-all">{method.value}</p>
                  </div>
                  <a
                    href={method.link}
                    className="inline-block bg-white text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {method.action}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Kirim Pesan</h3>
            
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-green-700 font-medium">
                    Pesan berhasil dikirim! Kami akan merespon dalam 24 jam.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="08xxx-xxxx-xxxx"
                  />
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjek Pertanyaan
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="general">Pertanyaan Umum</option>
                  <option value="product">Info Produk</option>
                  <option value="order">Status Pesanan</option>
                  <option value="complaint">Keluhan</option>
                  <option value="partnership">Kerjasama</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 transform hover:scale-105'
                } text-white shadow-lg hover:shadow-xl`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-spin">⏳</span>
                    <span>Mengirim...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Kirim Pesan</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Store Info & Hours */}
          <div className="space-y-8">
            {/* Operational Hours */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Jam Operasional</h3>
              <div className="space-y-4">
                {operationalHours.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      schedule.active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`font-medium ${
                      schedule.active ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {schedule.day}
                    </span>
                    <span className={`text-sm ${
                      schedule.active ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                <strong>Tips:</strong> Untuk mendapatkan produk paling segar, 
                  datang di pagi hari (06:00-09:00) saat fresh stock baru tiba!
                </p>
              </div>
            </div>

            {/* Location Map Placeholder */}
            {/* Location Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Lokasi Kami</h3>
              <div className="bg-gray-200 rounded-lg h-64 mb-4 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d832.6109943437089!2d107.72516776753591!3d-6.939781297538308!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c323777ca3a1%3A0x355eff6734ed9167!2sUniversitas%20Pendidikan%20Indonesia%20(UPI)%20Kampus%20Cibiru!5e0!3m2!1sid!2sid!4v1761056157649!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Jl. Fresh Market No. 123, Jakarta Selatan</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🚗</span>
                  <span>Parkir luas tersedia</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🚌</span>
                  <span>Dekat halte busway & stasiun MRT</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h4>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Tim Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h4>
                <p className="text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                <a
                  href={`mailto:${member.contact}`}
                  className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Kontak
                </a>
              </div>
            ))}
          </div>
        </div> */}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Siap Bergabung dengan BaleTani?</h3>
          <p className="text-lg mb-6">
            Dapatkan produk segar berkualitas tinggi dengan pelayanan terbaik. 
            Hubungi kami sekarang dan rasakan perbedaannya!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/6281234567890"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>📱</span>
              <span>WhatsApp Sekarang</span>
            </a>
            <a
              href="tel:+622155551234"
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <span>📞</span>
              <span>Telepon Langsung</span>
            </a>
            <a
              href="/products"
              className="bg-yellow-400 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
            >
              <span>🛒</span>
              <span>Lihat Produk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;