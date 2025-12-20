/**
 * Customer Profile Service
 * API calls untuk kelola profile customer
 */

import apiClient from "../../utils/apiClient";

/**
 * Get customer profile dengan statistik
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get("/customer/profile");
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

/**
 * Update nama customer
 */
export const updateProfile = async (data) => {
  try {
    const response = await apiClient.put("/customer/profile", data);
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

/**
 * Ganti password customer
 */
export const changePassword = async (passwords) => {
  try {
    const response = await apiClient.put(
      "/customer/profile/password",
      passwords
    );
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

/**
 * Logout customer
 */
export const logout = async () => {
  try {
    const response = await apiClient.post("/customer/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
