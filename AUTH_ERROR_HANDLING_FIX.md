# Fix: Auth Error Handling & Retry Logic

## 🐛 Masalah yang Diperbaiki

### 1. **Toast Notification Menampilkan "Retry Count"**

- Login/register gagal menampilkan pesan error yang berisi informasi retry count
- Contoh: "Retry attempt 1/3" atau "Network Error after 3 retries"
- **Root Cause**: Retry logic di `apiClient.js` dan `adminApiClient.js` dijalankan untuk semua endpoint termasuk auth

### 2. **Error Message Tidak Sesuai Backend**

- Backend mengirim: `{ success: false, message: "Nomor telepon atau password salah" }`
- Frontend menampilkan: Generic message atau error dari axios
- **Root Cause**: Error handling di halaman login/register tidak extract message dari `error.response.data.message`

### 3. **Retry Logic Tidak Perlu untuk Auth Endpoints**

- Auth endpoints (login/register) tidak perlu retry karena:
  - Credentials salah = langsung gagal, retry tidak akan berhasil
  - Rate limiting = retry hanya akan memperparah
  - Network error = user harus refresh manual

---

## ✅ Solusi yang Diterapkan

### 1. **Disable Retry Logic untuk Auth Endpoints**

**File**: `frontend/src/services/services_customer/apiClient.js`

```javascript
// NO RETRY for auth endpoints
const isAuthEndpoint =
  config?.url?.includes("/auth/login") ||
  config?.url?.includes("/auth/register");

// Retry ONLY for non-auth endpoints
if (!response && !isAuthEndpoint) {
  // retry logic here
}
```

**File**: `frontend/src/services/services_admin/adminApiClient.js`

```javascript
// Same logic applied
const isAuthEndpoint =
  config?.url?.includes("/auth/login") ||
  config?.url?.includes("/auth/register");
```

### 2. **Standarisasi Error Handling di Login/Register**

**File**: `frontend/src/pages/customer/Login.jsx`

```javascript
// Extract error message dari backend response
let errorMessage = "Login gagal. Silakan coba lagi.";

if (error.response?.data?.message) {
  // Backend mengirim: { success: false, message: '...' }
  errorMessage = error.response.data.message;
} else if (
  error.message &&
  error.message !== "Request failed with status code 401"
) {
  // Fallback ke error.message tapi hindari generic axios message
  errorMessage = error.message;
}

toast.error(errorMessage);
```

**File**: `frontend/src/pages/customer/Register.jsx`

- Same logic applied

**File**: `frontend/src/pages/admin/AdminLogin.jsx`

- Same logic applied

### 3. **Update Auth Service Error Throwing**

**File**: `frontend/src/services/services_customer/authService.js`

```javascript
catch (error) {
  // Throw error dengan format yang konsisten
  throw error.response?.data || { message: error.message || 'Login gagal' };
}
```

**File**: `frontend/src/services/services_admin/adminAuthService.js`

- Same logic applied

---

## 📋 Backend Response Format (Reference)

### ✅ Success Response

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "customer": {
      "id": 1,
      "phone_number": "628123456789",
      "full_name": "John Doe",
      "role": "customer"
    },
    "token": "eyJhbGc..."
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "message": "Nomor telepon atau password salah"
}
```

### ⏱️ Rate Limit Response (429)

```json
{
  "success": false,
  "message": "Too many requests",
  "retryAfter": 900
}
```

---

## 🧪 Testing

### Test Cases

1. **Login dengan credentials salah**

   - ❌ Before: Toast menampilkan "Retry attempt 1/3"
   - ✅ After: Toast menampilkan "Nomor telepon atau password salah"

2. **Register dengan nomor telepon yang sudah terdaftar**

   - ❌ Before: Toast menampilkan generic error
   - ✅ After: Toast menampilkan "Nomor telepon sudah terdaftar"

3. **Network error (backend mati)**

   - ❌ Before: Retry 3x dengan loading yang lama, lalu tampilkan retry count
   - ✅ After: Langsung tampilkan "Tidak dapat terhubung ke server. Silakan coba lagi."

4. **Rate limiting**
   - ✅ Both: Correctly display "Terlalu banyak percobaan login. Silakan coba lagi setelah X menit."

---

## 📝 Notes

### Retry Logic Behavior

| Endpoint Type         | Retry on Network Error? | Max Retries | Reason                                         |
| --------------------- | ----------------------- | ----------- | ---------------------------------------------- |
| Auth (login/register) | ❌ No                   | 0           | Credentials tidak akan berubah dengan retry    |
| Other endpoints       | ✅ Yes                  | 3           | Transient network issues mungkin bisa recovery |

### Error Priority

1. `error.response?.data?.message` - Backend error message (highest priority)
2. `error.message` - Axios/network error message (excluding generic axios messages)
3. Fallback message - "Login gagal. Silakan coba lagi."

---

## 🔍 Files Changed

1. `frontend/src/services/services_customer/apiClient.js` - Disable retry untuk auth endpoints
2. `frontend/src/services/services_admin/adminApiClient.js` - Disable retry untuk auth endpoints
3. `frontend/src/pages/customer/Login.jsx` - Extract error message dari backend
4. `frontend/src/pages/customer/Register.jsx` - Extract error message dari backend
5. `frontend/src/pages/admin/AdminLogin.jsx` - Extract error message dari backend
6. `frontend/src/services/services_customer/authService.js` - Standardize error throwing
7. `frontend/src/services/services_admin/adminAuthService.js` - Standardize error throwing

---

## ✨ Result

- ✅ Toast notification sekarang menampilkan error message dari backend dengan benar
- ✅ Tidak ada lagi "retry count" di toast untuk login/register
- ✅ Error handling konsisten antara customer dan admin
- ✅ Network error handling lebih cepat (tidak retry 3x)
- ✅ User experience lebih baik dengan error message yang jelas

---

**Date**: November 29, 2025
**Developer**: BaleTani Dev Team
