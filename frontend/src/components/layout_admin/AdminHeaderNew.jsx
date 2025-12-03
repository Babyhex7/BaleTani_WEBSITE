import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import useAdminStore from '../../store/store_admin/useAdminStore';
import dashboardService from '../../services/services_admin/dashboardService';
import { toast } from 'react-hot-toast';

const AdminHeaderNew = ({ title, subtitle }) => {
  const { admin, notifications, setDashboardData } = useAdminStore();
  const [localNotifications, setLocalNotifications] = useState(notifications || []);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync store notifications into local state when store updates
  useEffect(() => {
    setLocalNotifications(notifications || []);
  }, [notifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Fetch notifications from API
  const loadNotifications = async () => {
    try {
      // Instead of fetching from notifications endpoint, fetch recent orders
      // and map them to notification-like objects so new orders show here.
      const limit = 10;
      const res = await dashboardService.getRecentOrders(limit);

      // response shape may be { success: true, data: { recentOrders: [...] } }
      const orders = (res?.data?.recentOrders) || res?.recentOrders || res?.data || [];

      const mapped = (orders || []).map((o) => ({
        id: o.id,
        title: `Pesanan Baru • ${o.order_number}`,
        message: `${o.customer_name || o.customer_name || 'Pelanggan'} — ${o.total_amount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(o.total_amount) : ''}`,
        created_at: o.created_at || o.createdAt || new Date().toISOString(),
        read: false,
        source: 'order',
      }));

      setLocalNotifications(mapped);
      // update store notifications to keep store in sync
      setDashboardData({
        stats: null,
        recentOrders: orders || [],
        lowStockProducts: [],
        notifications: mapped,
      });
    } catch (err) {
      console.error('Failed to load recent orders as notifications', err);
    }
  };

  useEffect(() => {
    // load notifications on mount
    loadNotifications();
  }, []);
  const navigate = useNavigate();

  const markAllAsRead = async () => {
    try {
      // For order-sourced notifications we only keep read state locally.
      // For other types, attempt to call backend mark-as-read endpoint if available.
      const toMark = localNotifications || [];
      const nonOrderIds = toMark.filter(n => n.source !== 'order').map(n => n.id);

      if (nonOrderIds.length > 0) {
        await Promise.all(nonOrderIds.map(id => dashboardService.markNotificationAsRead(id).catch(() => null)));
      }

      const updated = (toMark || []).map(n => ({ ...n, read: true }));
      setLocalNotifications(updated);
      setDashboardData((prev) => ({
        stats: prev?.stats || null,
        recentOrders: prev?.recentOrders || [],
        lowStockProducts: prev?.lowStockProducts || [],
        notifications: updated,
      }));
      toast.success('Semua notifikasi telah ditandai dibaca');
    } catch (err) {
      console.error('Failed to mark all as read', err);
      toast.error('Gagal menandai semua notifikasi');
    }
  };
  
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title & Breadcrumb */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-green-100 p-2 rounded-lg">
                <MagnifyingGlassIcon className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title || 'Dashboard'}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Date, Notifications, Profile */}
          <div className="flex items-center gap-4">
            {/* Date & Time */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-700">{currentDate}</p>
              <p className="text-xs text-gray-500">{currentTime}</p>
            </div>

            {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((s) => !s)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-haspopup="true"
                  aria-expanded={open}
                >
                  <BellIcon className="w-6 h-6" />
                  {localNotifications && localNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {localNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="font-semibold">Notifikasi</div>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-xs text-green-600"
                          onClick={() => loadNotifications()}
                        >
                          Refresh
                        </button>
                        <button
                          className="text-xs text-gray-600"
                          onClick={() => markAllAsRead()}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {localNotifications && localNotifications.length > 0 ? (
                        localNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 items-start ${n.read ? '' : 'bg-gray-50'}`}
                              onClick={async () => {
                              try {
                                // If this notification originated from a real notification record,
                                // we could call the mark-as-read endpoint. For order-based notifications
                                // we mark read locally and update the store.
                                if (n.source === 'order') {
                                  // mark locally and navigate to order detail
                                  setLocalNotifications((prev) => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                  setDashboardData((prev) => ({
                                    stats: prev?.stats || null,
                                    recentOrders: prev?.recentOrders || [],
                                    lowStockProducts: prev?.lowStockProducts || [],
                                    notifications: (localNotifications || []).map(item => item.id === n.id ? { ...item, read: true } : item),
                                  }));
                                  toast.success('Notifikasi pesanan ditandai dibaca');
                                  // navigate to admin order management page
                                  setOpen(false);
                                  navigate(`/admin/orders`);
                                } else {
                                  // fallback for real notification records
                                  await dashboardService.markNotificationAsRead(n.id);
                                  setLocalNotifications((prev) => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                                  setDashboardData((prev) => ({
                                    stats: prev?.stats || null,
                                    recentOrders: prev?.recentOrders || [],
                                    lowStockProducts: prev?.lowStockProducts || [],
                                    notifications: (localNotifications || []).map(item => item.id === n.id ? { ...item, read: true } : item),
                                  }));
                                  toast.success('Notifikasi ditandai dibaca');
                                }
                              } catch (err) {
                                console.error('Mark read error', err);
                                toast.error('Gagal menandai notifikasi');
                              }
                            }}
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{n.title || 'Notifikasi'}</div>
                              <div className="text-xs text-gray-500 mt-1">{n.message}</div>
                              <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-gray-500">Tidak ada notifikasi</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {admin?.full_name || 'Super Administrator'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {admin?.role?.role_name?.replace(/_/g, ' ') || 'Admin'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {admin?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderNew;
