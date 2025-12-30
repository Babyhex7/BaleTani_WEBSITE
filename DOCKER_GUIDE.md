# 🐳 BaleTani Docker Setup Guide

Panduan lengkap untuk menjalankan BaleTani dengan Docker, memastikan environment yang konsisten untuk semua developer.

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Docker Desktop** (Windows/Mac) atau **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- Minimal 8GB RAM (TensorFlow membutuhkan banyak memory)

### Instalasi Docker

**Windows:**

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install dan restart komputer
3. Buka Docker Desktop dan tunggu sampai running

**Linux (Ubuntu/Debian):**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Add user ke docker group (logout setelah ini)
sudo usermod -aG docker $USER
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone repository (jika belum)
git clone <repository-url>
cd BaleTani_WEBSITE

# Copy environment file
cp .env.example .env

# Edit .env sesuai kebutuhan (opsional)
```

### 2. Jalankan Development Environment

```bash
# Start semua services dengan hot-reload
docker compose -f docker-compose.dev.yml up --build

# Atau jalankan di background
docker compose -f docker-compose.dev.yml up --build -d
```

### 3. Akses Aplikasi

| Service     | URL                        | Deskripsi                   |
| ----------- | -------------------------- | --------------------------- |
| Frontend    | http://localhost:5173      | React App (Vite Dev Server) |
| Backend API | http://localhost:5000      | Express.js API              |
| ML Service  | http://localhost:8000      | FastAPI ML Service          |
| ML Docs     | http://localhost:8000/docs | Swagger UI                  |

## 📁 Struktur Docker Files

```
BaleTani_WEBSITE/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development dengan hot-reload
├── .env.example                 # Template environment variables
├── .dockerignore               # Root docker ignore
│
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development dengan nodemon
│   └── .dockerignore
│
├── frontend/
│   ├── Dockerfile              # Production build (Nginx)
│   ├── Dockerfile.dev          # Development (Vite)
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore
│
└── ml-recommendation-service/
    ├── Dockerfile              # Production build
    ├── Dockerfile.dev          # Development dengan uvicorn reload
    └── .dockerignore
```

## 🛠️ Perintah Docker Umum

### Development

```bash
# Start semua services
docker compose -f docker-compose.dev.yml up

# Start dengan rebuild
docker compose -f docker-compose.dev.yml up --build

# Start service tertentu saja
docker compose -f docker-compose.dev.yml up backend mysql

# Stop semua services
docker compose -f docker-compose.dev.yml down

# Lihat logs
docker compose -f docker-compose.dev.yml logs -f

# Lihat logs service tertentu
docker compose -f docker-compose.dev.yml logs -f backend

# Restart service tertentu
docker compose -f docker-compose.dev.yml restart backend

# Masuk ke container
docker compose -f docker-compose.dev.yml exec backend sh
docker compose -f docker-compose.dev.yml exec mysql mysql -u root -p
```

### Production

```bash
# Build dan start production
docker compose up --build -d

# Check status
docker compose ps

# Lihat logs
docker compose logs -f

# Stop production
docker compose down

# Stop dan hapus volumes (HATI-HATI: data akan hilang!)
docker compose down -v
```

### Database

```bash
# Akses MySQL CLI
docker compose -f docker-compose.dev.yml exec mysql mysql -u baletani_user -p baletani

# Backup database
docker compose exec mysql mysqldump -u root -p baletani > backup.sql

# Restore database
docker compose exec -T mysql mysql -u root -p baletani < backup.sql

# Run migrations (dari dalam container backend)
docker compose -f docker-compose.dev.yml exec backend npm run migrate

# Run seeders
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

## 🔧 Troubleshooting

### Port sudah digunakan

```bash
# Cek port yang digunakan
netstat -ano | findstr :5000

# Ubah port di .env
BACKEND_PORT=5001
FRONTEND_PORT=8080
```

### Container tidak bisa connect ke MySQL

```bash
# Tunggu MySQL selesai initialize (biasanya 30-60 detik pertama)
# Cek logs MySQL
docker compose -f docker-compose.dev.yml logs mysql

# Restart backend setelah MySQL ready
docker compose -f docker-compose.dev.yml restart backend
```

### Out of Memory (ML Service)

```bash
# Tambah memory di Docker Desktop Settings > Resources
# Minimal 4GB untuk ML Service, recommended 8GB
```

### Clean rebuild

```bash
# Stop dan hapus semua
docker compose -f docker-compose.dev.yml down -v

# Hapus semua images
docker system prune -a

# Rebuild dari awal
docker compose -f docker-compose.dev.yml up --build
```

### Permission denied (Linux)

```bash
# Fix permission untuk uploads
sudo chown -R 1001:1001 backend/public/uploads

# Atau gunakan current user ID di compose
```

## 📊 Monitoring

### Lihat resource usage

```bash
# Semua containers
docker stats

# Container tertentu
docker stats baletani-backend-dev
```

### Health checks

```bash
# Backend health
curl http://localhost:5000/api/health

# ML Service health
curl http://localhost:8000/health
```

## 🚢 Production Deployment

### Build untuk production

```bash
# Build semua images
docker compose build

# Build image tertentu
docker compose build backend
```

### Push ke registry

```bash
# Tag images
docker tag baletani-backend:latest your-registry/baletani-backend:v1.0.0

# Push
docker push your-registry/baletani-backend:v1.0.0
```

## 📝 Tips untuk Developer

1. **Hot Reload**: Perubahan kode akan otomatis ter-reload di development mode
2. **Database Persistent**: Data MySQL disimpan di Docker volume, tidak hilang saat container restart
3. **Environment Variables**: Jangan commit file `.env`, gunakan `.env.example` sebagai template
4. **Build Cache**: Docker meng-cache layers, jadi rebuild akan cepat jika tidak ada perubahan di package.json

## 🔐 Security Notes

- Ganti semua password default di `.env` untuk production
- Generate JWT_SECRET baru untuk production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Jangan expose port database (3306) ke public di production
- Gunakan Docker secrets untuk sensitive data di production

---

**Happy Coding! 🌾**
