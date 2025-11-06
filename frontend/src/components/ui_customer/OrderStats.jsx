import React from 'react';
import { ShoppingBag, DollarSign, CheckCircle, Clock } from 'lucide-react';

/**
 * OrderStats Component
 * Menampilkan statistik order customer (4 cards)
 */
const OrderStats = ({ stats = {} }) => {
  const {
    total_orders = 0,
    total_spending = 0,
    completed_orders = 0,
    pending_orders = 0
  } = stats;

  // Format currency to Rupiah
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const statsData = [
    {
      icon: ShoppingBag,
      label: 'Total Pesanan',
      value: total_orders,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      icon: DollarSign,
      label: 'Total Belanja',
      value: formatCurrency(total_spending),
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      icon: CheckCircle,
      label: 'Pesanan Selesai',
      value: completed_orders,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      icon: Clock,
      label: 'Sedang Diproses',
      value: pending_orders,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStats;
