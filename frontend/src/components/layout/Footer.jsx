import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';
import logoBaletani from '../../assets/img/baletani_white.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produk: [
      { name: 'Sayuran Segar', href: '/kategori/sayur' },
      { name: 'Buah-buahan', href: '/kategori/buah' },
      { name: 'Daging & Unggas', href: '/kategori/daging' },
      { name: 'Seafood', href: '/kategori/seafood' },
    ],
    informasi: [
      { name: 'Tentang Kami', href: '/about' },
      { name: 'Cara Pemesanan', href: '/cara-pesan' },
      { name: 'Syarat & Ketentuan', href: '/terms' },
      { name: 'Kebijakan Privasi', href: '/privacy' },
    ],
    layanan: [
      { name: 'Bantuan', href: '/help' },
      { name: 'Pengiriman', href: '/delivery' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Kontak', href: '/contact' },
    ]
  };

  return (
    <footer className="bg-gray-900 text-white safe-bottom">
      <div className="container-app">
        {/* Main Footer Content */}
        <div className="section-py">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={logoBaletani} 
                  alt="BaleTani Logo" 
                  className="h-12 sm:h-14 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-base sm:text-lg leading-tight">balétani</span>
                  <span className="text-xs text-gray-400 leading-none">Fresh Market</span>
                </div>
              </div>
              <p className="text-caption text-gray-300 leading-relaxed">
                Menyediakan produk segar berkualitas tinggi langsung dari kebun ke rumah Anda. 
                Segar, cepat, dan terjangkau.
              </p>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm text-primary-400 font-semibold italic">
                  "Dari kebun ke Balé, dari Balé ke rumahmu"
                </p>
              </div>
            </div>

            {/* Products Links */}
            <div>
              <h3 className="heading-sub text-primary-400 mb-3 sm:mb-4">Produk</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {footerLinks.produk.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-caption text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information Links */}
            <div>
              <h3 className="heading-sub text-primary-400 mb-3 sm:mb-4">Informasi</h3>
              <ul className="space-y-2 sm:space-y-2.5">
                {footerLinks.informasi.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-caption text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="heading-sub text-primary-400 mb-3 sm:mb-4">Kontak Kami</h3>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <MapPin size={16} className="text-primary-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <p className="text-caption text-gray-300 leading-relaxed">
                    Jl. Fresh Market No. 123<br />
                    Kota Segar, Indonesia
                  </p>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Phone size={16} className="text-primary-400 flex-shrink-0" />
                  <a 
                    href="tel:+6281234567890" 
                    className="text-caption text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    +62 812-3456-7890
                  </a>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Mail size={16} className="text-primary-400 flex-shrink-0" />
                  <a 
                    href="mailto:info@baletani.com" 
                    className="text-caption text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    info@baletani.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-4 sm:mt-6">
                <h4 className="text-sm font-medium mb-2.5 sm:mb-3 text-primary-400">Ikuti Kami</h4>
                <div className="flex gap-3 sm:gap-4">
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-touch w-10 h-10 sm:w-11 sm:h-11 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                  <a 
                    href="https://instagram.com/baletani" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-touch w-10 h-10 sm:w-11 sm:h-11 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                  <a 
                    href="https://facebook.com/baletani" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-touch w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-4 sm:py-5 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="text-caption text-gray-400 text-center sm:text-left">
              © {currentYear} BaleTani Fresh Market. Hak cipta dilindungi.
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-caption text-gray-400">
              <Link to="/terms" className="hover:text-primary-400 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="/sitemap" className="hover:text-primary-400 transition-colors hidden sm:inline">
                Peta Situs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;