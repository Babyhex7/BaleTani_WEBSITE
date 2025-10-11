import apiClient from "../services_customer/apiClient";
import { mockAdminServices } from "../../utils/mockAdminData";

// Demo mode - set to true to use mock data
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || true;

/**
 * Service untuk API User Management
 * CRUD users dan manajemen role
 */

// Mendapatkan daftar users dengan pagination dan filter
export const getUsers = async (params = {}) => {
  if (DEMO_MODE) {
    return await mockAdminServices.getUserData(params);
  }
  
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/admin/users?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil data pengguna" };
  }
};

// Mendapatkan detail user
export const getUserById = async (id) => {
  if (DEMO_MODE) {
    return await mockAdminServices.getUserById(parseInt(id));
  }
  
  try {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil detail pengguna" }
    );
  }
};

// Membuat user baru
export const createUser = async (userData) => {
  if (DEMO_MODE) {
    return await mockAdminServices.createUser(userData);
  }
  
  try {
    const response = await apiClient.post("/admin/users", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal membuat pengguna baru" };
  }
};

// Memperbarui user
export const updateUser = async (id, userData) => {
  if (DEMO_MODE) {
    return await mockAdminServices.updateUser(parseInt(id), userData);
  }
  
  try {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memperbarui pengguna" };
  }
};

// Menghapus user
export const deleteUser = async (id) => {
  if (DEMO_MODE) {
    return await mockAdminServices.deleteUser(id);
  }
  
  try {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menghapus pengguna" };
  }
};

// Update role user
export const updateUserRole = async (id, role) => {
  if (DEMO_MODE) {
    return await mockAdminServices.updateUser(parseInt(id), { role });
  }
  
  try {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal memperbarui role pengguna" }
    );
  }
};

// Update status user
export const updateUserStatus = async (id, status) => {
  if (DEMO_MODE) {
    return await mockAdminServices.updateUserStatus(parseInt(id), status);
  }
  
  try {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal memperbarui status pengguna" }
    );
  }
};

// Reset password user
export const resetUserPassword = async (id, newPassword) => {
  try {
    const response = await apiClient.patch(
      `/admin/users/${id}/reset-password`,
      { password: newPassword }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mereset password pengguna" }
    );
  }
};

// Mendapatkan statistik users
export const getUserStats = async () => {
  try {
    const response = await apiClient.get("/admin/users/stats");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil statistik pengguna" }
    );
  }
};
