import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/store_customer/useAuthStore';
import useCartStore from '../../store/store_customer/useCartStore';
import Button from '../ui/Button';
import logoBaletani from '../../assets/img/BaleTanii.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Subscribe to items array so component re-renders when cart changes
  const items = useCartStore((state) => state.items);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = getTotalItems();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Dynamic nav links based on authentication
  const navLinks = isAuthenticated 
    ? [
        { name: 'Beranda', href: '/home', current: true },
        { name: 'Produk', href: '/products', current: false },
        { name: 'Promo', href: '/promo', current: false },
        { name: 'Kategori', href: '/categories', current: false },
        { name: 'Kontak', href: '/contact', current: false },
      ]
    : [
        { name: 'Produk', href: '/products', current: false },
        { name: 'Promo', href: '/promo', current: false },
        { name: 'Kategori', href: '/categories', current: false },
        { name: 'Kontak', href: '/contact', current: false },
      ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-navbar safe-top">
      <div className="container-app">
        <div className="flex justify-between items-center btn-touch">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? '/home' : '/landing'} className="flex items-center gap-2 sm:gap-2.5 py-2 sm:py-3">
              <img 
                src={logoBaletani} 
                alt="BaleTani Logo" 
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg leading-tight text-gray-900">balétani</span>
                <span className="text-[10px] sm:text-xs text-gray-500 leading-none">Fresh Market</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 hover:text-primary-600 px-3 lg:px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Cart - Only show if authenticated */}
            {isAuthenticated && (
              <Link 
                data-cy="cart-icon"
                to="/cart"
                className="relative p-2 lg:p-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                {totalItems > 0 && (
                  <span data-cy="cart-count" className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium truncate max-w-[100px] lg:max-w-[140px]">{user?.full_name || user?.email}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-dropdown">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/purchase-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Pesanan Saya
                    </Link>
                    <Link
                      to="/cart"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Keranjang ({totalItems})
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Cart + Menu */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Cart Icon */}
            {isAuthenticated && (
              <Link 
                data-cy="cart-icon"
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-primary-600 active:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span data-cy="cart-count" className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-primary-600 active:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2 transition-colors"
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth */}
              <div className="border-t border-gray-100 mt-2 pt-3">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500">
                      Halo, {user?.full_name || user?.email}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2 transition-colors"
                      onClick={closeMenu}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/purchase-history"
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-2 transition-colors"
                      onClick={closeMenu}
                    >
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg mx-2 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-2">
                    <Link to="/login" onClick={closeMenu}>
                      <Button variant="ghost" size="md" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMenu}>
                      <Button variant="primary" size="md" className="w-full">
                        Daftar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;