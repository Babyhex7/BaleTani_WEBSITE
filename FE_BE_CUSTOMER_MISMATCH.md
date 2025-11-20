# 🚨 CUSTOMER FE-BE API MISMATCH ANALYSIS

**Tanggal:** 2024-11-20
**Status:** CRITICAL ISSUES FOUND

---

## ❌ MASALAH UTAMA: RATE LIMITER ERROR HANDLING

### **Problem: Retry Count Notification Muncul Saat Login/Register Gagal**

**Root Cause:** Backend mengirim `retryAfter` field di rate limit response, tapi **frontend TIDAK handle error 429 dengan baik**!

---

## 🔍 BACKEND RATE LIMITER (ACTUAL)

**File:** `backend/src/middlewares/rateLimiter.middleware.js`

### **Login Limiter:**

```javascript
// Lines 28-56
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts
  skipSuccessfulRequests: true, // ✅ Don't count sukses
  skipFailedRequests: false, // ❌ Count failed attempts
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.",
      code: "RATE_LIMIT_LOGIN",
      retryAfter: 15 * 60, // ❌ Frontend tidak tau cara display ini!
    });
  },
});
```

### **Register Limiter:**

```javascript
// Lines 72-90
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 registrations
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Terlalu banyak percobaan registrasi. Silakan coba lagi setelah 1 jam.",
      code: "RATE_LIMIT_REGISTER",
      retryAfter: 60 * 60, // ❌ Frontend tidak handle!
    });
  },
});
```

---

## 🎨 FRONTEND ERROR HANDLING (CURRENT)

**File:** `frontend/src/pages/customer/Login.jsx` (Lines 100-155)

### **Current Code - TIDAK HANDLE 429:**

```jsx
const handleSubmit = async (e) => {
  // ... validation ...

  try {
    const response = await authService.login(loginData);
    login(response.customer, response.token);
    toast.success(response.message || "Login berhasil!");
    navigate("/home");
  } catch (error) {
    console.error("Login error:", error);

    // ❌ HANYA SHOW GENERIC ERROR!
    toast.error(error.message || "Login gagal. Silakan coba lagi.");

    // Handle field errors
    if (error.errors) {
      const fieldErrors = {};
      error.errors.forEach((err) => {
        if (err.path) {
          fieldErrors[err.path] = err.msg;
        }
      });
      setErrors(fieldErrors);
    }
    // ❌ TIDAK CEK error.code === "RATE_LIMIT_LOGIN"
    // ❌ TIDAK CEK error.retryAfter
    // ❌ TIDAK DISPLAY retry countdown
  }
};
```

**File:** `frontend/src/pages/customer/Register.jsx` (Lines 117-165)

### **Same Problem - No 429 Handling:**

```jsx
try {
  const response = await authService.register(apiData);
  if (response.success) {
    navigate("/login", {
      state: {
        registered: true,
        phoneNumber: normalizedPhone,
      },
    });
  }
} catch (error) {
  console.error("Registration error:", error);

  // ❌ HANYA SHOW GENERIC ERROR!
  toast.error(error.message || "Registrasi gagal. Silakan coba lagi.");

  // ❌ TIDAK HANDLE rate limit 429
}
```

---

## ✅ SOLUSI: PROPER ERROR HANDLING

### **Fix 1: Update Login.jsx - Handle Rate Limit**

**Add setelah catch block:**

```jsx
} catch (error) {
  console.error('Login error:', error);

  // ✅ CHECK FOR RATE LIMIT ERROR
  if (error.code === 'RATE_LIMIT_LOGIN') {
    const retryMinutes = Math.ceil((error.retryAfter || 900) / 60);
    toast.error(
      `Terlalu banyak percobaan login. Silakan coba lagi setelah ${retryMinutes} menit.`,
      { duration: 6000 }
    );
    return;
  }

  // ✅ GENERIC ERROR
  toast.error(error.message || 'Login gagal. Silakan coba lagi.');

  // Handle field errors
  if (error.errors) {
    const fieldErrors = {};
    error.errors.forEach(err => {
      if (err.path) {
        fieldErrors[err.path] = err.msg;
      }
    });
    setErrors(fieldErrors);
  }
}
```

### **Fix 2: Update Register.jsx - Handle Rate Limit**

```jsx
} catch (error) {
  console.error('Registration error:', error);

  // ✅ CHECK FOR RATE LIMIT ERROR
  if (error.code === 'RATE_LIMIT_REGISTER') {
    const retryMinutes = Math.ceil((error.retryAfter || 3600) / 60);
    toast.error(
      `Terlalu banyak percobaan registrasi. Silakan coba lagi setelah ${retryMinutes} menit.`,
      { duration: 6000 }
    );
    return;
  }

  // ✅ GENERIC ERROR
  toast.error(error.message || 'Registrasi gagal. Silakan coba lagi.');

  // Handle field errors
  if (error.errors) {
    const fieldErrors = {};
    error.errors.forEach(err => {
      if (err.path) {
        fieldErrors[err.path] = err.msg;
      }
    });
    setErrors(fieldErrors);
  }
}
```

