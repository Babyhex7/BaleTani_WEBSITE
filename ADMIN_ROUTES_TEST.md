### TESTING ADMIN CONTACT & FAQ ROUTES

#### Cara Test:

1. Login sebagai admin di `/admin/login`
2. Setelah login, buka console browser (F12)
3. Klik menu "FAQ Management" atau "Contact Messages" di sidebar
4. Perhatikan console log:
   - Harus melihat "🔑 Using ADMIN token for: /api/admin/faqs" atau "/api/admin/contacts"
   - Harus melihat "[ProtectedRoute] ===== ROUTE PROTECTION CHECK ====="
   - Harus melihat "Is Admin Path: true"
   - Harus melihat "isAuthenticated: true"
   - Harus melihat admin name di "Admin Store"

#### Jika Redirect ke Customer Login:

1. Buka console dan cek:

   ```javascript
   // Check admin storage
   const adminStorage = localStorage.getItem("baletani-admin-storage");
   console.log("Admin Storage:", JSON.parse(adminStorage));

   // Check token
   const parsed = JSON.parse(adminStorage);
   console.log("Admin Token:", parsed?.state?.token);
   console.log("Is Authenticated:", parsed?.state?.isAuthenticated);
   console.log("Admin Data:", parsed?.state?.admin);
   ```

2. Jika token tidak ada atau isAuthenticated = false:
   - Logout dan login ulang
   - Clear localStorage: `localStorage.clear()`
   - Refresh page dan login ulang

#### Expected Behavior:

✅ Login admin → Store token di localStorage (baletani-admin-storage)
✅ Akses /admin/faqs → Check admin auth → Show FAQ page
✅ Akses /admin/contacts → Check admin auth → Show Contact page
❌ NO redirect ke customer login (/login)
✅ If not logged in → Redirect to /admin/login

#### API Endpoints:

- GET `/api/admin/faqs` - Requires admin token
- GET `/api/admin/contacts` - Requires admin token
- Both require: `Authorization: Bearer <admin_token>`

#### Debug Console Commands:

```javascript
// Check current auth state
const adminStore = JSON.parse(localStorage.getItem("baletani-admin-storage"));
console.log("Admin Auth:", {
  isAuthenticated: adminStore?.state?.isAuthenticated,
  hasToken: !!adminStore?.state?.token,
  hasAdmin: !!adminStore?.state?.admin,
  adminName: adminStore?.state?.admin?.name,
  tokenExpiry: new Date(adminStore?.state?.tokenExpiry).toISOString(),
});

// Test API call
fetch("http://localhost:5000/api/admin/faqs", {
  headers: {
    Authorization: `Bearer ${adminStore?.state?.token}`,
  },
})
  .then((r) => r.json())
  .then((d) => console.log("FAQ Response:", d))
  .catch((e) => console.error("Error:", e));
```
