/**
 * Admin Token Expiry Checker Component
 * Mengecek token admin expired secara otomatis saat app dimuat dan setiap interval tertentu
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAdminStore from '../../store/store_admin/useAdminStore';

const AdminTokenExpiryChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkAndLogoutIfExpired } = useAdminStore();

  useEffect(() => {
    // Jangan cek jika admin belum login
    if (!isAuthenticated) return;

    // Cek token saat pertama kali mount
    const isExpired = checkAndLogoutIfExpired();
    if (isExpired) {
      toast.error('Sesi login admin Anda telah habis. Silakan login kembali.');
      
      // Redirect ke admin login
      if (!location.pathname.startsWith('/admin/login')) {
        navigate('/admin/login');
      }
    }

    // Cek token setiap 5 menit (admin token 7 hari jadi interval lebih panjang)
    const interval = setInterval(() => {
      const isExpired = checkAndLogoutIfExpired();
      if (isExpired) {
        toast.error('Sesi login admin Anda telah habis. Silakan login kembali.');
        
        // Redirect ke admin login
        if (!location.pathname.startsWith('/admin/login')) {
          navigate('/admin/login');
        }
      }
    }, 300000); // 300000ms = 5 menit

    // Cleanup interval saat component unmount
    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndLogoutIfExpired, navigate, location.pathname]);

  // Component ini tidak render apa-apa
  return null;
};

export default AdminTokenExpiryChecker;
