import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminAuthService from '../../services/services_admin/adminAuthService';
import useAdminStore from '../../store/store_admin/useAdminStore';
import logo from '../../assets/img/BaleTanii.png';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, setLoading } = useAdminStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Nomor telepon wajib diisi';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const loginData = {
        phone_number: formData.phoneNumber,
        password: formData.password
      };
      
      // Gunakan adminAuthService, bukan apiClient biasa
      const response = await adminAuthService.login(loginData);
      
      // response berisi { admin, token, permissions, message }
      console.log('[AdminLogin] Login response:', response);
      console.log('[AdminLogin] Permissions count:', response.permissions?.length || 0);
      
      // Save ke admin store dengan permissions
      login(response.admin, response.token, response.permissions || []);
      
      toast.success(response.message || 'Login berhasil!');
      
      // Redirect ke admin dashboard
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('[AdminLogin] Login error:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        // Backend mengirim: { success: false, message: '...' }
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== 'Request failed with status code 401') {
        // Fallback ke error.message tapi hindari generic axios message
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Handle specific field validation errors
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path) {
            fieldErrors[err.path] = err.msg;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Brand Section (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden rounded-tr-[3rem] rounded-br-[3rem]">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djRoNHYtNGgtNHptLTIgNnY0aDR2LTRoLTR6bS00IDR2NGg0di00aC00em0tMiA2djRoNHYtNGgtNHptLTQgNHY0aDR2LTRoLTR6bS0yIDZ2NGg0di00aC00em0tNCA0djRoNHYtNGgtNHptLTIgNnY0aDR2LTRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-start px-12 xl:px-16 text-white w-full pt-20">
          {/* Logo & Brand */}
          <div className="mb-8 animate-scale-in">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Hello
              <br />
              BaleTani! 👋
            </h1>
            <p className="text-lg xl:text-xl text-white/90 leading-relaxed max-w-md">
              Kelola toko online Anda dengan mudah. Dashboard modern untuk mengelola produk, pesanan, dan pelanggan.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Manajemen Produk</p>
                <p className="text-sm text-white/80">Kelola produk organik dengan mudah</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Tracking Pesanan</p>
                <p className="text-sm text-white/80">Monitor pesanan real-time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Analitik Lengkap</p>
                <p className="text-sm text-white/80">Dashboard dengan insights mendalam</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-12">
            <p className="text-white/60 text-sm">
              © 2025 BaleTani. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8 animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BaleTani Admin</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              Login dengan akun admin untuk melanjutkan
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="admin-label block mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-gray-400" size={18} />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`
                    input-touch w-full pl-10 pr-4 border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-all duration-200
                    ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  `}
                  placeholder="081234567808"
                  autoComplete="tel"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="admin-label block mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    input-touch w-full pl-10 pr-12 border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-all duration-200
                    ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                  `}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                btn-touch w-full bg-gray-900 hover:bg-gray-800 text-white
                rounded-lg font-semibold shadow-sm hover:shadow-md
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Login Now'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 lg:bg-white text-gray-500">Test Account</span>
            </div>
          </div>

          {/* Test Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">Demo Login:</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                Phone: <span className="font-mono text-gray-900 font-semibold">081234567808</span>
              </p>
              <p className="text-gray-600">
                Password: <span className="font-mono text-gray-900 font-semibold">admin123</span>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Super Admin dengan akses penuh ke semua modul
            </p>
          </div>

          {/* Footer (Mobile only) */}
          <div className="lg:hidden text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 BaleTani. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
