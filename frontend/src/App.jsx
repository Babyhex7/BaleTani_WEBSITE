import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/customer/LandingPage';
import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import ProductPage from './pages/customer/ProductPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import PromoPage from './pages/customer/PromoPage';
import ProtectedRoute, { RoleBasedRedirect } from './components/auth/ProtectedRoute';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import UserManagement from './pages/admin/UserManagement';

// New Admin Pages with Hero Icons
import AdminDashboardNew from './pages/admin/AdminDashboardNew';
import ProductListNew from './pages/admin/ProductListNew';
import CategoryManagement from './pages/admin/CategoryManagement';
import DiscountManagement from './pages/admin/DiscountManagement';

/**
 * Komponen utama aplikasi yang mengatur routing
 * Mendukung RBAC untuk customer dan admin area
 */
function App() {
  return (
    <Routes>
      {/* Root redirect berdasarkan role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin Login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Public routes (tidak perlu login) */}
      <Route path="/landing" element={
        <ProtectedRoute requireAuth={false}>
          <CustomerLayout>
            <LandingPage />
          </CustomerLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <CustomerLayout>
            <Login />
          </CustomerLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/register" element={
        <ProtectedRoute requireAuth={false}>
          <CustomerLayout>
            <Register />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      {/* Customer routes (hanya untuk customer) */}
      <Route path="/home" element={
        <ProtectedRoute requiredRole="customer">
          <Home />
        </ProtectedRoute>
      } />

      <Route path="/products" element={<ProductPage />} />

      <Route path="/products/:id" element={<ProductDetailPage />} />

      <Route path="/promo" element={<PromoPage />} />

      <Route path="/categories" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Halaman Kategori (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/contact" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Halaman Kontak (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/about" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Tentang Kami (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Profil (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Pesanan Saya (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/cart" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <div className="container-custom section-padding">
              <h1 className="text-2xl font-bold">Keranjang (Coming Soon)</h1>
            </div>
          </CustomerLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes (untuk admin dan staff) */}
      
      {/* Admin Dashboard with Hero Icons */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboardNew />
        </ProtectedRoute>
      } />

      {/* Product List with Hero Icons */}
      <Route path="/admin/products" element={
        <ProtectedRoute requiredRole="admin">
          <ProductListNew />
        </ProtectedRoute>
      } />

      {/* Category Management */}
      <Route path="/admin/categories" element={
        <ProtectedRoute requiredRole="admin">
          <CategoryManagement />
        </ProtectedRoute>
      } />

      {/* Discount Management */}
      <Route path="/admin/discounts" element={
        <ProtectedRoute requiredRole="admin">
          <DiscountManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      } />

      {/* Coming soon admin routes */}
      <Route path="/admin/orders" element={
        <ProtectedRoute requiredRole="admin">
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">🛒 Order Management</h1>
              <p className="text-gray-600">Fitur ini akan segera hadir!</p>
              <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
                ← Kembali ke Dashboard
              </a>
            </div>
          </div>
        </ProtectedRoute>
      } />

      <Route path="/admin/accounting" element={
        <ProtectedRoute requiredRole="admin">
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">💰 Akuntansi</h1>
              <p className="text-gray-600">Fitur ini akan segera hadir!</p>
              <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
                ← Kembali ke Dashboard
              </a>
            </div>
          </div>
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="admin">
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">📋 Reports</h1>
              <p className="text-gray-600">Fitur ini akan segera hadir!</p>
              <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
                ← Kembali ke Dashboard
              </a>
            </div>
          </div>
        </ProtectedRoute>
      } />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🚫 Akses Ditolak</h1>
            <p className="text-gray-600 mb-8">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <a href="/" className="btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      } />

      {/* 404 Page */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Halaman yang Anda cari tidak ditemukan.</p>
            <a href="/" className="btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

/**
 * Layout untuk customer area (dengan navbar dan footer)
 */
const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default App;