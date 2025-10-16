import adminApiClient from "./adminApiClient";

/**
 * Service untuk API User Management
 * CRUD users dan manajemen role
 */

// Mendapatkan daftar users dengan pagination dan filter
export const getUsers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(`/admin/users?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil data pengguna" };
  }
};

// Mendapatkan detail user
export const getUserById = async (id) => {
  try {
    const response = await adminApiClient.get(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil detail pengguna" }
    );
  }
};

// Membuat user baru
export const createUser = async (userData) => {
  try {
    const response = await adminApiClient.post("/admin/users", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal membuat pengguna baru" };
  }
};

// Memperbarui user
export const updateUser = async (id, userData) => {
  try {
    const response = await adminApiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memperbarui pengguna" };
  }
};

// Menghapus user
export const deleteUser = async (id) => {
  try {
    const response = await adminApiClient.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menghapus pengguna" };
  }
};

// Update role user
export const updateUserRole = async (id, role) => {
  try {
    const response = await adminApiClient.patch(`/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal memperbarui role pengguna" }
    );
  }
};

// Reset password user
export const resetUserPassword = async (id, newPassword) => {
  try {
    const response = await adminApiClient.patch(
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
    const response = await adminApiClient.get("/admin/users/stats");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil statistik pengguna" }
    );
  }
};