---

## 🔍 MASALAH LAIN: RESPONSE STRUCTURE MISMATCH

### **Issue 1: Auth Response - ✅ SUDAH BENAR**

**Backend:** `customerAuth.controller.js` (Lines 100-120)

```javascript
res.status(200).json({
  success: true,
  message: "Login berhasil",
  data: {
    customer: {...},  // ✅ BENAR
    token: "..."      // ✅ BENAR
  }
});
```

**Frontend:** `authService.js` (Lines 18-48)

```javascript
if (
  response.data &&
  response.data.success &&
  response.data.data &&
  response.data.data.customer && // ✅ BENAR
  response.data.data.token // ✅ BENAR
) {
  const { customer, token } = response.data.data;
  return { customer, token, message: response.data.message };
}
```

**Status:** ✅ **SUDAH SESUAI!**

---

### **Issue 2: Cart Response - ✅ SUDAH BENAR**

**Backend:** `customerCart.controller.js`

```javascript
// getCart returns:
{
  success: true,
  data: {
    cart: {...},
    items: [...]
  }
}

// addToCart, updateCart returns:
{
  success: true,
  message: "...",
  data: { item: {...} }
}
```

**Frontend:** `cartService.js`

```javascript
getCart: async () => {
  const response = await api.get("/customer/cart");
  return response.data;  // ✅ Direct return, sudah correct
},

addToCart: async (productId, quantity) => {
  const response = await api.post("/customer/cart", {...});
  return response.data;  // ✅ Direct return
},
```

**Status:** ✅ **SUDAH SESUAI!**

---

### **Issue 3: Order Response - NEED TO CHECK**

**Backend:** `customerOrder.controller.js` (Lines 546-555)

```javascript
return res.status(201).json({
  success: true,
  message: "Order berhasil dibuat",
  data: {
    order_id: "...",
    order_number: "...",
    items: [...],
    payment: {...},
    whatsapp: {...}
  }
});
```

**Need to verify:** Frontend `customerOrderService.js` expects correct structure?

---

## 📊 SUMMARY ISSUES

| Issue                          | Component         | Impact     | Status     |
| ------------------------------ | ----------------- | ---------- | ---------- |
| **Rate limit 429 not handled** | Login.jsx         | ❌ HIGH    | NEED FIX   |
| **Rate limit 429 not handled** | Register.jsx      | ❌ HIGH    | NEED FIX   |
| **No retry countdown display** | Both pages        | ⚠️ MEDIUM  | NEED FIX   |
| Auth response structure        | authService.js    | ✅ OK      | VERIFIED   |
| Cart response structure        | cartService.js    | ✅ OK      | VERIFIED   |
| Order response structure       | orderService.js   | ⏳ PENDING | NEED CHECK |
| Profile response structure     | profileService.js | ⏳ PENDING | NEED CHECK |

---

## 🎯 USER EXPERIENCE PROBLEM

**Current UX (BAD):**

```
User login 6x dengan password salah
  ↓
Backend: 429 "Terlalu banyak percobaan login"
  ↓
Frontend: Toast generic "Login gagal. Silakan coba lagi."
  ↓
User: ??? "Kenapa masih gagal? Retry count?"
```

**Expected UX (GOOD):**

```
User login 6x dengan password salah
  ↓
Backend: 429 + retryAfter: 900 seconds
  ↓
Frontend: Parse retryAfter → 15 menit
  ↓
Toast: "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit."
  ↓
User: ✅ "Oh, saya tunggu 15 menit dulu"
```

---

## 🔧 FILES YANG PERLU DIUBAH

### **Priority 1 (CRITICAL):**

1. ✅ `frontend/src/pages/customer/Login.jsx`

   - Add rate limit error handling
   - Display retry countdown

2. ✅ `frontend/src/pages/customer/Register.jsx`
   - Add rate limit error handling
   - Display retry countdown

### **Priority 2 (SHOULD CHECK):**

3. ⏳ `frontend/src/services/services_customer/customerOrderService.js`

   - Verify response structure match

4. ⏳ `frontend/src/services/services_customer/profileService.js`
   - Verify response structure match

---

## 🚀 NEXT STEPS

1. ✅ Apply fixes ke Login.jsx dan Register.jsx
2. ⏳ Verify order service response structure
3. ⏳ Verify profile service response structure
4. ⏳ Test rate limit scenarios:
   - Try login 6x dengan password salah
   - Verify toast shows correct retry time
   - Verify cannot login before retry time

---

**Status:** Ready to apply fixes
**Impact:** High (affects user experience)
**Estimated Time:** 15 minutes
