import React from 'react';
import {
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import useAdminStore from '../../store/store_admin/useAdminStore';

const AdminHeaderNew = ({ title, subtitle }) => {
  const { admin } = useAdminStore();
  
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
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

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
