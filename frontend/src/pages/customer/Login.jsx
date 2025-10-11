import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import authService from '../../services/services_customer/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();

  // Debug initial mount state
  useEffect(() => {
    if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
      // Lazy import to avoid circular
      import('../../utils/debugLogger').then(({ debugLog }) => {
        debugLog('LOGIN', 'Mount Login component', {
          formData,
          location: window.location.pathname,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
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
      const response = await authService.login(formData);
      if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
        const { debugLog } = await import('../../utils/debugLogger');
        debugLog('LOGIN', 'Login success raw response', response);
      }
      
      // authService.login sudah return format yang benar
      login(response.user, response.token);
      toast.success(response.message || 'Login berhasil!');
      
      // Redirect berdasarkan role user dengan delay singkat untuk UX
      setTimeout(() => {
        if (response.user.role === 'admin' || response.user.role === 'staff') {
          navigate('/admin/dashboard');
        } else {
          navigate('/home');
        }
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
        const { debugLog } = await import('../../utils/debugLogger');
        debugLog('LOGIN', 'Login failed', { error });
      }
      toast.error(error.message || 'Login gagal. Silakan coba lagi.');
      
      // Handle specific errors
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to home button */}
        <div className="mb-6">
          <Link 
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <img 
              src="/BaleTani_Logo.png" 
              alt="BaleTani" 
              className="w-16 h-16 object-contain rounded-xl" 
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Masuk ke BaleTani
          </h2>
          <p className="text-gray-600">
            Selamat datang kembali! Silakan masuk ke akun Anda.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email field */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              autoComplete="email"
              placeholder="Masukkan email Anda"
            />

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200
                    ${errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                  `}
                  placeholder="Masukkan password Anda"
                  required
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

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-primary-500 hover:text-primary-600 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Belum punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;