import { useState } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';

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
      icon: MessageCircle,
      title: 'WhatsApp Customer Service',
      description: 'Chat langsung dengan tim CS kami',
      value: '+62 858-8572-5027',
      action: 'Chat Sekarang',
      color: 'from-green-500 to-green-600',
      link: 'https://wa.me/6285885725027'
    },
    {
      icon: Phone,
      title: 'Telepon Langsung',
      description: 'Hubungi kami untuk informasi lebih lanjut',
      value: '(021) 5555-1234',
      action: 'Telepon',
      color: 'from-blue-500 to-blue-600',
      link: 'tel:+622155551234'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Kirim pertanyaan via email',
      value: 'info@baletani.com',
      action: 'Kirim Email',
      color: 'from-purple-500 to-purple-600',
      link: 'mailto:info@baletani.com'
    },
    {
      icon: MapPin,
      title: 'Kunjungi Toko',
      description: 'Datang langsung ke fresh market kami',
      value: 'Jl. Fresh Market No. 123, Jakarta Selatan',
      action: 'Lihat Peta',
      color: 'from-red-500 to-red-600',
      link: '#location'
    }
  ];

  const operationalHours = [
    { day: 'Senin - Jumat', hours: '06:00 - 21:00 WIB', active: true },
    { day: 'Sabtu', hours: '06:00 - 22:00 WIB', active: true },
    { day: 'Minggu', hours: '07:00 - 20:00 WIB', active: true },
    { day: 'Hari Libur Nasional', hours: '08:00 - 18:00 WIB', active: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Punya pertanyaan atau butuh bantuan? Tim BaleTani siap membantu Anda. 
            Kami berkomitmen memberikan pelayanan terbaik untuk kepuasan Anda.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="border-r border-gray-200 last:border-r-0">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">24/7</div>
              <div className="text-sm text-gray-600">Customer Support</div>
            </div>
            <div className="border-r border-gray-200 last:border-r-0">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">&lt; 5 menit</div>
              <div className="text-sm text-gray-600">Respon Time</div>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">99.9%</div>
              <div className="text-sm text-gray-600">Kepuasan Customer</div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cara Menghubungi Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${method.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="text-center">
                    <IconComponent className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">{method.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{method.description}</p>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                      <p className="text-sm font-semibold break-all">{method.value}</p>
                    </div>
                    <a
                      href={method.link}
                      className="inline-block bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {method.action}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Send className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Kirim Pesan</h3>
            </div>
            
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Pesan berhasil dikirim! Kami akan merespon dalam 24 jam.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tulis pesan Anda di sini..."
                ></textarea>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Store Info & Hours */}
          <div className="space-y-6">
            {/* Operational Hours */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">Jam Operasional</h3>
              </div>
              <div className="space-y-3">
                {operationalHours.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      schedule.active ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className={`font-medium text-sm ${
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
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Tips:</strong> Untuk mendapatkan produk paling segar, 
                  datang di pagi hari (06:00-09:00) saat fresh stock baru tiba!
                </p>
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200" id="location">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-800">Lokasi Kami</h3>
              </div>
              <div className="bg-gray-200 rounded-lg h-48 mb-4 overflow-hidden">
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
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Jl. Fresh Market No. 123, Jakarta Selatan</span>
                </div>
                <div className="flex items-start space-x-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Parkir luas tersedia</span>
                </div>
                <div className="flex items-start space-x-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dekat halte busway & stasiun MRT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-3">Siap Bergabung dengan BaleTani?</h3>
          <p className="text-green-50 mb-6">
            Dapatkan produk segar berkualitas tinggi dengan pelayanan terbaik. 
            Hubungi kami sekarang dan rasakan perbedaannya!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/6285885725027"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Sekarang</span>
            </a>
            <a
              href="tel:+622155551234"
              className="bg-green-800 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-900 transition-colors flex items-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Telepon Langsung</span>
            </a>
            <a
              href="/products"
              className="bg-yellow-400 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
            >
              <span>Lihat Produk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;