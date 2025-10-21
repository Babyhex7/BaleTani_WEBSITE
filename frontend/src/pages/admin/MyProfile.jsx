import React, { useState } from 'react';
import {
  UserCircleIcon,
  PencilIcon,
  CheckCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/layout_admin/AdminLayout';
import { Badge } from '../../components/ui_admin/CommonComponents';

/**
 * MyProfile - User profile page
 */
const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@baletani.com',
    phone: '081234567890',
    role: 'super_admin',
    avatar: '',
    address: 'Jl. Pertanian No. 123, Jakarta',
    bio: 'Super Admin at BaléTani Fresh Market',
    joinedDate: '2024-01-15',
    lastLogin: '2025-01-20 14:30:00',
  });

  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const roleLabels = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
    super_inventory_admin: { label: 'Super Inventory Admin', color: 'bg-blue-100 text-blue-700' },
    inventory_admin: { label: 'Inventory Admin', color: 'bg-cyan-100 text-cyan-700' },
    super_whatsapp_admin: { label: 'Super WhatsApp Admin', color: 'bg-green-100 text-green-700' },
    whatsapp_admin: { label: 'WhatsApp Admin', color: 'bg-emerald-100 text-emerald-700' },
    super_cashier: { label: 'Super Cashier', color: 'bg-orange-100 text-orange-700' },
    cashier: { label: 'Cashier', color: 'bg-yellow-100 text-yellow-700' },
    finance_admin: { label: 'Finance Admin', color: 'bg-pink-100 text-pink-700' },
  };

  const roleInfo = roleLabels[profile.role] || { label: profile.role, color: 'bg-gray-100 text-gray-700' };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-green-600 to-green-700"></div>

          {/* Avatar & Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 border border-gray-200">
                    <CameraIcon className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="ml-6 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <p className="text-gray-900 font-medium">{roleInfo.label}</p>
                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile.address}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Joined Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.joinedDate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Login</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.lastLogin}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-xs text-gray-500 mt-1">Last changed 30 days ago</p>
            </div>
            <a
              href="/admin/profile/change-password"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Change Password
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MyProfile;
