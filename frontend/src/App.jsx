import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DemoBanner from './components/ui/DemoBanner';
import LandingPage from './pages/customer/LandingPage';
import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import Products from './pages/customer/Products';
import ProductsSimple from './pages/customer/ProductsSimple';
import ProductDetail from './pages/customer/ProductDetail';
import Promo from './pages/customer/Promo';
import Categories from './pages/customer/Categories';
import Contact from './pages/customer/Contact';
import Profile from './pages/customer/Profile';
import ProtectedRoute, { RoleBasedRedirect } from './components/auth/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import ProcurementManagement from './pages/admin/ProcurementManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

/**
 * Komponen utama aplikasi yang mengatur routing
 * Mendukung RBAC untuk customer dan admin area
 */
function App() {
  return (
    <Routes>
      {/* Root redirect berdasarkan role */}
      <Route path="/" element={<RoleBasedRedirect />} />

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
          <CustomerLayout>
            <Home />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <ProductsSimple />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/products/:id" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <ProductDetail />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/promo" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <Promo />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/categories" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <Categories />
          </CustomerLayout>
        </ProtectedRoute>
      } />

      <Route path="/contact" element={
        <ProtectedRoute requiredRole="customer">
          <CustomerLayout>
            <Contact />
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
            <Profile />
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
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/inventory" element={
        <ProtectedRoute requireAdmin={true}>
          <InventoryManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/products" element={
        <ProtectedRoute requireAdmin={true}>
          <ProductManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/procurement" element={
        <ProtectedRoute requireAdmin={true}>
          <ProcurementManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/categories" element={
        <ProtectedRoute requireAdmin={true}>
          <CategoryManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin={true}>
          <UserManagement />
        </ProtectedRoute>
      } />

      {/* Coming soon admin routes */}
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin={true}>
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
        <ProtectedRoute requireAdmin={true}>
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
        <ProtectedRoute requireAdmin={true}>
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
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default App;