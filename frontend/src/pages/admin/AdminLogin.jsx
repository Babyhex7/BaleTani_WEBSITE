import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminAuthService from '../../services/services_admin/adminAuthService';
import useAdminStore from '../../store/store_admin/useAdminStore';

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
      toast.error(error.message || 'Login gagal. Silakan coba lagi.');
      
      if (error.errors) {
        const fieldErrors = {};
        error.errors.forEach(err => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            BaleTani Admin
          </h1>
          <p className="text-slate-400">
            Silakan login untuk mengakses dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-gray-400" size={20} />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200
                    ${errors.phoneNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                  `}
                  placeholder="6282111111111"
                  autoComplete="tel"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-200
                    ${errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                  `}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white
                bg-gradient-to-r from-primary-500 to-accent-500
                hover:from-primary-600 hover:to-accent-600
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Test login: <span className="font-mono text-gray-700">081234567808</span> / <span className="font-mono text-gray-700">admin123</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Super Admin dengan akses penuh ke semua modul
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            © 2025 BaleTani. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
