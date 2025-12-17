# 🚀 HOSTING & DEPLOYMENT GUIDE - BaleTani Fresh Market

> **Dokumentasi lengkap untuk hosting dan deployment project BaleTani**
>
> **Dibuat**: 17 Desember 2025
>
> **Status**: Production Ready dengan beberapa persiapan

---

## 📊 ANALISIS ARSITEKTUR PROJECT

### **Tech Stack yang Digunakan:**

1. **Backend API** (Node.js/Express)

   - Runtime: Node.js 18+
   - Framework: Express.js 4.18.2
   - Database: MySQL 8.0
   - ORM: Sequelize 6.33.0
   - Cache: node-cache (In-Memory)
   - Upload: Multer untuk file handling
   - Authentication: JWT dengan bcryptjs
   - Security: Helmet, CORS, Rate Limiting, CSRF Protection

2. **Frontend** (React + Vite)

   - Framework: React 18.2.0
   - Build Tool: Vite 4.4.5
   - UI: Tailwind CSS 3.3.3
   - State Management: Zustand 4.4.1
   - Routing: React Router DOM 6.15.0
   - Notifications: React Hot Toast

3. **ML Recommendation Service** (Python/FastAPI)

   - Framework: FastAPI 0.108.0
   - Server: Uvicorn 0.25.0
   - ML: TensorFlow 2.15.0
   - Python: 3.11.5
   - Data Processing: Pandas, NumPy, Scikit-learn

4. **File Storage**
   - Struktur: `backend/public/uploads/products/`
   - Format: Images (JPG, PNG)

---

## 🎯 REKOMENDASI HOSTING

### **🥇 OPSI 1: VPS (Virtual Private Server) - RECOMMENDED**

**Provider yang Cocok:**

- DigitalOcean (Droplet)
- Linode (Akamai)
- Vultr
- AWS Lightsail
- Hetzner Cloud

**Spesifikasi Minimum:**

```
CPU: 2 vCPU
RAM: 4 GB (minimal) - 8 GB (recommended)
Storage: 80 GB SSD
Bandwidth: 4 TB
OS: Ubuntu 22.04 LTS
```

**Estimasi Biaya:**

- DigitalOcean: $24/bulan (4GB RAM, 2 vCPU)
- Vultr: $24/bulan
- Hetzner: €8.19/bulan (~$9/bulan) - PALING MURAH

**Keuntungan VPS:**
✅ Full control server
✅ Bisa install semua service (Node.js, Python, MySQL, Nginx)
✅ Cocok untuk aplikasi dengan ML service
✅ Scalable sesuai kebutuhan
✅ Cost-effective untuk jangka panjang
✅ Bisa setup CI/CD

**Kekurangan:**
❌ Perlu knowledge DevOps
❌ Maintenance sendiri
❌ Setup lebih kompleks

---

### **🥈 OPSI 2: Platform as a Service (PaaS)**

**A. Vercel + Railway/Render**

**Setup:**

- **Frontend**: Vercel (Free/Pro)
- **Backend API**: Railway ($5-20/bulan) atau Render (Free tier available)
- **MySQL Database**: PlanetScale (Free/Pro) atau Railway
- **ML Service**: Railway Python Service

**Estimasi Biaya:**

```
Vercel Free: $0
Railway: $10-20/bulan
PlanetScale Free: $0 (5GB storage)
Total: $10-20/bulan
```

**Keuntungan:**
✅ Setup cepat dan mudah
✅ Auto-deploy dari Git
✅ Free SSL certificate
✅ CDN included (Vercel)
✅ Cocok untuk startup/MVP

**Kekurangan:**
❌ Storage terbatas untuk uploads
❌ Cold start di tier gratis
❌ Kurang kontrol infrastructure

---

**B. Heroku (Jika Budget Lebih)**

**Setup:**

- Basic Dyno: $7/dyno (backend, frontend, ML)
- Postgres/MySQL: $9/bulan
- Total: ~$30/bulan

---

### **🥉 OPSI 3: Serverless + Managed Services**

**Setup:**

- **Frontend**: Netlify/Vercel
- **Backend**: AWS Lambda + API Gateway
- **Database**: AWS RDS MySQL atau Aurora Serverless
- **ML Service**: AWS Lambda dengan Docker Container
- **Storage**: AWS S3 untuk uploads

