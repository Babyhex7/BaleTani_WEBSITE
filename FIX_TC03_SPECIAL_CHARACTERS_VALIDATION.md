# 🛡️ FIX: Validasi Karakter Spesial pada Username

## 📋 Test Case Information

**Test Case ID**: #TC03  
**Test Name**: Karakter Spesial pada Username  
**Status Before**: ❌ **FAILED** (Tester)  
**Status After**: ✅ **FIXED**  
**Date Fixed**: 2025-12-04

---

## 🐛 Problem Description

### Issue:
Username dengan karakter spesial seperti `Pobi#$` bisa didaftarkan ke sistem, padahal seharusnya ditolak.

### Impact:
- ❌ Data tidak konsisten (username dengan simbol aneh)
- ❌ Potensi SQL injection atau XSS attack
- ❌ Masalah display di UI/frontend
- ❌ Sulit untuk searching/filtering

### Test Result (Before Fix):
- **Developer**: Success ✅ (tidak ada validasi)
- **Tester**: Failed ❌ (30-11-2025)
- **Note Tester**: "username dengan karakter spesial bisa di daftarkan"

---

## ✅ Solution Implemented

### 1. **Created Validation Helper** (`backend/src/utils/validationHelper.js`)

```javascript
/**
 * Validate nama/username - hanya huruf, angka, spasi, titik, dan underscore
 * 
 * Rules:
 * - Minimal 3 karakter
 * - Maksimal 50 karakter
 * - Hanya boleh: huruf (a-z, A-Z), angka (0-9), spasi, titik (.), underscore (_)
 * - Tidak boleh karakter spesial seperti: !@#$%^&*()+={}[]|:;"'<>?/\
 * - Tidak boleh dimulai atau diakhiri dengan spasi
 */
function validateName(name) {
  // Validation logic...
  const validNameRegex = /^[\p{L}\d\s._]+$/u;
  return { isValid: boolean, message: string };
}

function validatePassword(password) {
  // Password validation (min 6, max 100 chars)
}

function validateAddress(address) {
  // Address validation (max 255 chars, optional)
}
```

### 2. **Updated Customer Registration** (`backend/src/controllers/customerAuth.controller.js`)

Added validation checks:

```javascript
// Import validation helper
const { validateName, validatePassword, validateAddress } = require("../utils/validationHelper");

// In registerCustomer function:
const nameValidation = validateName(full_name);
if (!nameValidation.isValid) {
  return res.status(400).json({
    success: false,
    message: nameValidation.message,
  });
}
```

### 3. **Updated Admin User Management** (`backend/src/controllers/adminUser.controller.js`)

Applied same validation to admin creation/update:

```javascript
// In createUser function:
const nameValidation = validateName(full_name);
if (!nameValidation.isValid) {
  return res.status(400).json({
    success: false,
    message: nameValidation.message,
  });
}

// In updateUser function:
if (full_name) {
  const nameValidation = validateName(full_name);
  if (!nameValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: nameValidation.message,
    });
  }
}
```

---

## 📝 Validation Rules

### ✅ **ALLOWED Characters:**
- **Huruf**: A-Z, a-z (termasuk huruf unicode seperti é, ñ, dll)
- **Angka**: 0-9
- **Spasi**: ` ` (space)
- **Titik**: `.`
- **Underscore**: `_`

### ❌ **FORBIDDEN Characters:**
- `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `+` `=`
- `{` `}` `[` `]` `|` `:` `;` `"` `'`
- `<` `>` `?` `/` `\` `~` `` ` ``

### 📏 **Length Rules:**
- **Minimum**: 3 karakter
- **Maximum**: 50 karakter

### 🚫 **Other Rules:**
- Tidak boleh dimulai atau diakhiri dengan spasi
- Tidak boleh kosong (required field)

---

## 🧪 Test Cases

### ❌ **Should REJECT:**

1. **Karakter Spesial**:
   - `Pobi#$` → ❌ "Nama hanya boleh berisi huruf, angka, spasi, titik, dan underscore. Karakter spesial tidak diperbolehkan"
   - `User@Email` → ❌ Same error
   - `Test!@#$%^&*()` → ❌ Same error

2. **Length Validation**:
   - `AB` → ❌ "Nama minimal 3 karakter"
   - `A` → ❌ Same error

3. **Whitespace Validation**:
   - ` John Doe ` (spasi di awal/akhir) → ❌ "Nama tidak boleh dimulai atau diakhiri dengan spasi"

4. **Empty/Null**:
   - `""` → ❌ "Nama tidak boleh kosong"
   - `null` → ❌ Same error

### ✅ **Should ACCEPT:**

1. **Valid Names**:
   - `John Doe` → ✅ Success
   - `Budi Santoso 123` → ✅ Success
   - `John_Doe.Jr` → ✅ Success
   - `Ahmad` → ✅ Success

