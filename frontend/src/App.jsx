import { Routes, Route, Navigate } from 'react-router-dom';
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

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryManagement from './pages/admin/InventoryManagement';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import ProcurementManagement from './pages/admin/ProcurementManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import DiscountManagement from './pages/admin/DiscountManagement';
import StockOverview from './pages/admin/StockOverview';

/**
 * Komponen utama aplikasi yang mengatur routing
 * DUMMY UI BRANCH - No authentication required
 */
function App() {
  return (
    <Routes>
      {/* Root redirect to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/landing" element={
        <CustomerLayout>
          <LandingPage />
        </CustomerLayout>
      } />
      
      <Route path="/login" element={
        <CustomerLayout>
          <Login />
        </CustomerLayout>
      } />
      
      <Route path="/register" element={
        <CustomerLayout>
          <Register />
        </CustomerLayout>
      } />

      {/* Customer routes */}
      <Route path="/home" element={
        <CustomerLayout>
          <Home />
        </CustomerLayout>
      } />

      <Route path="/products" element={
        <CustomerLayout>
          <ProductsSimple />
        </CustomerLayout>
      } />

      <Route path="/products/:id" element={
        <CustomerLayout>
          <ProductDetail />
        </CustomerLayout>
      } />

      <Route path="/promo" element={
        <CustomerLayout>
          <Promo />
        </CustomerLayout>
      } />

      <Route path="/categories" element={
        <CustomerLayout>
          <Categories />
        </CustomerLayout>
      } />

      <Route path="/contact" element={
        <CustomerLayout>
          <Contact />
        </CustomerLayout>
      } />

      <Route path="/about" element={
        <CustomerLayout>
          <div className="container-custom section-padding">
            <h1 className="text-2xl font-bold">Tentang Kami (Coming Soon)</h1>
          </div>
        </CustomerLayout>
      } />

      <Route path="/profile" element={
        <CustomerLayout>
          <Profile />
        </CustomerLayout>
      } />

      <Route path="/orders" element={
        <CustomerLayout>
          <div className="container-custom section-padding">
            <h1 className="text-2xl font-bold">Pesanan Saya (Coming Soon)</h1>
          </div>
        </CustomerLayout>
      } />

      <Route path="/cart" element={
        <CustomerLayout>
          <div className="container-custom section-padding">
            <h1 className="text-2xl font-bold">Keranjang (Coming Soon)</h1>
          </div>
        </CustomerLayout>
      } />

      {/* Admin routes - NO AUTHENTICATION (Dummy UI Branch) */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/inventory" element={<InventoryManagement />} />
      <Route path="/admin/products" element={<ProductManagement />} />
      <Route path="/admin/procurement" element={<ProcurementManagement />} />
      <Route path="/admin/categories" element={<CategoryManagement />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/orders" element={<OrderManagement />} />
      <Route path="/admin/orders/online" element={<OrderManagement />} />
      <Route path="/admin/orders/offline" element={<OrderManagement />} />
      <Route path="/admin/orders/b2b" element={<OrderManagement />} />
      <Route path="/admin/customers" element={<CustomerManagement />} />

      {/* Coming soon admin routes */}
      <Route path="/admin/stock-overview" element={<StockOverview />} />
      <Route path="/admin/stock-overview-placeholder" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">� Stock Overview</h1>
            <p className="text-gray-600">Fitur ini akan segera hadir!</p>
            <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      } />

      <Route path="/admin/discounts" element={<DiscountManagement />} />
      <Route path="/admin/discounts-placeholder" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🏷️ Discount Management</h1>
            <p className="text-gray-600">Fitur ini akan segera hadir!</p>
            <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      } />

      <Route path="/admin/accounting" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">💰 Akuntansi</h1>
            <p className="text-gray-600">Fitur ini akan segera hadir!</p>
            <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
      } />

      <Route path="/admin/reports" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📋 Reports</h1>
            <p className="text-gray-600">Fitur ini akan segera hadir!</p>
            <a href="/admin/dashboard" className="mt-4 inline-block text-green-600 hover:text-green-700">
              ← Kembali ke Dashboard
            </a>
          </div>
        </div>
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