**Estimasi Biaya:**

```
AWS Lambda: $5-15/bulan (tergantung traffic)
RDS MySQL: $15-30/bulan
S3: $1-5/bulan
Total: $25-50/bulan
```

**Keuntungan:**
✅ Auto-scaling
✅ Pay per use
✅ High availability

**Kekurangan:**
❌ Complex setup
❌ Bisa mahal jika traffic tinggi
❌ Cold start issues

---

## ⭐ REKOMENDASI FINAL

### **Untuk Project BaleTani, saya rekomendasikan:**

**🎖️ PILIHAN TERBAIK: VPS (DigitalOcean atau Hetzner)**

**Alasan:**

1. ✅ Project memiliki **ML Service** yang butuh resource stabil
2. ✅ Ada **file uploads** yang perlu storage persistent
3. ✅ **Background cron jobs** untuk auto-cancel orders
4. ✅ **In-memory caching** (node-cache) butuh server yang selalu running
5. ✅ Bisa install **MySQL** di server yang sama atau terpisah
6. ✅ **Cost-effective** untuk jangka panjang
7. ✅ Full control untuk **optimization** dan **monitoring**

**Setup Architecture:**

```
┌─────────────────────────────────────────────┐
│            Domain: baletani.com             │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │   Nginx Reverse    │ (Port 80/443)
        │      Proxy         │ (SSL/TLS)
        └─────────┬──────────┘
                  │
    ┌─────────────┼─────────────┬───────────────┐
    │             │             │               │
    ▼             ▼             ▼               ▼
┌───────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐
│Frontend│   │Backend  │   │   ML    │   │  MySQL   │
│ (Build)│   │API      │   │ Service │   │ Database │
│Port N/A│   │Port 5000│   │Port 8000│   │Port 3306 │
└────────┘   └─────────┘   └─────────┘   └──────────┘
```

---

## 📝 CHECKLIST PERSIAPAN PRE-DEPLOYMENT

### **1️⃣ KEAMANAN & ENVIRONMENT**

#### **A. Environment Variables**

**File yang perlu disiapkan:**

**Backend `.env.production`:**

```env
# Environment
NODE_ENV=production
PORT=5000

# Database - GANTI DENGAN DATA PRODUCTION
DB_HOST=localhost
DB_PORT=3306
DB_NAME=baletani_production
DB_USER=baletani_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# JWT - GENERATE ULANG SECRET YANG KUAT
JWT_SECRET=<GENERATE_DENGAN: openssl rand -base64 64>
JWT_EXPIRES_IN=7d

# CORS - DOMAIN PRODUCTION
FRONTEND_CUSTOMER_URL=https://baletani.com
FRONTEND_ADMIN_URL=https://admin.baletani.com

# WhatsApp
WHATSAPP_ADMIN_PHONE=6285885725027

# AI Recommendation Service
ML_SERVICE_URL=http://localhost:8000

# Timezone
TZ=Asia/Jakarta
```

**Frontend `.env.production`:**

```env
VITE_API_BASE_URL=https://api.baletani.com
VITE_WHATSAPP_ADMIN_PHONE=6285885725027
```

**ML Service `.env.production`:**

```env
# Application
APP_ENV=production
DEBUG=False

# Database (Read from MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=baletani_production
DB_USER=baletani_user
DB_PASSWORD=<SAME_AS_BACKEND>

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=2

# Cache (Optional - bisa tambahkan Redis)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

---

#### **B. Security Hardening**

**✅ Yang Sudah Ada di Code:**

- ✔️ Helmet.js untuk HTTP headers security
- ✔️ CORS configuration
- ✔️ Rate limiting
- ✔️ CSRF protection
- ✔️ Input sanitization
- ✔️ Password hashing (bcrypt)
- ✔️ JWT authentication

**⚠️ Yang Perlu Ditambahkan/Diperbaiki:**

1. **Ganti JWT_SECRET di production**

   ```bash
   # Generate strong secret
   openssl rand -base64 64
   ```

2. **Database Password Encryption**

   - Jangan hardcode password
   - Gunakan environment variables
   - Pastikan DB user limited privileges

3. **File Upload Validation**

   ```javascript
   // File: backend/src/middlewares/upload.middleware.js
   // ✅ Sudah ada validation, tapi perlu verify:
   // - Max file size: 5MB
   // - Allowed types: jpg, jpeg, png
   // - Sanitize filename
   ```

4. **Add Security Headers**
   ```javascript
   // Tambahkan di backend/src/app.js
   app.use(
     helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           styleSrc: ["'self'", "'unsafe-inline'"],
           scriptSrc: ["'self'"],
           imgSrc: ["'self'", "data:", "https:"],
         },
       },
     })
   );
   ```

---

### **2️⃣ DATABASE PREPARATION**

#### **A. Database Migration Script**

**File: `backend/scripts/production-setup.sql`** (BUAT FILE INI)

```sql
-- ===================================
-- PRODUCTION DATABASE SETUP
-- ===================================