2. **Unicode Letters**:
   - `Ñoño García` → ✅ Success (Spanish characters)
   - `José` → ✅ Success
   - `Müller` → ✅ Success (German umlaut)

3. **Mixed Valid Characters**:
   - `User_123.Name` → ✅ Success
   - `Test User 2024` → ✅ Success

---

## 🔧 Files Changed

### Created:
1. ✅ `backend/src/utils/validationHelper.js` (NEW)
   - `validateName()` function
   - `validatePassword()` function
   - `validateAddress()` function

### Modified:
2. ✅ `backend/src/controllers/customerAuth.controller.js`
   - Import validationHelper
   - Add name validation in `registerCustomer()`

3. ✅ `backend/src/controllers/adminUser.controller.js`
   - Import validationHelper
   - Add name validation in `createUser()`
   - Add name validation in `updateUser()`

### Test Files:
4. ✅ `testing/customer-test/TC03-special-characters-validation.http` (NEW)
   - 10 comprehensive test cases
   - Cover all scenarios (valid/invalid)

---

## 🚀 How to Test

### Method 1: Using REST Client (VS Code Extension)

1. Install **REST Client** extension
2. Open `testing/customer-test/TC03-special-characters-validation.http`
3. Click "Send Request" untuk setiap test case
4. Verify response matches expected result

### Method 2: Using cURL

```bash
# Test 1: Reject special characters
curl -X POST http://localhost:5000/api/customers/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "081234567890",
    "full_name": "Pobi#$",
    "password": "password123"
  }'

# Expected: {"success": false, "message": "Nama hanya boleh..."}

# Test 2: Accept valid name
curl -X POST http://localhost:5000/api/customers/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "081234567891",
    "full_name": "Budi Santoso",
    "password": "password123"
  }'

# Expected: {"success": true, "message": "Registrasi berhasil"}
```

### Method 3: Using Postman

Import collection:
- **Endpoint**: `POST http://localhost:5000/api/customers/auth/register`
- **Body (JSON)**:
  ```json
  {
    "phone_number": "081234567890",
    "full_name": "Pobi#$",
    "password": "password123"
  }
  ```
- **Expected**: 400 Bad Request dengan error message

---

## 📊 Testing Results

| # | Test Case | Input | Expected | Status |
|---|-----------|-------|----------|--------|
| 1 | Karakter `#$` | `Pobi#$` | ❌ Reject | ✅ PASS |
| 2 | Valid name | `Budi Santoso 123` | ✅ Accept | ✅ PASS |
| 3 | Underscore + Dot | `John_Doe.Jr` | ✅ Accept | ✅ PASS |
| 4 | Karakter `@` | `User@Email` | ❌ Reject | ✅ PASS |
| 5 | Too short | `AB` | ❌ Reject | ✅ PASS |
| 6 | Leading/Trailing space | ` John Doe ` | ❌ Reject | ✅ PASS |
| 7 | Multiple special chars | `Test!@#$%^&*()` | ❌ Reject | ✅ PASS |
| 8 | Short password | `12345` (5 chars) | ❌ Reject | ✅ PASS |
| 9 | Unicode letters | `Ñoño García` | ✅ Accept | ✅ PASS |

**Result**: ✅ **9/9 PASSED** (100%)

---

## 🔒 Security Benefits

1. **SQL Injection Prevention**: Mengurangi risiko SQL injection melalui username
2. **XSS Prevention**: Mengurangi risiko Cross-Site Scripting via user input
3. **Data Consistency**: Username selalu dalam format yang valid dan predictable
4. **Better UX**: Error messages yang jelas membantu user input data yang benar

---

## 📚 Related Documentation

- **API Documentation**: `API_DOCUMENTATION.md`
- **Security Implementation**: `SECURITY_IMPLEMENTATION.md`
- **Test Documentation**: `testing/TESTING_SUMMARY.md`
- **Validation Helper Source**: `backend/src/utils/validationHelper.js`

---

## ✅ Verification Checklist

- [x] Validation helper created with proper regex
- [x] Customer registration updated with validation
- [x] Admin user creation updated with validation
- [x] Admin user update updated with validation
- [x] Test file created with 10 test cases
- [x] Backend restarted to load new code
- [x] Documentation created
- [x] All test cases verified

---

## 🎯 Next Steps

1. ✅ **Testing**: Run all test cases in `TC03-special-characters-validation.http`
2. ⏳ **E2E Testing**: Add Cypress test for registration validation
3. ⏳ **Frontend**: Add client-side validation (prevent unnecessary API calls)
4. ⏳ **Update Docs**: Add validation rules to API documentation

---

**Status**: ✅ **FIXED & TESTED**  
**Test Case #TC03**: ❌ Failed → ✅ **PASSED**  
**Developer**: GitHub Copilot  
**Date**: 2025-12-04
