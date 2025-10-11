import { Info } from 'lucide-react';

const DemoBanner = () => {
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  
  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-200">
      <div className="container-custom">
        <div className="py-2 flex items-center justify-center space-x-2 text-yellow-800">
          <Info size={16} />
          <span className="text-sm font-medium">
            🚀 Mode Demo Aktif - Gunakan: admin@baletani.com/admin123 atau customer@baletani.com/customer123
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;