-- 1. Create Production Database
CREATE DATABASE IF NOT EXISTS baletani_production
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Create Database User with Limited Privileges
CREATE USER IF NOT EXISTS 'baletani_user'@'localhost'
IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- 3. Grant Privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER
ON baletani_production.*
TO 'baletani_user'@'localhost';

FLUSH PRIVILEGES;

-- 4. Show Databases
SHOW DATABASES;

-- 5. Show Users
SELECT User, Host FROM mysql.user WHERE User = 'baletani_user';
```

#### **B. Database Backup Strategy**

**File: `backend/scripts/backup-database.sh`** (BUAT FILE INI)

```bash
#!/bin/bash

# ===================================
# DATABASE BACKUP SCRIPT
# ===================================

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/baletani"
DB_NAME="baletani_production"
DB_USER="baletani_user"
DB_PASS="YOUR_PASSWORD"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days backup
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: backup_$DATE.sql.gz"
```

**Setup Cron untuk Auto Backup:**

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backend/scripts/backup-database.sh
```

#### **C. Migration Files yang Perlu Dijalankan**

**Urutan Eksekusi:**

1. Run Sequelize sync untuk create tables
2. Run migration: `add_payment_expiry_fields.sql`
3. Run migration: `remove_service_fee_column.sql`
4. Run seeders untuk data master (categories, roles, permissions)

---

### **3️⃣ FILE UPLOAD & STORAGE**

#### **A. Directory Structure**

**Pastikan directory ada dan permissions benar:**

```bash
backend/
└── public/
    └── uploads/
        └── products/
            └── .gitkeep  # ✅ Sudah ada
```

**Setup Permissions (di VPS):**

```bash
# Set ownership ke user yang run Node.js
sudo chown -R www-data:www-data /var/www/baletani/backend/public/uploads

# Set permissions
sudo chmod -R 755 /var/www/baletani/backend/public/uploads
```

#### **B. Opsi Storage Alternative**

**Jika traffic tinggi, pertimbangkan:**

1. **AWS S3 / DigitalOcean Spaces**

   - Upload langsung ke cloud storage
   - Serve via CDN
   - Backup otomatis

2. **Implementation:**

   ```javascript
   // File: backend/src/utils/s3Upload.js (BUAT BARU)
   const AWS = require("aws-sdk");
   const multer = require("multer");
   const multerS3 = require("multer-s3");

   const s3 = new AWS.S3({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION,
   });

   const upload = multer({
     storage: multerS3({
       s3: s3,
       bucket: "baletani-products",
       acl: "public-read",
       metadata: (req, file, cb) => {
         cb(null, { fieldName: file.fieldname });
       },
       key: (req, file, cb) => {
         const uniqueName = `${Date.now()}-${file.originalname}`;
         cb(null, `products/${uniqueName}`);
       },
     }),
     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
     fileFilter: (req, file, cb) => {
       if (file.mimetype.startsWith("image/")) {
         cb(null, true);
       } else {
         cb(new Error("Only images allowed"));
       }
     },
   });

   module.exports = upload;
   ```

---

### **4️⃣ FRONTEND BUILD & OPTIMIZATION**

#### **A. Build Configuration**

**File: `frontend/vite.config.js`** - UPDATE

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    outDir: "dist",
    sourcemap: false, // Disable untuk production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "lucide-react", "react-hot-toast"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Server configuration untuk development
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

#### **B. Build Commands**

**Update `frontend/package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:prod": "NODE_ENV=production vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "analyze": "vite-bundle-visualizer"
  }
}
```

#### **C. Performance Optimization**

