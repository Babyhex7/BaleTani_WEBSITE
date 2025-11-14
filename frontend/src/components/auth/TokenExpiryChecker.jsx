/**
 * Token Expiry Checker Component
 * Mengecek token expired secara otomatis saat app dimuat dan setiap interval tertentu
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/store_customer/useAuthStore';

const TokenExpiryChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAndLogoutIfExpired } = useAuthStore();

  useEffect(() => {
    // Jangan cek jika user belum login
    if (!isAuthenticated) return;

    // Cek token saat pertama kali mount
    const isExpired = checkAndLogoutIfExpired();
    if (isExpired) {
      toast.error('Sesi login Anda telah habis. Silakan login kembali.');
      
      // Redirect ke login jika bukan di halaman publik
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
        navigate('/login');
      }
    }

    // Cek token setiap 1 menit
    const interval = setInterval(() => {
      const isExpired = checkAndLogoutIfExpired();
      if (isExpired) {
        toast.error('Sesi login Anda telah habis. Silakan login kembali.');
        
        // Redirect ke login
        if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
          navigate('/login');
        }
      }
    }, 60000); // 60000ms = 1 menit

    // Cleanup interval saat component unmount
    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndLogoutIfExpired, navigate, location.pathname]);

  // Component ini tidak render apa-apa
  return null;
};

export default TokenExpiryChecker;
