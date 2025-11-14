# 🛡️ Security Implementation Guide

## BaleTani - Comprehensive Security Measures

**Implemented:** November 14, 2025  
**Status:** ✅ Production Ready

---

## 📋 **Table of Contents**

1. [Rate Limiting](#rate-limiting)
2. [Input Sanitization](#input-sanitization)
3. [XSS Protection](#xss-protection)
4. [SQL Injection Prevention](#sql-injection-prevention)
5. [Authentication Security](#authentication-security)
6. [Best Practices](#best-practices)

---

## 🚦 **Rate Limiting**

### **Implementation Files**
- `backend/src/middlewares/rateLimiter.middleware.js`
- Applied in: `customerAuth.routes.js`, `adminAuth.routes.js`

### **Rate Limiters**

#### 1️⃣ **Login Rate Limiter** (CRITICAL)
```javascript
// Max 5 login attempts per 15 minutes per IP
loginLimiter
```

**Applied to:**
- `/api/customer/auth/login`
- `/api/admin/auth/login`

**Protection:**
- ✅ Prevent brute force attacks
- ✅ Block automated login attempts
- ✅ Track by IP + phone number/username

**Response when exceeded:**
```json
{
  "success": false,
  "message": "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.",
  "code": "RATE_LIMIT_LOGIN",
  "retryAfter": 900
}
```

#### 2️⃣ **Register Rate Limiter**
```javascript
// Max 3 registrations per hour per IP
registerLimiter
```

**Applied to:**
- `/api/customer/auth/register`

**Protection:**
- ✅ Prevent spam registrations
- ✅ Block automated bot registrations

#### 3️⃣ **General API Rate Limiter**
```javascript
// Max 100 requests per 15 minutes per IP
apiLimiter
```

**Applied to:**
- All API endpoints (global)

**Protection:**
- ✅ Prevent API abuse
- ✅ DDoS mitigation

#### 4️⃣ **Sensitive Operations Limiter**
```javascript
// Max 3 attempts per hour per IP
sensitiveLimiter
```

**For future use:**
- Password change
- Account deletion
- Payment operations

#### 5️⃣ **Upload Limiter**
```javascript
// Max 10 uploads per hour per IP
uploadLimiter
```

**For future use:**
- Product image uploads
- Profile picture uploads

---

## 🧹 **Input Sanitization**

### **Implementation Files**
- `backend/src/middlewares/sanitize.middleware.js`

### **Sanitization Functions**

#### **1. sanitizeString(str)**
```javascript
// Remove/escape dangerous HTML tags and characters
const clean = sanitizeString('<script>alert("XSS")</script>Hello');
// Result: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;Hello"
```

**Protections:**
- ✅ Remove `<script>` tags
- ✅ Escape HTML entities: `<`, `>`, `&`, `"`, `'`, `/`
- ✅ Trim whitespace

#### **2. sanitizeObject(obj)**
```javascript
// Recursively sanitize all string values in object
const input = {
  name: '<script>alert("XSS")</script>',
  address: 'Jl. Test <b>Bold</b>'
};
const clean = sanitizeObject(input);
```

#### **3. sanitizeSQLInput(str)**
```javascript
// Extra protection against SQL injection
// Note: Sequelize already protects, this is extra layer
const clean = sanitizeSQLInput("' OR 1=1 --");
```

**Protections:**
- ✅ Remove SQL comments (`--`, `/* */`)
- ✅ Block common injection patterns:
  - `OR 1=1`
  - `UNION SELECT`
  - `DROP TABLE`
  - `EXEC()`

### **Middleware Usage**

#### **Global Sanitization** (app.js)
```javascript
// Sanitize query params for all routes
app.use(sanitizeQuery);
```

#### **Per-Route Sanitization**
```javascript
// Sanitize body + query + params
router.post('/login', sanitizeInput, loginController);

// Sanitize only body
router.post('/register', sanitizeBody, registerController);

// Sanitize only query
router.get('/products', sanitizeQuery, productController);
```

---

## 🔒 **XSS Protection**

### **Multiple Layers of Defense**

#### **1. Input Sanitization**
- All user input is sanitized before processing
- HTML tags are escaped or removed
- Script tags are completely removed

#### **2. Helmet Security Headers**
```javascript
// app.js
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Can be configured for production
}));
```

**Headers added by Helmet:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`

#### **3. Output Encoding** (Frontend)
- React automatically escapes output by default
- Use `dangerouslySetInnerHTML` only when necessary

#### **4. Content Security Policy** (Future)
```javascript
// Production CSP example
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  }
}
```

---

## 🛡️ **SQL Injection Prevention**

### **Sequelize ORM Protection**

#### ✅ **Always Use Parameterized Queries**
```javascript
// ✅ SAFE - Sequelize parameterized query
const user = await User.findOne({
  where: { phone_number: req.body.phone_number }
});

// ❌ UNSAFE - Raw query without bindings
const user = await sequelize.query(
  `SELECT * FROM users WHERE phone = '${req.body.phone}'`
);

// ✅ SAFE - Raw query with bindings
const user = await sequelize.query(
  'SELECT * FROM users WHERE phone = ?',
  { replacements: [req.body.phone] }
);
```

#### ✅ **Input Validation**
```javascript
// Always validate input types and formats
const { body } = require('express-validator');

const validateLogin = [
  body('phone_number')
    .notEmpty()
    .isLength({ min: 10, max: 15 })
    .withMessage('Invalid phone number'),
];
```

#### ✅ **Sanitization Layer**
```javascript
// Extra layer of SQL injection protection
const { sanitizeSQLInput } = require('./middlewares/sanitize.middleware');
const phone = sanitizeSQLInput(req.body.phone_number);
```

---

## 🔐 **Authentication Security**

### **JWT Token Security**

#### **1. Token Storage**
```javascript
// Frontend - localStorage (HttpOnly cookies better for production)
localStorage.setItem('token', jwtToken);
```

#### **2. Token Expiration**
```javascript
// Backend - 24 hour expiration
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
  expiresIn: '24h'
});
```

#### **3. Token Validation**
```javascript
// Middleware checks token on every request
const authenticateCustomer = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### **Password Security**

#### **1. Hashing with bcrypt**
```javascript
// Registration - hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Login - compare hashed password
const isMatch = await bcrypt.compare(password, user.password);
```

#### **2. Password Requirements**
```javascript
// Minimum 6 characters (can be increased)
body('password')
  .isLength({ min: 6 })
  .withMessage('Password minimal 6 karakter')
```

---

## ✅ **Best Practices**

### **DO's**

✅ **Always sanitize user input**
```javascript
router.post('/create', sanitizeInput, createController);
```

✅ **Use rate limiters for sensitive endpoints**
```javascript
router.post('/login', loginLimiter, sanitizeInput, loginController);
```

✅ **Validate input with express-validator**
```javascript
const validate = [
  body('email').isEmail(),
  body('phone').isMobilePhone('id-ID'),
];
```

✅ **Use HTTPS in production**
```javascript
// .env
NODE_ENV=production
FRONTEND_URL=https://baletani.com
```

✅ **Keep dependencies updated**
```bash
npm audit
npm update
```

✅ **Use environment variables for secrets**
```javascript
// Never commit .env file
JWT_SECRET=your-super-secret-key-here
DB_PASSWORD=database-password
```

### **DON'Ts**

❌ **Never trust user input**
```javascript
// Bad
const name = req.body.name; // Use directly

// Good
const name = sanitizeString(req.body.name);
```

❌ **Never use raw SQL without bindings**
```javascript
// Bad
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Good
const user = await User.findByPk(userId);
```

❌ **Never log sensitive data**
```javascript
// Bad
console.log('Password:', req.body.password);

// Good
console.log('Login attempt for user:', req.body.username);
```

❌ **Never expose error details in production**
```javascript
// Bad
res.status(500).json({ error: error.stack });

// Good
res.status(500).json({ message: 'Internal server error' });
```

---

## 🧪 **Testing Security**

### **Manual Testing**

#### **1. Test Rate Limiting**
```bash
# Test login rate limit (should block after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/customer/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone_number":"08123456789","password":"wrong"}'
done
```

#### **2. Test XSS Protection**
```bash
# Try to inject script (should be sanitized)
curl -X POST http://localhost:5000/api/customer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "<script>alert(\"XSS\")</script>",
    "phone_number": "08123456789",
    "password": "test123"
  }'
```

#### **3. Test SQL Injection**
```bash
# Try SQL injection (should be blocked)
curl -X POST http://localhost:5000/api/customer/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "08123456789\" OR \"1\"=\"1",
    "password": "anything"
  }'
```

---

## 📊 **Security Checklist**

- [x] Rate limiting on login endpoints
- [x] Rate limiting on register endpoints
- [x] Global API rate limiting
- [x] Input sanitization middleware
- [x] XSS protection
- [x] SQL injection prevention (Sequelize ORM)
- [x] Password hashing (bcrypt)
- [x] JWT token authentication
- [x] Helmet security headers
- [x] CORS configuration
- [ ] CSRF protection (recommended for production)
- [ ] Content Security Policy (recommended for production)
- [ ] HttpOnly cookies (recommended over localStorage)
- [ ] Redis for rate limiting (for horizontal scaling)

---

## 🚀 **Deployment Security**

### **Environment Variables**
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=generate-strong-random-secret-here
DB_PASSWORD=strong-database-password
FRONTEND_URL=https://yourdomain.com

# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **HTTPS Setup**
- Use Let's Encrypt for free SSL certificates
- Force HTTPS redirect
- Enable HSTS header

### **Server Hardening**
- Keep Node.js updated
- Use PM2 or similar process manager
- Enable firewall (UFW, iptables)
- Disable unnecessary services
- Regular security audits

---

## 📚 **Additional Resources**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**Last Updated:** November 14, 2025  
**Maintained by:** BaleTani Development Team