**File: `frontend/src/main.jsx`** - ADD

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/globals.css";

// Lazy load components untuk code splitting
// const AdminRoutes = React.lazy(() => import('./pages/admin/...'))

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Add Image Optimization:**

```javascript
// File: frontend/src/utils/imageUtils.js (UPDATE jika belum ada)
export const optimizeImage = (url, width = 400) => {
  // Jika pakai CDN/Cloudinary, bisa add transformation
  return url; // atau tambahkan query params untuk resize
};

export const lazyLoadConfig = {
  root: null,
  rootMargin: "50px",
  threshold: 0.01,
};
```

---

### **5️⃣ ML SERVICE PREPARATION**

#### **A. Model Artifacts**

**Pastikan model sudah trained dan file artifacts ada:**

```
ml-recommendation-service/
└── models_artifacts/
    ├── ncb_model_weights.h5
    ├── product_vectors.npy
    ├── category_encoder.pkl
    ├── name_vectorizer.pkl
    └── scaler.pkl
```

**⚠️ CRITICAL: Jangan commit model files ke Git!**

**File: `.gitignore`** - Verify

```gitignore
# ML Models (large files)
models_artifacts/*.h5
models_artifacts/*.npy
models_artifacts/*.pkl
```

**Cara Deploy Model:**

1. Upload manual via SCP/SFTP ke server
2. Atau gunakan Git LFS untuk large files
3. Atau download dari cloud storage saat deployment

#### **B. Production Configuration**

**File: `ml-recommendation-service/config/settings.py`** - UPDATE

```python
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    app_name: str = "BaleTani ML Recommendation API"
    app_version: str = "1.0.0"
    debug: bool = False  # MUST be False in production

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    workers: int = 2  # CPU cores - 1

    # Database
    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "baletani_production"
    db_user: str = "baletani_user"
    db_password: str = ""

    # Model Paths
    model_dir: str = "models_artifacts"

    # CORS
    allowed_origins: list = [
        "https://baletani.com",
        "https://admin.baletani.com",
        "https://api.baletani.com"
    ]

    # Cache (Optional - untuk Redis)
    redis_host: Optional[str] = None
    redis_port: int = 6379
    redis_ttl: int = 3600  # 1 hour

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

#### **C. System Dependencies**

**File: `ml-recommendation-service/requirements-production.txt`** (BUAT BARU)

```txt
# Production dependencies (tanpa dev tools)
fastapi==0.108.0
uvicorn[standard]==0.25.0
pydantic==2.5.0
pydantic-settings==2.1.0

# ML Core
tensorflow==2.15.0
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.4
scipy==1.11.4

# NLP
nltk==3.8.1

# Database
sqlalchemy==2.0.23
pymysql==1.1.0

# Cache (Optional)
# redis==5.0.1

# Utils
python-dotenv==1.0.0
python-multipart==0.0.6

# Production Server
gunicorn==21.2.0
```

---

### **6️⃣ NGINX CONFIGURATION**

#### **File: `/etc/nginx/sites-available/baletani`** (BUAT DI VPS)

```nginx
# ========================================
# NGINX CONFIGURATION - BALETANI
# ========================================

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name baletani.com www.baletani.com api.baletani.com admin.baletani.com;

    return 301 https://$server_name$request_uri;
}

# ========================================
# MAIN CUSTOMER WEBSITE
# ========================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name baletani.com www.baletani.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/baletani.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baletani.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Root directory untuk frontend build
    root /var/www/baletani/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # SPA Routing - semua request ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Access & Error Logs
    access_log /var/log/nginx/baletani-customer-access.log;
    error_log /var/log/nginx/baletani-customer-error.log;
}

# ========================================
# ADMIN DASHBOARD
# ========================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.baletani.com;

    ssl_certificate /etc/letsencrypt/live/baletani.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baletani.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/baletani/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/baletani-admin-access.log;
    error_log /var/log/nginx/baletani-admin-error.log;
}

# ========================================
# BACKEND API
# ========================================
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.baletani.com;

    ssl_certificate /etc/letsencrypt/live/baletani.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baletani.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Client body size untuk file uploads
    client_max_body_size 10M;

    # Proxy ke Node.js Backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /var/www/baletani/backend/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/baletani-api-access.log;
    error_log /var/log/nginx/baletani-api-error.log;
}

