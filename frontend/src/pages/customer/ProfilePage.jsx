import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  ShoppingBagIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { getProfile } from "../../services/services_customer/profileService";
import useAuthStore from "../../store/store_customer/useAuthStore";
import ProfileEditModal from "../../components/ui_customer/ProfileEditModal";
import PasswordChangeModal from "../../components/ui_customer/PasswordChangeModal";
import { formatCurrency } from "../../utils/formatCurrency";
import { toast } from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // profile or orders
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log("Profile Response:", response); // Debug
      if (response.success) {
        setProfile(response.data);
        console.log("Profile Data:", response.data); // Debug
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Gagal memuat data profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Saya</h1>
          <p className="text-gray-600 mb-8">Kelola informasi profile dan preferensi Anda</p>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === "profile"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserCircleIcon className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === "orders"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Pesanan
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.full_name || "User"}
                      </h2>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Terverifikasi
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {profile?.phone_number || "-"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Bergabung {formatDate(profile?.member_since)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Informasi Profile</h3>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Name Field */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-600">Nama Lengkap</div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={profile?.full_name || "-"}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-600">Nomor Telepon</div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={profile?.phone_number || "-"}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Change Password Link */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      Ganti Password →
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {profile?.statistics?.total_orders || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Pesanan</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(profile?.statistics?.total_spending || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Belanja</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Fitur Pesanan (Coming Soon)
              </h3>
              <p className="text-gray-600">
                Halaman daftar pesanan akan segera tersedia
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchProfile();
          }}
        />
      )}

      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default ProfilePage;
