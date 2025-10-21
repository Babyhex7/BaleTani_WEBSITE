import React, { useState } from 'react';
import {
  CogIcon,
  BuildingStorefrontIcon,
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';

/**
 * SystemPreferences - System configuration & settings
 */
const SystemPreferences = () => {
  const [settings, setSettings] = useState({
    // Business Info
    businessName: 'BaléTani Fresh Market',
    businessAddress: 'Jl. Pertanian No. 123, Jakarta',
    businessPhone: '021-12345678',
    businessEmail: 'info@baletani.com',
    businessLogo: '',
    
    // Operational
    workingHours: '08:00 - 20:00',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    taxRate: 11,
    
    // Stock Management
    lowStockThreshold: 10,
    autoStockAlert: true,
    stockUpdateInterval: 60, // minutes
    
    // Order Management
    autoApproveOrders: false,
    orderTimeout: 24, // hours
    minOrderAmount: 50000,
    
    // Notifications
    emailNotifications: true,
    whatsappNotifications: true,
    smsNotifications: false,
    notifyOnLowStock: true,
    notifyOnNewOrder: true,
    notifyOnProcurementApproval: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate save
    setTimeout(() => {
      setSaved(true);
      alert('Settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default?')) {
      // Reset logic here
      alert('Settings reset to default!');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Preferences</h1>
            <p className="text-gray-600 mt-1">Konfigurasi sistem & pengaturan aplikasi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Business Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <input
                type="text"
                value={settings.businessAddress}
                onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Operational Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="IDR">IDR (Indonesian Rupiah)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CogIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Stock Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Alert ketika stok kurang dari nilai ini</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Update Interval (minutes)</label>
              <input
                type="number"
                value={settings.stockUpdateInterval}
                onChange={(e) => setSettings({ ...settings, stockUpdateInterval: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoStockAlert}
                  onChange={(e) => setSettings({ ...settings, autoStockAlert: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto Stock Alert</p>
                  <p className="text-xs text-gray-500">Kirim notifikasi otomatis saat stok menipis</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900">Order Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Timeout (hours)</label>
              <input
                type="number"
                value={settings.orderTimeout}
                onChange={(e) => setSettings({ ...settings, orderTimeout: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-cancel order jika tidak dibayar dalam waktu ini</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount (Rp)</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveOrders}
                  onChange={(e) => setSettings({ ...settings, autoApproveOrders: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto Approve Orders</p>
                  <p className="text-xs text-gray-500">Setujui order otomatis tanpa review manual</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BellIcon className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Kirim notifikasi via email</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappNotifications}
                onChange={(e) => setSettings({ ...settings, whatsappNotifications: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">WhatsApp Notifications</p>
                <p className="text-xs text-gray-500">Kirim notifikasi via WhatsApp</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-500">Kirim notifikasi via SMS</p>
              </div>
            </label>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-sm font-semibold text-gray-900 mb-3">Notifikasi Event:</p>
              <div className="space-y-2 ml-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnLowStock}
                    onChange={(e) => setSettings({ ...settings, notifyOnLowStock: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Stok menipis</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewOrder}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewOrder: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Order baru</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnProcurementApproval}
                    onChange={(e) => setSettings({ ...settings, notifyOnProcurementApproval: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Procurement perlu approval</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemPreferences;
