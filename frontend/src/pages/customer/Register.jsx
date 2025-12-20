import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';
import authService from '../../services/services_customer/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import logoBaletani from '../../assets/img/BaleTanii.png';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setLoading } = useAuthStore();

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

    if (!formData.fullName) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sesuai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Sangat Lemah', color: 'bg-red-500' },
      { strength: 2, label: 'Lemah', color: 'bg-red-400' },
      { strength: 3, label: 'Sedang', color: 'bg-yellow-500' },
      { strength: 4, label: 'Kuat', color: 'bg-green-500' },
      { strength: 5, label: 'Sangat Kuat', color: 'bg-green-600' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
      const { confirmPassword, ...registerData } = formData;
      
      // Normalize phone number before sending to backend
      const normalizedPhone = normalizePhoneNumber(registerData.phoneNumber);
      
      // Transform data to match backend API
      const apiData = {
        phone_number: normalizedPhone,
        full_name: registerData.fullName,
        password: registerData.password
      };
      
      const response = await authService.register(apiData);
      
      if (response.success) {
        // Don't show toast here, let Login page handle it
        // Redirect to login page with normalized phone number
        navigate('/login', { 
          state: { 
            registered: true,
            phoneNumber: normalizedPhone
          } 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';
      
      if (error.response?.data?.message) {
        // Backend mengirim: { success: false, message: '...' }
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== 'Request failed with status code 400') {
        // Fallback ke error.message tapi hindari generic axios message
        errorMessage = error.message;
      }
      
      // Handle rate limit error (429)
      if (error.response?.status === 429) {
        const retryAfter = error.response.data?.retryAfter || 3600;
        const retryMinutes = Math.ceil(retryAfter / 60);
        errorMessage = `Terlalu banyak percobaan registrasi. Silakan coba lagi setelah ${retryMinutes} menit.`;
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
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow-xl rounded-xl border border-gray-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Logo and title */}
              <div className="text-center">
                <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-3 sm:mb-4">
                  <img 
                    src={logoBaletani} 
                    alt="BaleTani Logo" 
                    className="w-full h-full object-contain"/>
                </div>
                <p className="text-body text-gray-600">
                  Bergabunglah dengan kami dan nikmati produk segar berkualitas tinggi!
                </p>
              </div>
            {/* Full Name field */}
            <Input
              label="Nama Lengkap"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              required
              autoComplete="name"
              placeholder="Masukkan nama lengkap Anda"
            />

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
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 btn-touch"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-caption sm:text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label className="block text-caption sm:text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200 input-touch text-caption sm:text-sm
                    ${errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                  `}
                  placeholder="Konfirmasi password Anda"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 btn-touch"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
                
                {/* Password match indicator */}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-11 sm:right-12 flex items-center">
                    <CheckCircle size={14} className="sm:w-4 sm:h-4 text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-caption sm:text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5 pt-0.5">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="text-caption sm:text-sm">
                <label htmlFor="agree-terms" className="text-gray-700">
                  Saya setuju dengan{' '}
                  <Link to="/terms" className="text-primary-500 hover:text-primary-600 underline">
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link to="/privacy" className="text-primary-500 hover:text-primary-600 underline">
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full btn-touch"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Sudah punya akun?
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link to="/login">
                <Button variant="outline" className="w-full btn-touch">
                  Masuk ke Akun Anda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;