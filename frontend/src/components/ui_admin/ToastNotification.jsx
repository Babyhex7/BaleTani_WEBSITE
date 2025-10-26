import { Toaster } from 'react-hot-toast';

/**
 * Komponen Toast Notification yang reusable
 * Digunakan di semua halaman admin untuk notifikasi yang konsisten
 */
const ToastNotification = () => {
  return (
    <Toaster 
      position="top-right"
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        // Default untuk semua toast
        duration: 3000,
        className: '',
        style: {
          background: '#111827', // gray-900 - hitam gelap
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          padding: '16px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
          minWidth: '320px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Success toast
        success: {
          duration: 3000,
          className: '',
          style: {
            background: '#111827', // hitam gelap
            color: '#ffffff', // teks putih
            border: '1px solid #10b981', // border hijau
          },
          iconTheme: {
            primary: '#10b981', // icon hijau
            secondary: '#111827', // background icon hitam
          },
        },
        // Error toast
        error: {
          duration: 4000,
          className: '',
          style: {
            background: '#111827', // hitam gelap
            color: '#ffffff', // teks putih
            border: '1px solid #ef4444', // border merah
          },
          iconTheme: {
            primary: '#ef4444', // icon merah
            secondary: '#111827', // background icon hitam
          },
        },
      }}
    />
  );
};

export default ToastNotification;
