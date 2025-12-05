import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import TokenExpiryChecker from './components/auth/TokenExpiryChecker';
import AdminTokenExpiryChecker from './components/auth/AdminTokenExpiryChecker';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/customer/LandingPage';
import Home from './pages/customer/Home';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import ProductPage from './pages/customer/ProductPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import PromoPage from './pages/customer/PromoPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import CategoryPage from './pages/customer/CategoryPage';
import CategoryDetailPage from './pages/customer/CategoryDetailPage';
import ContactPage from './pages/customer/ContactPage';
import ProfilePage from './pages/customer/ProfilePage';
import PurchaseHistory from './pages/customer/PurchaseHistory';
import ProtectedRoute, { RoleBasedRedirect } from './components/auth/ProtectedRoute';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminManagement from './pages/admin/AdminManagement';

// New Admin Pages with Hero Icons
import AdminDashboardNew from './pages/admin/AdminDashboardNew';
import ProductListNew from './pages/admin/ProductListNew';
import CategoryManagement from './pages/admin/CategoryManagement';
import DiscountManagement from './pages/admin/DiscountManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import FAQManagement from './pages/admin/FAQManagement';
import ContactManagement from './pages/admin/ContactManagement';
import ProcurementList from './pages/admin/ProcurementList';
import SalesReport from './pages/admin/SalesReport';
import InventoryReport from './pages/admin/InventoryReport';

/**
 * Komponen utama aplikasi yang mengatur routing
 * Mendukung RBAC untuk customer dan admin area
 */
function App() {
  return (
    <ErrorBoundary>
      {/* Token Expiry Checker - Automatically checks token validity */}
      <TokenExpiryChecker />
      <AdminTokenExpiryChecker />
      
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          // Default options - 1 detik untuk semua
          duration: 1000,
          style: {
            background: '#0b1220',
            color: '#e6f4ea',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '14px',
            fontWeight: '500',
          },
          // Success - 1 detik
          success: {
            duration: 1000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#0b1220',
            },
            style: {
              background: '#0b1220',
              color: '#e6f4ea',
              border: '1px solid #10b981',
            },
          },
          // Error - 1 detik
          error: {
            duration: 1000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0b1220',
            },
            style: {
              background: '#0b1220',
              color: '#e6f4ea',
              border: '1px solid #ef4444',
              fontSize: '14px',
              fontWeight: '500',
            },
          },
        }}
      />
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

      <Route path="/cart" element={
        <ProtectedRoute requiredRole="customer">
          <CartPage />
        </ProtectedRoute>
      } />

      <Route path="/checkout" element={
        <ProtectedRoute requiredRole="customer">
          <CheckoutPage />
        </ProtectedRoute>
      } />

      <Route path="/order-success" element={
        <ProtectedRoute requiredRole="customer">
          <OrderSuccessPage />
        </ProtectedRoute>
      } />

      {/* Profile Page - Halaman profile customer */}
      <Route path="/profile" element={
        <ProtectedRoute requiredRole="customer">
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Purchase History - Riwayat Pembelian Customer */}
      <Route path="/purchase-history" element={
        <ProtectedRoute requiredRole="customer">
          <PurchaseHistory />
        </ProtectedRoute>
      } />

      {/* Categories - Daftar semua kategori */}
      <Route path="/categories" element={<CategoryPage />} />

      {/* Category Detail - Produk dalam kategori tertentu */}
      <Route path="/categories/:id" element={<CategoryDetailPage />} />

      {/* Contact Page - Halaman kontak customer */}
      <Route path="/contact" element={<ContactPage />} />

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

      {/* Customer Management */}
      <Route path="/admin/customers" element={
        <ProtectedRoute requiredRole="admin">
          <CustomerManagement />
        </ProtectedRoute>
      } />

      {/* FAQ Management */}
      <Route path="/admin/faqs" element={
        <ProtectedRoute requiredRole="admin">
          <FAQManagement />
        </ProtectedRoute>
      } />

      {/* Contact Messages Management */}
      <Route path="/admin/contacts" element={
        <ProtectedRoute requiredRole="admin">
          <ContactManagement />
        </ProtectedRoute>
      } />

      {/* Admin Management */}
      <Route path="/admin/admins" element={
        <ProtectedRoute requiredRole="admin">
          <AdminManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      } />

      {/* Order Management */}
      <Route path="/admin/orders" element={
        <ProtectedRoute requiredRole="admin">
          <OrderManagement />
        </ProtectedRoute>
      } />

      {/* Procurement Management */}
      <Route path="/admin/procurements" element={
        <ProtectedRoute requiredRole="admin">
          <ProcurementList />
        </ProtectedRoute>
      } />

      {/* Reports */}
      <Route path="/admin/reports/sales" element={
        <ProtectedRoute requiredRole="admin">
          <SalesReport />
        </ProtectedRoute>
      } />

      <Route path="/admin/reports/inventory" element={
        <ProtectedRoute requiredRole="admin">
          <InventoryReport />
        </ProtectedRoute>
      } />

      {/* Coming soon admin routes */}
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
            <a href="/landing" className="btn-primary">Kembali ke Beranda</a>
          </div>
        </div>
      } />
      </Routes>
    </ErrorBoundary>
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