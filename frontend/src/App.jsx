import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import useAuthStore from './store/store_customerStore';

/**
 * Komponen utama aplikasi yang mengatur routing
 * Landing page untuk guest user, Home untuk logged-in user
 */
function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Route utama - Landing untuk guest, Home untuk user login */}
          <Route path="/" element={isAuthenticated ? <Home /> : <LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Placeholder routes - akan dibuat nanti */}
          <Route path="/products" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Halaman Produk (Coming Soon)</h1></div>} />
          <Route path="/promo" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Halaman Promo (Coming Soon)</h1></div>} />
          <Route path="/categories" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Halaman Kategori (Coming Soon)</h1></div>} />
          <Route path="/contact" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Halaman Kontak (Coming Soon)</h1></div>} />
          <Route path="/about" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Tentang Kami (Coming Soon)</h1></div>} />
          <Route path="/profile" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Profil (Coming Soon)</h1></div>} />
          <Route path="/orders" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Pesanan Saya (Coming Soon)</h1></div>} />
          <Route path="/cart" element={<div className="container-custom section-padding"><h1 className="text-2xl font-bold">Keranjang (Coming Soon)</h1></div>} />
          {/* 404 Page */}
          <Route path="*" element={
            <div className="container-custom section-padding text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Halaman yang Anda cari tidak ditemukan.</p>
              <a href="/" className="btn-primary">Kembali ke Beranda</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;