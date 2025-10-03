import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';

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
    <footer className="bg-gray-900 text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">BaleTani</span>
                  <span className="text-sm text-gray-400 -mt-1">Fresh Market</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Menyediakan produk segar berkualitas tinggi langsung dari kebun ke rumah Anda. 
                Segar, cepat, dan terjangkau.
              </p>
              <div className="text-sm">
                <p className="text-primary-400 font-semibold italic">
                  "Dari kebun ke Balé, dari Balé ke rumahmu"
                </p>
              </div>
            </div>

            {/* Products Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary-400">Produk</h3>
              <ul className="space-y-3">
                {footerLinks.produk.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary-400">Informasi</h3>
              <ul className="space-y-3">
                {footerLinks.informasi.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary-400">Kontak Kami</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-primary-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Jl. Fresh Market No. 123<br />
                    Kota Segar, Indonesia
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-primary-400 flex-shrink-0" />
                  <a 
                    href="tel:+6281234567890" 
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    +62 812-3456-7890
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-primary-400 flex-shrink-0" />
                  <a 
                    href="mailto:info@baletani.com" 
                    className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    info@baletani.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-primary-400">Ikuti Kami</h4>
                <div className="flex space-x-4">
                  <a 
                    href="https://wa.me/6281234567890" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <MessageCircle size={18} />
                  </a>
                  <a 
                    href="https://instagram.com/baletani" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-pink-600 hover:bg-pink-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Instagram size={18} />
                  </a>
                  <a 
                    href="https://facebook.com/baletani" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} BaleTani Fresh Market. Hak cipta dilindungi.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/terms" className="hover:text-primary-400 transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link to="/privacy" className="hover:text-primary-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="/sitemap" className="hover:text-primary-400 transition-colors">
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