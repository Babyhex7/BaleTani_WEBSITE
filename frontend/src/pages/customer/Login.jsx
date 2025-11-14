import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import authService from '../../services/services_customer/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    phoneNumber: location.state?.phoneNumber || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();

  // Show success message if coming from registration
  useEffect(() => {
    if (location.state?.registered) {
      toast.success('Registrasi berhasil! Silakan login dengan akun Anda.');
      // Clear the state to prevent toast from showing again on refresh
      window.history.replaceState({}, document.title);
    }
    
    if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
      // Lazy import to avoid circular
      import('../../utils/debugLogger').then(({ debugLog }) => {
        debugLog('LOGIN', 'Mount Login component', {
          formData,
          location: window.location.pathname,
          fromRegistration: location.state?.registered || false,
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

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Nomor telepon wajib diisi';
    } else {
      // More flexible validation - accept 08xx, 62xxx, +62xxx
      const cleaned = formData.phoneNumber.replace(/[\s-]/g, '');
      if (!/^(0|62|\+62)[0-9]{9,13}$/.test(cleaned)) {
        newErrors.phoneNumber = 'Format nomor telepon tidak valid (08xx, 62xxx, atau +62xxx)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Normalize phone number to 62 format (consistent with backend)
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Convert 08xx to 628xx
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      // Convert 8xx to 628xx
      cleaned = '62' + cleaned;
    } else if (!cleaned.startsWith('62')) {
      // Add 62 if not present
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // Normalize phone number before sending to backend
      const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
      
      // Transform data to match backend API
      const loginData = {
        phone_number: normalizedPhone,
        password: formData.password
      };
      
      const response = await authService.login(loginData);
      if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
        const { debugLog } = await import('../../utils/debugLogger');
        debugLog('LOGIN', 'Login success raw response', response);
      }
      
      // authService.login sudah return format yang benar
      login(response.customer, response.token);
      toast.success(response.message || 'Login berhasil!');
      
      // Navigate to customer home
      setTimeout(() => {
        navigate('/home');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to home button */}
        <div className="mb-4 sm:mb-6">
          <Link 
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 transition-colors btn-touch text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">B</span>
          </div>
          <h2 className="heading-section text-gray-900 mb-2">
            Masuk ke BaleTani
          </h2>
          <p className="text-body text-gray-600">
            Selamat datang kembali! Silakan masuk ke akun Anda.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Phone Number field */}
            <Input
              label="Nomor Telepon"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              error={errors.phoneNumber}
              required
              autoComplete="tel"
              placeholder="08xx, 62xx, atau +62xx"
            />

            {/* Password field */}
            <div>
              <label className="block text-caption sm:text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200 input-touch text-caption sm:text-sm
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 btn-touch"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-caption sm:text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-caption sm:text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              <div className="text-caption sm:text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-primary-500 hover:text-primary-600 transition-colors btn-touch"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full btn-touch"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Belum punya akun?
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link to="/register">
                <Button variant="outline" className="w-full btn-touch">
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