# ========================================
# ML RECOMMENDATION SERVICE (Internal)
# ========================================
# Optional: Expose ML service via subdomain
# atau keep internal dan hanya backend yang akses
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ml.baletani.com;

    ssl_certificate /etc/letsencrypt/live/baletani.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baletani.com/privkey.pem;

    # Restrict access - hanya dari backend server
    allow 127.0.0.1;
    allow YOUR_BACKEND_SERVER_IP;
    deny all;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts untuk ML inference
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    access_log /var/log/nginx/baletani-ml-access.log;
    error_log /var/log/nginx/baletani-ml-error.log;
}
```

#### **Enable Site & Reload Nginx:**

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/baletani /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

### **7️⃣ SSL/TLS CERTIFICATE**

#### **Setup Let's Encrypt (Free SSL):**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate untuk semua subdomain
sudo certbot --nginx -d baletani.com -d www.baletani.com -d admin.baletani.com -d api.baletani.com -d ml.baletani.com

# Auto-renewal setup
sudo certbot renew --dry-run

# Cron job untuk auto-renewal (already setup by certbot)
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

### **8️⃣ PROCESS MANAGER - PM2**

#### **A. Install PM2 Globally:**

```bash
npm install -g pm2
```

#### **B. PM2 Configuration**

**File: `ecosystem.config.js`** (BUAT DI ROOT PROJECT)

```javascript
module.exports = {
  apps: [
    // ========================================
    // BACKEND API
    // ========================================
    {
      name: "baletani-backend",
      cwd: "./backend",
      script: "src/server.js",
      instances: 2, // Atau 'max' untuk semua CPU cores
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
      // Auto restart jika crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      // Cron restart setiap hari jam 3 pagi (optional)
      cron_restart: "0 3 * * *",
      // Watch files (disable di production)
      watch: false,
      ignore_watch: ["node_modules", "logs", "public/uploads"],
    },

    // ========================================
    // ML RECOMMENDATION SERVICE
    // ========================================
    {
      name: "baletani-ml-service",
      cwd: "./ml-recommendation-service",
      script: "python3",
      args: "-m uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 2",
      interpreter: "none", // Karena pakai python command
      env_production: {
        APP_ENV: "production",
        DEBUG: "False",
      },
      error_file: "./logs/ml-error.log",
      out_file: "./logs/ml-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "2G",
      autorestart: true,
      max_restarts: 5,
      min_uptime: "30s",
    },
  ],
};
```

#### **C. PM2 Commands:**

```bash
# Start all services
pm2 start ecosystem.config.js --env production

# Status
pm2 status

# Logs
pm2 logs baletani-backend
pm2 logs baletani-ml-service

# Monitoring
pm2 monit

# Restart
pm2 restart all

# Stop
pm2 stop all

