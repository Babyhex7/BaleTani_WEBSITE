import React, { useState } from 'react';
import AdminSidebarNew from '../../components/layout_admin/AdminSidebarNew';
import AdminHeaderNew from '../../components/layout_admin/AdminHeaderNew';
import SalesReport from '../../components/ui_admin/SalesReport';
import ProcurementReport from '../../components/ui_admin/ProcurementReport';
import StockMovementReport from '../../components/ui_admin/StockMovementReport';
import FinanceReport from '../../components/ui_admin/FinanceReport';
import {
  ChartBarIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', name: 'Sales Report', icon: ChartBarIcon },
    { id: 'procurement', name: 'Procurement Report', icon: TruckIcon },
    { id: 'stock', name: 'Stock Movement', icon: ArrowsRightLeftIcon },
    { id: 'finance', name: 'Finance Report', icon: CurrencyDollarIcon }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebarNew />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Analisis penjualan, pengadaan, pergerakan stok, dan keuangan
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                        ${activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'sales' && <SalesReport />}
            {activeTab === 'procurement' && <ProcurementReport />}
            {activeTab === 'stock' && <StockMovementReport />}
            {activeTab === 'finance' && <FinanceReport />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