# Delete
pm2 delete all

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (auto-start on boot)
pm2 startup systemd
# (jalankan command yang muncul)
```

---

### **9️⃣ MONITORING & LOGGING**

#### **A. PM2 Plus (Optional - Paid)**

- Real-time monitoring
- Error tracking
- Performance metrics
- Free plan: 1 server

#### **B. Setup Log Rotation**

**File: `/etc/logrotate.d/baletani`** (BUAT DI VPS)

```bash
/var/www/baletani/backend/logs/*.log
/var/www/baletani/ml-recommendation-service/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### **C. Health Check Endpoints**

**Backend sudah punya:**

```javascript
// File: backend/src/routes/health.js
// GET /api/health
// GET /api/health/db
```

**Setup Monitoring:**

1. **UptimeRobot** (Free) - https://uptimerobot.com

   - Monitor: https://api.baletani.com/api/health
   - Check interval: 5 minutes
   - Alert via email/SMS jika down

2. **Better Uptime** (Freemium)
3. **Pingdom** (Paid)

---

### **🔟 DEPLOYMENT SCRIPT**

#### **File: `deploy.sh`** (BUAT DI ROOT PROJECT)

```bash
#!/bin/bash

# ========================================
# BALETANI DEPLOYMENT SCRIPT
# ========================================

set -e  # Exit on error

echo "🚀 Starting BaleTani Deployment..."

# ========================================
# 1. PULL LATEST CODE
# ========================================
echo "📥 Pulling latest code from Git..."
git pull origin main

# ========================================
# 2. BACKEND DEPLOYMENT
# ========================================
echo "🔧 Deploying Backend..."
cd backend

# Install dependencies (only production)
npm install --production

# Run database migrations if any
# npm run migrate

echo "✅ Backend deployed"
cd ..

# ========================================
# 3. FRONTEND DEPLOYMENT
# ========================================
echo "🎨 Building Frontend..."
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

echo "✅ Frontend built"
cd ..

# ========================================
# 4. ML SERVICE DEPLOYMENT
# ========================================
echo "🤖 Deploying ML Service..."
cd ml-recommendation-service

# Activate virtual environment (if using)
# source venv/bin/activate

# Install dependencies
pip3 install -r requirements-production.txt

# Download NLTK data if needed
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

echo "✅ ML Service deployed"
cd ..

# ========================================
# 5. RESTART SERVICES
# ========================================
echo "♻️ Restarting services with PM2..."
pm2 restart ecosystem.config.js --env production

# ========================================
# 6. VERIFY DEPLOYMENT
# ========================================
echo "🔍 Verifying deployment..."
sleep 5

# Check if services are running
pm2 status

# Health checks
echo "Checking Backend Health..."
curl -f http://localhost:5000/api/health || echo "❌ Backend health check failed"

echo "Checking ML Service Health..."
curl -f http://localhost:8000/health || echo "❌ ML Service health check failed"

# ========================================
# 7. CLEANUP
# ========================================
echo "🧹 Cleaning up..."
# Clear old PM2 logs
pm2 flush

echo ""
echo "✅ =========================================="
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "✅ =========================================="
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔗 URLs:"
echo "   Customer: https://baletani.com"
echo "   Admin: https://admin.baletani.com"
echo "   API: https://api.baletani.com"
echo ""
echo "📝 Check logs with: pm2 logs"
echo "📊 Monitor with: pm2 monit"
```

**Make executable:**

```bash
chmod +x deploy.sh
```

**Usage:**

```bash
./deploy.sh
```

---

### **1️⃣1️⃣ CI/CD PIPELINE (Optional - Advanced)**

#### **GitHub Actions Configuration**

**File: `.github/workflows/deploy.yml`** (BUAT BARU)

```yaml
name: Deploy BaleTani to Production

on:
  push:
    branches:
      - main
  workflow_dispatch: # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: 🔄 Checkout code
        uses: actions/checkout@v3

      - name: 🔐 Setup SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: 📂 Add server to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts

      - name: 🚀 Deploy to Server
        run: |
          ssh ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} << 'EOF'
            cd /var/www/baletani
            ./deploy.sh
          EOF

      - name: ✅ Deployment Complete
        run: echo "Deployment completed successfully!"
```

**Setup GitHub Secrets:**

- `SSH_PRIVATE_KEY`: Private key untuk SSH ke server
- `SERVER_HOST`: IP atau domain server
- `SERVER_USER`: Username SSH

---

## 🔍 TESTING SEBELUM DEPLOYMENT

### **1. Local Production Build Test**

```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm run preview

# ML Service
cd ml-recommendation-service
APP_ENV=production python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### **2. Load Testing**

**Sudah ada K6 setup:**

```bash
cd k6-load-testing
k6 run smoke-test.js
```

### **3. E2E Testing**

**Sudah ada Cypress:**

```bash
cd e2e-tests
npm test
```

---

## 📊 POST-DEPLOYMENT CHECKLIST

- [ ] ✅ Semua service running (check PM2)
- [ ] ✅ Database connected
- [ ] ✅ SSL certificate valid
- [ ] ✅ Health endpoints responding
- [ ] ✅ Frontend accessible
- [ ] ✅ Admin panel accessible
- [ ] ✅ File uploads working
- [ ] ✅ Email notifications (if any)
- [ ] ✅ Cron jobs running
- [ ] ✅ Logs rotating properly
- [ ] ✅ Monitoring setup
- [ ] ✅ Backup script running
- [ ] ✅ DNS configured correctly

---

## 🆘 TROUBLESHOOTING

### **Backend tidak start:**

```bash
# Check logs
pm2 logs baletani-backend

# Check database connection
mysql -u baletani_user -p baletani_production

# Check environment variables
pm2 env 0
```

### **Frontend tidak load:**

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/baletani-customer-error.log

# Check file permissions
ls -la /var/www/baletani/frontend/dist

# Test Nginx config
sudo nginx -t
```

### **ML Service error:**

```bash
# Check logs
pm2 logs baletani-ml-service

# Check Python version
python3 --version

# Check model files
ls -la ml-recommendation-service/models_artifacts/

# Test manual
cd ml-recommendation-service
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### **Database connection error:**

```bash
# Check MySQL service
sudo systemctl status mysql

# Check user privileges
mysql -u root -p
SELECT User, Host FROM mysql.user WHERE User = 'baletani_user';
SHOW GRANTS FOR 'baletani_user'@'localhost';
```

---

## 💰 ESTIMASI BIAYA TOTAL

### **Opsi VPS (Recommended):**

| Item               | Provider            | Spesifikasi               | Biaya/Bulan        |
| ------------------ | ------------------- | ------------------------- | ------------------ |
| **VPS**            | Hetzner             | 4GB RAM, 2 vCPU, 80GB SSD | $9 USD             |
| **Domain**         | Namecheap           | .com                      | $1 USD             |
| **SSL**            | Let's Encrypt       | Free                      | $0                 |
| **Backup Storage** | DigitalOcean Spaces | 250GB                     | $5 USD             |
| **Monitoring**     | UptimeRobot         | Free plan                 | $0                 |
| **Total**          |                     |                           | **~$15 USD/bulan** |

### **Opsi PaaS (Alternative):**

| Item         | Provider    | Biaya/Bulan           |
| ------------ | ----------- | --------------------- |
| Frontend     | Vercel      | $0 (Free)             |
| Backend API  | Railway     | $10-15                |
| MySQL DB     | PlanetScale | $0 (Free tier)        |
| ML Service   | Railway     | $10                   |
| Domain + SSL | Included    | $1                    |
| **Total**    |             | **~$21-26 USD/bulan** |

---

## 🎯 KESIMPULAN & REKOMENDASI

### **✅ Untuk Project BaleTani, pilihan TERBAIK adalah:**

**🏆 VPS (Hetzner Cloud) - €8.19/bulan (~$9)**

**Alasan:**

1. ✅ **Paling cost-effective** untuk jangka panjang
2. ✅ **Full control** untuk optimasi
3. ✅ **Cocok untuk ML service** yang butuh resource stabil
4. ✅ **Bisa handle file uploads** tanpa batas
5. ✅ **Support cron jobs** untuk auto-cancel orders
6. ✅ **Scalable** - bisa upgrade kapan saja
7. ✅ **Professional setup** untuk portfolio

### **📝 Urutan Prioritas Persiapan:**

1. **High Priority (HARUS):**

   - ✅ Ganti JWT_SECRET di production
   - ✅ Setup database user dengan limited privileges
   - ✅ Configure .env.production untuk semua services
   - ✅ Build frontend dan test
   - ✅ Setup Nginx configuration
   - ✅ Install SSL certificate
   - ✅ Setup PM2 untuk process management

2. **Medium Priority (SANGAT DISARANKAN):**

   - ✅ Setup automated backups
   - ✅ Configure log rotation
   - ✅ Setup monitoring (UptimeRobot)
   - ✅ Create deployment script
   - ✅ Test ML service di production

3. **Low Priority (Optional):**
   - ⭕ Setup CI/CD pipeline
   - ⭕ Migrate ke S3/cloud storage untuk uploads
   - ⭕ Add Redis untuk caching
   - ⭕ Setup CDN untuk static assets

---

## 📚 RESOURCES & DOKUMENTASI

### **VPS Setup Guides:**

- [DigitalOcean Initial Server Setup](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04)
- [How to Install Node.js on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04)
- [How to Install Nginx on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04)

### **Deployment Tools:**

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

### **Monitoring:**

- [UptimeRobot](https://uptimerobot.com/)
- [PM2 Plus](https://pm2.io/)

---

## 📞 SUPPORT

Jika ada pertanyaan atau butuh bantuan setup, silakan:

1. Check troubleshooting section di atas
2. Review logs dengan `pm2 logs`
3. Check Nginx logs di `/var/log/nginx/`

---

**🎉 Good luck dengan deployment BaleTani!**

_Dokumen ini dibuat berdasarkan analisis lengkap codebase project BaleTani Fresh Market._
