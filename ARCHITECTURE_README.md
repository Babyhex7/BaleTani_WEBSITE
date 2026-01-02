# 🌾 BaleTani - Arsitektur Sistem

<p align="center">
  <strong>Platform E-Commerce Produk Pertanian dengan Sistem Rekomendasi AI</strong>
</p>

---

## 📋 Daftar Isi

- [Tentang BaleTani](#-tentang-baletani)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Detail Setiap Service](#-detail-setiap-service)
- [Database Schema](#-database-schema)
- [Alur Komunikasi](#-alur-komunikasi)
- [API Endpoints](#-api-endpoints)
- [Sistem Rekomendasi ML](#-sistem-rekomendasi-ml)
- [Environment Variables](#-environment-variables)
- [Cara Menjalankan](#-cara-menjalankan)
- [Docker Deployment](#-docker-deployment)

---

## 🌾 Tentang BaleTani

**BaleTani** adalah platform e-commerce untuk produk pertanian yang dilengkapi dengan sistem rekomendasi berbasis Machine Learning. Platform ini menghubungkan petani/supplier dengan konsumen untuk mempermudah distribusi produk pertanian.

### ✨ Fitur Utama

| Fitur                     | Deskripsi                                                       |
| ------------------------- | --------------------------------------------------------------- |
| 🛒 **Katalog Produk**     | Menampilkan produk pertanian dengan kategori, gambar, dan harga |
| 🤖 **Sistem Rekomendasi** | Rekomendasi produk menggunakan Neural Content-Based model       |
| 🛍️ **Keranjang Belanja**  | Fitur cart untuk menyimpan produk sebelum checkout              |
| 📦 **Manajemen Order**    | Tracking pesanan dengan status history                          |
| 📊 **Admin Dashboard**    | Panel admin untuk mengelola seluruh sistem                      |
| 🔐 **Role-Based Access**  | Sistem permission untuk admin dengan berbagai role              |
| 📋 **Procurement**        | Manajemen pengadaan barang dari supplier                        |

---

## 🏗️ Arsitektur Sistem

BaleTani menggunakan arsitektur **Multi-Service** dengan 3 service utama yang dapat di-deploy secara independen:

### 🌐 High-Level Architecture

```
                                    ┌─────────────────────┐
                                    │     INTERNET        │
                                    │   (Users/Browsers)  │
                                    └──────────┬──────────┘
                                               │
                                               │ HTTPS (443)
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              NGINX REVERSE PROXY                                     │
│                            (Load Balancer & SSL)                                     │
│                                                                                      │
│   • SSL Termination           • Static File Serving        • Request Routing        │
│   • Load Balancing            • Gzip Compression           • Rate Limiting          │
└────────────┬─────────────────────────┬─────────────────────────────┬────────────────┘
             │                         │                             │
             │ :5173                   │ :5000                       │ :8000
             ▼                         ▼                             ▼
┌─────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────────┐
│                     │   │                         │   │                             │
│   🎨 FRONTEND       │   │   ⚙️ BACKEND            │   │   🤖 ML SERVICE             │
│   (Client-Side)     │   │   (Server-Side)         │   │   (AI/ML Engine)            │
│                     │   │                         │   │                             │
│ ┌─────────────────┐ │   │ ┌─────────────────────┐ │   │ ┌─────────────────────────┐ │
│ │  React 18       │ │   │ │  Express.js         │ │   │ │  FastAPI                │ │
│ │  + Vite         │ │   │ │  + Sequelize ORM    │ │   │ │  + TensorFlow/Keras     │ │
│ │  + Zustand      │ │   │ │  + JWT Auth         │ │   │ │  + Neural Network       │ │
│ │  + Tailwind     │ │   │ │  + NodeCache        │ │   │ │  + Similarity Engine    │ │
│ └─────────────────┘ │   │ └─────────────────────┘ │   │ └─────────────────────────┘ │
│                     │   │                         │   │                             │
│  📱 Responsive UI   │   │  🔐 Authentication      │   │  📊 Product Embeddings      │
│  🎭 Customer Area   │   │  📝 CRUD Operations     │   │  🎯 Recommendations         │
│  🔧 Admin Panel     │   │  📊 Business Logic      │   │  📈 Trending Analysis       │
│                     │   │                         │   │                             │
└─────────────────────┘   └────────────┬────────────┘   └──────────────┬──────────────┘
                                       │                               │
                                       │ SQL Queries                   │ HTTP/REST
                                       │                               │
                                       ▼                               │
                          ┌────────────────────────┐                   │
                          │                        │                   │
                          │   🗄️ MySQL DATABASE    │◀──────────────────┘
                          │                        │
                          │  • Products            │
                          │  • Orders              │
                          │  • Customers           │
                          │  • Admins/Roles        │
                          │  • Categories          │
                          │  • Procurements        │
                          │                        │
                          └────────────────────────┘
```

---

### 🔄 Arsitektur Komunikasi Detail

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND ARCHITECTURE                                      │
│                                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │    Pages     │───▶│  Components  │───▶│   Hooks      │───▶│  Services (API)  │  │
│  │              │    │              │    │              │    │                  │  │
│  │ • Home       │    │ • Navbar     │    │ • useAuth    │    │ • productService │  │
│  │ • Products   │    │ • ProductCard│    │ • useCart    │    │ • orderService   │  │
│  │ • Cart       │    │ • Footer     │    │ • useDebounce│    │ • authService    │  │
│  │ • Admin/*    │    │ • Modal      │    │              │    │                  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────────┬─────────┘  │
│                                                                        │            │
│  ┌──────────────────────────────────────────────────────────────────┐ │            │
│  │                     ZUSTAND STORES                                │ │            │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │            │
│  │  │ authStore   │  │ cartStore   │  │productStore │               │ │            │
│  │  │ • user      │  │ • items     │  │ • products  │               │ │            │
│  │  │ • token     │  │ • total     │  │ • loading   │               │ │            │
│  │  │ • isAuth    │  │ • quantity  │  │ • filters   │               │ │            │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │ │            │
│  └──────────────────────────────────────────────────────────────────┘ │            │
└───────────────────────────────────────────────────────────────────────┼────────────┘
                                                                        │
                              Axios HTTP Request                        │
                              (GET/POST/PUT/DELETE)                     │
                              + JWT Bearer Token                        │
                                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND ARCHITECTURE                                       │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              EXPRESS APP                                     │   │
│  │                                                                              │   │
│  │   Request ──▶ [Middlewares] ──▶ [Routes] ──▶ [Controllers] ──▶ Response    │   │
│  │                                                                              │   │
│  │   ┌──────────────────────────────────────────────────────────────────┐      │   │
│  │   │ MIDDLEWARES                                                       │      │   │
│  │   │ • auth.middleware.js      → JWT verification                      │      │   │
│  │   │ • checkPermission.js      → Role-based access control (RBAC)      │      │   │
│  │   │ • rateLimiter.middleware  → Rate limiting (500 req/15min)         │      │   │
│  │   │ • upload.middleware.js    → File upload (Multer)                  │      │   │
│  │   │ • error.middleware.js     → Global error handling                 │      │   │
│  │   └──────────────────────────────────────────────────────────────────┘      │   │
│  │                                                                              │   │
│  │   ┌──────────────────────────────────────────────────────────────────┐      │   │
│  │   │ ROUTES                                                            │      │   │
│  │   │                                                                   │      │   │
│  │   │   /api/public/*      → Public endpoints (no auth)                │      │   │
│  │   │   /api/customer/*    → Customer endpoints (customer JWT)         │      │   │
│  │   │   /api/admin/*       → Admin endpoints (admin JWT + permissions) │      │   │
│  │   │   /api/recommendations/* → ML recommendation endpoints           │      │   │
│  │   └──────────────────────────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Controllers │───▶│  Services   │───▶│   Models    │───▶│   MySQL Database    │  │
│  │             │    │             │    │ (Sequelize) │    │                     │  │
│  │ Handle      │    │ Business    │    │             │    │ • Tables            │  │
│  │ Request     │    │ Logic       │    │ • Product   │    │ • Indexes           │  │
│  │ Validation  │    │ Processing  │    │ • Order     │    │ • Relations         │  │
│  │ Response    │    │ Caching     │    │ • Customer  │    │ • Constraints       │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                            │                                                        │
│                            ▼                                                        │
│                    ┌─────────────┐                                                  │
│                    │  NodeCache  │                                                  │
│                    │ (In-Memory) │                                                  │
│                    │             │                                                  │
│                    │ TTL: 5 min  │                                                  │
│                    └─────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                          │
                          │ Internal HTTP Request (axios)
                          │ POST /v1/recommendations/*
                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       ML RECOMMENDATION SERVICE                                     │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           FASTAPI APPLICATION                                │   │
│  │                                                                              │   │
│  │   /health              → Service health check                               │   │
│  │   /v1/recommendations/similar/{id}    → Similar products                    │   │
│  │   /v1/recommendations/bundle          → Bundle recommendations              │   │
│  │   /v1/recommendations/trending        → Trending products                   │   │
│  │   /v1/recommendations/category/{id}   → Category recommendations            │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐ │
│  │                    NEURAL CONTENT-BASED (NCB) MODEL                           │ │
│  │                                                                               │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │ │
│  │   │   INPUT     │    │  FEATURE    │    │  PRODUCT    │    │ SIMILARITY  │   │ │
│  │   │   DATA      │───▶│ EXTRACTION  │───▶│  ENCODER    │───▶│   ENGINE    │   │ │
│  │   │             │    │             │    │             │    │             │   │ │
│  │   │ • name      │    │ • TF-IDF    │    │ Dense(256)  │    │ • Cosine    │   │ │
│  │   │ • category  │    │ • One-Hot   │    │ Dense(128)  │    │   Similarity│   │ │
│  │   │ • price     │    │ • Normalize │    │ Dense(64)   │    │ • KNN       │   │ │
│  │   │ • desc      │    │             │    │ → Embedding │    │ • Ranking   │   │ │
│  │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │ │
│  │                                                                               │ │
│  │                              OUTPUT: Top-K Similar Products                   │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📊 Arsitektur Database

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MySQL DATABASE SCHEMA                                  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           USER MANAGEMENT                                    │   │
│  │                                                                              │   │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────────────┐         │   │
│  │   │   admins    │      │    roles    │      │    permissions      │         │   │
│  │   ├─────────────┤      ├─────────────┤      ├─────────────────────┤         │   │
│  │   │ id (PK)     │─────▶│ id (PK)     │◀─────│ id (PK)             │         │   │
│  │   │ name        │      │ name        │      │ name                │         │   │
│  │   │ email       │      │ description │      │ action              │         │   │
│  │   │ password    │      └─────────────┘      │ resource            │         │   │
│  │   │ role_id(FK) │             │             └─────────────────────┘         │   │
│  │   │ is_active   │             │                       │                      │   │
│  │   └─────────────┘             │                       │                      │   │
│  │                               ▼                       ▼                      │   │
│  │                      ┌─────────────────────────────────────┐                 │   │
│  │   ┌─────────────┐    │         role_permissions            │                 │   │
│  │   │  customers  │    ├─────────────────────────────────────┤                 │   │
│  │   ├─────────────┤    │ role_id (FK)                        │                 │   │
│  │   │ id (PK)     │    │ permission_id (FK)                  │                 │   │
│  │   │ name        │    └─────────────────────────────────────┘                 │   │
│  │   │ email       │                                                            │   │
│  │   │ password    │                                                            │   │
│  │   │ phone       │                                                            │   │
│  │   │ address     │                                                            │   │
│  │   └─────────────┘                                                            │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           PRODUCT MANAGEMENT                                 │   │
│  │                                                                              │   │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────────────┐         │   │
│  │   │ categories  │      │  products   │      │   product_images    │         │   │
│  │   ├─────────────┤      ├─────────────┤      ├─────────────────────┤         │   │
│  │   │ id (PK)     │◀─────│ id (PK)     │─────▶│ id (PK)             │         │   │
│  │   │ name        │      │ name        │      │ product_id (FK)     │         │   │
│  │   │ description │      │ description │      │ image_url           │         │   │
│  │   │ image_url   │      │ price       │      │ is_primary          │         │   │
│  │   └─────────────┘      │ stock       │      │ display_order       │         │   │
│  │                        │ category_id │      └─────────────────────┘         │   │
│  │                        │ unit        │                                       │   │
│  │                        │ is_active   │      ┌─────────────────────┐         │   │
│  │                        └─────────────┘      │   stock_movements   │         │   │
│  │                               │             ├─────────────────────┤         │   │
│  │                               │             │ id (PK)             │         │   │
│  │   ┌─────────────┐             │             │ product_id (FK)     │         │   │
│  │   │  discounts  │             │             │ quantity            │         │   │
│  │   ├─────────────┤             │             │ type (in/out)       │         │   │
│  │   │ id (PK)     │◀────────────┼─────────────│ reference_id        │         │   │
│  │   │ name        │             │             │ notes               │         │   │
│  │   │ percentage  │             ▼             └─────────────────────┘         │   │
│  │   │ start_date  │    ┌─────────────────────┐                                │   │
│  │   │ end_date    │    │ product_discounts   │                                │   │
│  │   │ is_active   │    ├─────────────────────┤                                │   │
│  │   └─────────────┘    │ product_id (FK)     │                                │   │
│  │                      │ discount_id (FK)    │                                │   │
│  │                      └─────────────────────┘                                │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           ORDER MANAGEMENT                                   │   │
│  │                                                                              │   │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────────────┐         │   │
│  │   │    carts    │      │   orders    │      │    order_items      │         │   │
│  │   ├─────────────┤      ├─────────────┤      ├─────────────────────┤         │   │
│  │   │ id (PK)     │      │ id (PK)     │─────▶│ id (PK)             │         │   │
│  │   │ customer_id │      │ customer_id │      │ order_id (FK)       │         │   │
│  │   │ product_id  │      │ total_amount│      │ product_id (FK)     │         │   │
│  │   │ quantity    │      │ status      │      │ quantity            │         │   │
│  │   └─────────────┘      │ address     │      │ price               │         │   │
│  │                        │ created_at  │      │ subtotal            │         │   │
│  │                        └─────────────┘      └─────────────────────┘         │   │
│  │                               │                                              │   │
│  │                               │                                              │   │
│  │   ┌─────────────────────┐     │      ┌────────────────────────────┐         │   │
│  │   │   payment_details   │     │      │  order_status_histories    │         │   │
│  │   ├─────────────────────┤     │      ├────────────────────────────┤         │   │
│  │   │ id (PK)             │◀────┴─────▶│ id (PK)                    │         │   │
│  │   │ order_id (FK)       │            │ order_id (FK)              │         │   │
│  │   │ payment_method      │            │ status                     │         │   │
│  │   │ payment_status      │            │ notes                      │         │   │
│  │   │ payment_proof       │            │ changed_by                 │         │   │
│  │   │ paid_at             │            │ created_at                 │         │   │
│  │   │ expires_at          │            └────────────────────────────┘         │   │
│  │   └─────────────────────┘                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           PROCUREMENT & OTHERS                               │   │
│  │                                                                              │   │
│  │   ┌─────────────────┐    ┌───────────────────┐    ┌──────────────────────┐  │   │
│  │   │  procurements   │    │ procurement_items │    │  contact_messages    │  │   │
│  │   ├─────────────────┤    ├───────────────────┤    ├──────────────────────┤  │   │
│  │   │ id (PK)         │───▶│ id (PK)           │    │ id (PK)              │  │   │
│  │   │ supplier_name   │    │ procurement_id    │    │ name                 │  │   │
│  │   │ total_amount    │    │ product_id (FK)   │    │ email                │  │   │
│  │   │ status          │    │ quantity          │    │ subject              │  │   │
│  │   │ invoice_number  │    │ unit_price        │    │ message              │  │   │
│  │   │ notes           │    └───────────────────┘    │ is_read              │  │   │
│  │   └─────────────────┘                             └──────────────────────┘  │   │
│  │                                                                              │   │
│  │   ┌─────────────────┐    ┌───────────────────┐                              │   │
│  │   │      faqs       │    │ soft_delete_logs  │                              │   │
│  │   ├─────────────────┤    ├───────────────────┤                              │   │
│  │   │ id (PK)         │    │ id (PK)           │                              │   │
│  │   │ question        │    │ table_name        │                              │   │
│  │   │ answer          │    │ record_id         │                              │   │
│  │   │ category        │    │ deleted_data      │                              │   │
│  │   │ display_order   │    │ deleted_by        │                              │   │
│  │   │ is_active       │    │ deleted_at        │                              │   │
│  │   └─────────────────┘    └───────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔐 Arsitektur Keamanan

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                                  │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           AUTHENTICATION FLOW                                │   │
│  │                                                                              │   │
│  │    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────────┐  │   │
│  │    │  Client  │────▶│  Login   │────▶│ Validate │────▶│  Generate JWT    │  │   │
│  │    │  Input   │     │  Request │     │ Password │     │                  │  │   │
│  │    │          │     │          │     │ (bcrypt) │     │  • user_id       │  │   │
│  │    │ email    │     │ POST     │     │          │     │  • role          │  │   │
│  │    │ password │     │ /login   │     │ ✓ Match  │     │  • permissions   │  │   │
│  │    └──────────┘     └──────────┘     └──────────┘     │  • expiry (7d)   │  │   │
│  │                                                        └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           AUTHORIZATION FLOW                                 │   │
│  │                                                                              │   │
│  │    ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐   │   │
│  │    │   Request    │────▶│   Verify     │────▶│   Check Permission       │   │   │
│  │    │   + Token    │     │   JWT Token  │     │                          │   │   │
│  │    │              │     │              │     │   Admin wants to:        │   │   │
│  │    │ Authorization│     │ • Valid?     │     │   DELETE /products/123   │   │   │
│  │    │ Bearer xxx   │     │ • Expired?   │     │                          │   │   │
│  │    └──────────────┘     │ • Tampered?  │     │   Has 'delete_products'? │   │   │
│  │                         └──────────────┘     │   ✓ Yes → Allow          │   │   │
│  │                                              │   ✗ No  → 403 Forbidden  │   │   │
│  │                                              └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           PROTECTION LAYERS                                  │   │
│  │                                                                              │   │
│  │   Layer 1: RATE LIMITING          │   Layer 3: INPUT VALIDATION             │   │
│  │   ┌────────────────────────────┐  │   ┌────────────────────────────┐        │   │
│  │   │ • 500 requests / 15 min   │  │   │ • express-validator        │        │   │
│  │   │ • Per IP address          │  │   │ • Sanitize input           │        │   │
│  │   │ • Skip static files       │  │   │ • Prevent SQL injection    │        │   │
│  │   └────────────────────────────┘  │   └────────────────────────────┘        │   │
│  │                                    │                                         │   │
│  │   Layer 2: HELMET SECURITY        │   Layer 4: CORS POLICY                  │   │
│  │   ┌────────────────────────────┐  │   ┌────────────────────────────┐        │   │
│  │   │ • Security headers        │  │   │ • Whitelist origins        │        │   │
│  │   │ • XSS protection          │  │   │ • Allowed methods          │        │   │
│  │   │ • Content-Type sniffing   │  │   │ • Credentials handling     │        │   │
│  │   └────────────────────────────┘  │   └────────────────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📌 Penjelasan Arsitektur

| Service        | Tanggung Jawab                        | Teknologi                          | Port |
| -------------- | ------------------------------------- | ---------------------------------- | ---- |
| **Frontend**   | User Interface, interaksi pengguna    | React, Vite, Zustand, Tailwind CSS | 5173 |
| **Backend**    | Business logic, REST API, autentikasi | Node.js, Express, Sequelize        | 5000 |
| **ML Service** | Rekomendasi produk dengan AI          | Python, FastAPI, TensorFlow        | 8000 |
| **Database**   | Penyimpanan data                      | MySQL                              | 3306 |

---

### 📈 Data Flow Diagrams

#### 🛒 Flow: Customer Melakukan Order

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER ORDER FLOW                                         │
│                                                                                    │
│   ┌─────────────┐                                                                  │
│   │  CUSTOMER   │                                                                  │
│   │  BROWSER    │                                                                  │
│   └──────┬──────┘                                                                  │
│          │                                                                         │
│          │ 1. Browse Products                                                      │
│          ▼                                                                         │
│   ┌─────────────────┐    GET /api/public/products                                  │
│   │    FRONTEND     │─────────────────────────────────────────┐                    │
│   │   (React App)   │                                         │                    │
│   └─────────────────┘                                         │                    │
│          │                                                    │                    │
│          │ 2. Add to Cart                                     ▼                    │
│          ▼                                         ┌─────────────────────┐         │
│   ┌─────────────────┐                              │      BACKEND        │         │
│   │  ZUSTAND STORE  │                              │    (Express.js)     │         │
│   │   (cartStore)   │                              └─────────────────────┘         │
│   └─────────────────┘                                         │                    │
│          │                                                    │                    │
│          │ 3. Checkout                                        │ Query             │
│          ▼                                                    ▼                    │
│   POST /api/customer/orders                         ┌─────────────────────┐        │
│   ───────────────────────────────────────────────▶  │       MySQL         │        │
│                                                     │     DATABASE        │        │
│   ┌─────────────────────────────────────────────┐   └─────────────────────┘        │
│   │  Request Body:                              │                                  │
│   │  {                                          │                                  │
│   │    "items": [{productId, quantity}, ...],   │                                  │
│   │    "shipping_address": "Jl. Contoh No.1",   │                                  │
│   │    "payment_method": "bank_transfer"        │                                  │
│   │  }                                          │                                  │
│   └─────────────────────────────────────────────┘                                  │
│                                                                                    │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                         BACKEND PROCESSING                                   │  │
│   │                                                                              │  │
│   │  1. Validate JWT Token          ──▶  auth.middleware.js                      │  │
│   │  2. Validate Request Body       ──▶  express-validator                       │  │
│   │  3. Check Stock Availability    ──▶  SELECT stock FROM products              │  │
│   │  4. Calculate Total Price       ──▶  orderService.calculateTotal()           │  │
│   │  5. Create Order Record         ──▶  INSERT INTO orders                      │  │
│   │  6. Create Order Items          ──▶  INSERT INTO order_items                 │  │
│   │  7. Deduct Stock                ──▶  UPDATE products SET stock = stock - qty │  │
│   │  8. Create Payment Details      ──▶  INSERT INTO payment_details             │  │
│   │  9. Set Payment Expiry (24h)    ──▶  expires_at = NOW() + 24 hours           │  │
│   │  10. Clear Customer Cart        ──▶  DELETE FROM carts WHERE customer_id = x │  │
│   │                                                                              │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                    │
│   Response:                                                                        │
│   {                                                                                │
│     "success": true,                                                               │
│     "data": {                                                                      │
│       "order_id": 12345,                                                           │
│       "total_amount": 150000,                                                      │
│       "payment_expires_at": "2024-01-02T10:00:00Z"                                 │
│     }                                                                              │
│   }                                                                                │
└────────────────────────────────────────────────────────────────────────────────────┘
```

#### 🤖 Flow: AI Recommendation

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                       AI RECOMMENDATION FLOW                                       │
│                                                                                    │
│   ┌─────────────┐                                                                  │
│   │  CUSTOMER   │  Views Product Detail Page                                       │
│   │  BROWSER    │  (Product ID: 42)                                                │
│   └──────┬──────┘                                                                  │
│          │                                                                         │
│          │ GET /api/recommendations/similar/42                                     │
│          ▼                                                                         │
│   ┌─────────────────┐                                                              │
│   │    FRONTEND     │ React useEffect fetches recommendations                      │
│   │                 │ on component mount                                           │
│   └────────┬────────┘                                                              │
│            │                                                                       │
│            │                                                                       │
│            ▼                                                                       │
│   ┌──────────────────────────────────────────────────────────────────────────┐     │
│   │                         BACKEND (Express.js)                              │     │
│   │                                                                           │     │
│   │   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐  │     │
│   │   │ recommendation  │───▶│ recommendation  │───▶│    NodeCache        │  │     │
│   │   │    .routes.js   │    │  .controller.js │    │  (Check Cache)      │  │     │
│   │   └─────────────────┘    └─────────────────┘    └─────────────────────┘  │     │
│   │                                                          │               │     │
│   │                              ┌───────────────────────────┤               │     │
│   │                              │                           │               │     │
│   │                              │ Cache HIT                 │ Cache MISS    │     │
│   │                              ▼                           ▼               │     │
│   │                     ┌─────────────────┐         ┌─────────────────────┐  │     │
│   │                     │ Return Cached   │         │  Forward Request    │  │     │
│   │                     │ Recommendations │         │  to ML Service      │  │     │
│   │                     └─────────────────┘         └──────────┬──────────┘  │     │
│   │                                                            │             │     │
│   └────────────────────────────────────────────────────────────┼─────────────┘     │
│                                                                │                   │
│                                          POST /v1/recommendations/similar/42       │
│                                                                │                   │
│                                                                ▼                   │
│   ┌──────────────────────────────────────────────────────────────────────────┐     │
│   │                      ML SERVICE (FastAPI + TensorFlow)                    │     │
│   │                                                                           │     │
│   │   ┌─────────────────────────────────────────────────────────────────┐    │     │
│   │   │                    RECOMMENDATION PIPELINE                       │    │     │
│   │   │                                                                  │    │     │
│   │   │   1. Load Product Data (product_id: 42)                          │    │     │
│   │   │      └──▶ Query MySQL untuk get product details                  │    │     │
│   │   │                                                                  │    │     │
│   │   │   2. Feature Extraction                                          │    │     │
│   │   │      └──▶ Extract: name, category, price, description            │    │     │
│   │   │                                                                  │    │     │
│   │   │   3. Load Pre-trained NCB Model                                  │    │     │
│   │   │      └──▶ models_artifacts/ncb_model.keras                       │    │     │
│   │   │                                                                  │    │     │
│   │   │   4. Generate Product Embedding (64-dim vector)                  │    │     │
│   │   │      └──▶ encoder.predict(features) → [0.23, 0.45, ...]          │    │     │
│   │   │                                                                  │    │     │
│   │   │   5. Calculate Cosine Similarity                                 │    │     │
│   │   │      └──▶ Compare with all product embeddings                    │    │     │
│   │   │                                                                  │    │     │
│   │   │   6. Rank & Return Top-K Similar Products                        │    │     │
│   │   │      └──▶ Return top 5 products with similarity scores           │    │     │
│   │   │                                                                  │    │     │
│   │   └─────────────────────────────────────────────────────────────────┘    │     │
│   │                                                                           │     │
│   │   Response:                                                               │     │
│   │   {                                                                       │     │
│   │     "product_id": 42,                                                     │     │
│   │     "similar_products": [                                                 │     │
│   │       {"id": 15, "name": "Beras Organik B", "similarity": 0.95},          │     │
│   │       {"id": 28, "name": "Beras Premium C", "similarity": 0.89},          │     │
│   │       {"id": 33, "name": "Beras Merah D", "similarity": 0.85},            │     │
│   │       ...                                                                 │     │
│   │     ]                                                                     │     │
│   │   }                                                                       │     │
│   └──────────────────────────────────────────────────────────────────────────┘     │
│                                                                                    │
│   ┌──────────────────────────────────────────────────────────────────────────┐     │
│   │  Backend receives response → Cache for 5 minutes → Return to Frontend    │     │
│   └──────────────────────────────────────────────────────────────────────────┘     │
│                                                                                    │
│   ┌──────────────────────────────────────────────────────────────────────────┐     │
│   │  Frontend displays "Produk Serupa" section with recommended products     │     │
│   └──────────────────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

#### 🔐 Flow: Admin Authentication & Authorization

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                      ADMIN AUTH & RBAC FLOW                                        │
│                                                                                    │
│   ┌─────────────┐                                                                  │
│   │    ADMIN    │                                                                  │
│   │   BROWSER   │                                                                  │
│   └──────┬──────┘                                                                  │
│          │                                                                         │
│          │ 1. Login Request                                                        │
│          │    POST /api/admin/auth/login                                           │
│          │    { email, password }                                                  │
│          ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                           AUTHENTICATION                                     │  │
│   │                                                                              │  │
│   │   ┌───────────────┐     ┌───────────────┐     ┌────────────────────────┐    │  │
│   │   │   Validate    │────▶│  Find Admin   │────▶│  Compare Password      │    │  │
│   │   │   Input       │     │  by Email     │     │  (bcrypt.compare)      │    │  │
│   │   └───────────────┘     └───────────────┘     └────────────────────────┘    │  │
│   │                                                          │                   │  │
│   │                                                          │ ✓ Match           │  │
│   │                                                          ▼                   │  │
│   │   ┌─────────────────────────────────────────────────────────────────────┐   │  │
│   │   │                    GENERATE JWT TOKEN                                │   │  │
│   │   │                                                                      │   │  │
│   │   │   Payload:                                                           │   │  │
│   │   │   {                                                                  │   │  │
│   │   │     "id": 1,                                                         │   │  │
│   │   │     "email": "admin@baletani.com",                                   │   │  │
│   │   │     "role": "Super Admin",                                           │   │  │
│   │   │     "permissions": [                                                 │   │  │
│   │   │       "create_products", "read_products", "update_products",         │   │  │
│   │   │       "delete_products", "manage_orders", "manage_users", ...        │   │  │
│   │   │     ],                                                               │   │  │
│   │   │     "exp": 1704672000  // 7 days from now                            │   │  │
│   │   │   }                                                                  │   │  │
│   │   │                                                                      │   │  │
│   │   │   jwt.sign(payload, JWT_SECRET) → "eyJhbGciOiJIUzI1NiIs..."          │   │  │
│   │   └─────────────────────────────────────────────────────────────────────┘   │  │
│   │                                                                              │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                    │
│          │ Response: { success: true, token: "eyJ...", admin: {...} }              │
│          │                                                                         │
│          │ 2. Store token in localStorage                                          │
│          │    Frontend: authStore.setToken(token)                                  │
│          │                                                                         │
│          │ 3. Access Protected Resource                                            │
│          │    DELETE /api/admin/products/123                                       │
│          │    Header: Authorization: Bearer eyJhbG...                              │
│          ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────┐  │
│   │                           AUTHORIZATION                                      │  │
│   │                                                                              │  │
│   │   Step 1: auth.middleware.js (JWT Verification)                              │  │
│   │   ┌─────────────────────────────────────────────────────────────────────┐   │  │
│   │   │                                                                      │   │  │
│   │   │   const token = req.headers.authorization.split(' ')[1];             │   │  │
│   │   │   const decoded = jwt.verify(token, process.env.JWT_SECRET);         │   │  │
│   │   │                                                                      │   │  │
│   │   │   if (!decoded) → 401 Unauthorized                                   │   │  │
│   │   │   if (expired)  → 401 Token Expired                                  │   │  │
│   │   │                                                                      │   │  │
│   │   │   req.admin = decoded;  // Attach admin info to request              │   │  │
│   │   │   next();                                                            │   │  │
│   │   │                                                                      │   │  │
│   │   └─────────────────────────────────────────────────────────────────────┘   │  │
│   │                                                                              │  │
│   │   Step 2: checkPermission.js (RBAC Check)                                    │  │
│   │   ┌─────────────────────────────────────────────────────────────────────┐   │  │
│   │   │                                                                      │   │  │
│   │   │   const requiredPermission = 'delete_products';                      │   │  │
│   │   │   const adminPermissions = req.admin.permissions;                    │   │  │
│   │   │                                                                      │   │  │
│   │   │   if (!adminPermissions.includes(requiredPermission)) {              │   │  │
│   │   │     return res.status(403).json({                                    │   │  │
│   │   │       success: false,                                                │   │  │
│   │   │       message: 'Access denied. Insufficient permissions.'            │   │  │
│   │   │     });                                                              │   │  │
│   │   │   }                                                                  │   │  │
│   │   │                                                                      │   │  │
│   │   │   next();  // ✓ Allowed to proceed                                   │   │  │
│   │   │                                                                      │   │  │
│   │   └─────────────────────────────────────────────────────────────────────┘   │  │
│   │                                                                              │  │
│   │   Step 3: Controller executes DELETE operation                               │  │
│   │   └──▶ Product with ID 123 deleted from database                             │  │
│   │                                                                              │  │
│   └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                    │
│   Response: { success: true, message: "Product deleted successfully" }             │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Teknologi        | Versi | Fungsi                  |
| ---------------- | ----- | ----------------------- |
| React            | 18.2  | UI Library              |
| Vite             | 4.4   | Build Tool & Dev Server |
| Zustand          | 4.4   | State Management        |
| Tailwind CSS     | 3.3   | CSS Framework           |
| Axios            | 1.5   | HTTP Client             |
| React Router DOM | 6.15  | Client-side Routing     |
| React Hot Toast  | 2.4   | Toast Notifications     |
| Framer Motion    | 10.16 | Animation Library       |
| Lucide React     | 0.279 | Icon Library            |

### Backend

| Teknologi          | Versi | Fungsi                         |
| ------------------ | ----- | ------------------------------ |
| Node.js            | 18.x  | Runtime Environment            |
| Express.js         | 4.18  | Web Framework                  |
| Sequelize          | 6.33  | ORM untuk MySQL                |
| MySQL2             | 3.6   | MySQL Driver                   |
| JSON Web Token     | 9.0   | Authentication                 |
| NodeCache          | 5.1   | In-memory Caching              |
| Multer             | 2.0   | File Upload                    |
| bcryptjs           | 2.4   | Password Hashing               |
| express-rate-limit | 6.10  | Rate Limiting                  |
| express-validator  | 7.0   | Input Validation               |
| Helmet             | 7.0   | Security Headers               |
| Moment Timezone    | 0.6   | Date/Time handling             |
| Axios              | 1.13  | HTTP Client (untuk ML Service) |
| CORS               | 2.8   | Cross-Origin Resource Sharing  |

### ML Recommendation Service

| Teknologi    | Versi            | Fungsi                        |
| ------------ | ---------------- | ----------------------------- |
| Python       | 3.11.5           | Programming Language          |
| FastAPI      | 0.108            | Web Framework                 |
| TensorFlow   | 2.15             | Deep Learning Framework (LTS) |
| Keras        | (included in TF) | High-level Neural Network API |
| NumPy        | 1.26             | Numerical Computing           |
| Pandas       | 2.1              | Data Manipulation             |
| Scikit-learn | 1.3              | Machine Learning Utilities    |
| Uvicorn      | 0.25             | ASGI Server                   |
| Pydantic     | 2.5              | Data Validation               |
| SQLAlchemy   | 2.0              | ORM untuk MySQL (future)      |
| PyMySQL      | 1.1              | MySQL Driver                  |
| Redis        | 5.0              | Caching Client                |
| NLTK         | 3.8              | Natural Language Processing   |
| Loguru       | 0.7              | Advanced Logging              |

### Database & Infrastructure

| Teknologi | Fungsi                              |
| --------- | ----------------------------------- |
| MySQL     | Relational Database                 |
| Docker    | Containerization                    |
| Nginx     | Reverse Proxy & Static File Serving |

---

## 📁 Struktur Project

```
BaleTani_WEBSITE/
│
├── 📂 frontend/                    # Frontend React Application
│   ├── 📂 src/
│   │   ├── 📂 components/          # Reusable UI Components
│   │   │   ├── 📂 admin/           # Admin-specific components
│   │   │   ├── 📂 auth/            # Authentication components
│   │   │   ├── 📂 layout/          # Layout (Navbar, Footer, dll)
│   │   │   ├── 📂 ui/              # General UI components
│   │   │   ├── 📂 ui_admin/        # Admin UI components
│   │   │   └── 📂 ui_customer/     # Customer UI components
│   │   ├── 📂 pages/               # Page Components
│   │   │   ├── 📂 admin/           # Admin pages
│   │   │   └── 📂 customer/        # Customer pages
│   │   ├── 📂 services/            # API Service Layer
│   │   ├── 📂 store/               # Zustand State Stores
│   │   ├── 📂 hooks/               # Custom React Hooks
│   │   ├── 📂 utils/               # Utility Functions
│   │   ├── 📂 assets/              # Static Assets (images)
│   │   ├── 📂 styles/              # Global Styles
│   │   ├── 📄 App.jsx              # Root Component
│   │   └── 📄 main.jsx             # Entry Point
│   ├── 📄 Dockerfile               # Production Dockerfile
│   ├── 📄 Dockerfile.dev           # Development Dockerfile
│   ├── 📄 nginx.conf               # Nginx Configuration
│   ├── 📄 package.json             # Dependencies
│   ├── 📄 vite.config.js           # Vite Configuration
│   └── 📄 tailwind.config.js       # Tailwind Configuration
│
├── 📂 backend/                     # Backend Node.js Application
│   ├── 📂 src/
│   │   ├── 📂 controllers/         # Request Handlers
│   │   ├── 📂 services/            # Business Logic Layer
│   │   ├── 📂 models/              # Sequelize ORM Models
│   │   ├── 📂 routes/              # API Route Definitions
│   │   │   ├── 📂 admin/           # Admin routes
│   │   │   ├── 📂 customer/        # Customer routes
│   │   │   └── 📂 public/          # Public routes
│   │   ├── 📂 middlewares/         # Express Middlewares
│   │   ├── 📂 cache/               # Caching Layer
│   │   ├── 📂 config/              # Configuration
│   │   ├── 📂 utils/               # Utility Functions
│   │   ├── 📄 app.js               # Express App Setup
│   │   └── 📄 server.js            # Server Entry Point
│   ├── 📂 migrations/              # Database Migrations
│   ├── 📂 public/uploads/          # Uploaded Files
│   ├── 📄 Dockerfile               # Production Dockerfile
│   ├── 📄 Dockerfile.dev           # Development Dockerfile
│   └── 📄 package.json             # Dependencies
│
└── 📂 ml-recommendation-service/   # ML Python Service
    ├── 📂 api/                     # FastAPI Application
    │   ├── 📄 main.py              # FastAPI Entry Point
    │   ├── 📂 routes/              # API Routes
    │   ├── 📂 schemas/             # Pydantic Schemas
    │   └── 📂 middleware/          # API Middlewares
    ├── 📂 models/                  # ML Models
    │   ├── 📂 content_based/       # Content-Based Filtering
    │   │   ├── 📄 ncb_model.py     # Neural CB Model
    │   │   ├── 📄 product_encoder.py
    │   │   └── 📄 similarity_engine.py
    │   └── 📂 saved_models/        # Trained Model Weights
    ├── 📂 data/                    # Data Processing
    │   ├── 📂 raw/                 # Raw Datasets
    │   ├── 📂 processed/           # Processed Datasets
    │   └── 📂 splits/              # Train/Val/Test Splits
    ├── 📂 training/                # Model Training
    ├── 📂 config/                  # Configuration
    ├── 📄 Dockerfile               # Production Dockerfile
    ├── 📄 Dockerfile.dev           # Development Dockerfile
    └── 📄 requirements.txt         # Python Dependencies
```

---

## 🔧 Detail Setiap Service

### 1️⃣ Frontend Service

#### Deskripsi

Frontend BaleTani adalah Single Page Application (SPA) yang dibangun dengan React dan Vite. Aplikasi ini menyediakan antarmuka untuk dua jenis pengguna: **Customer** dan **Admin**.

#### Fitur Customer

- ✅ Melihat katalog produk dan kategori
- ✅ Pencarian dan filter produk
- ✅ Melihat detail produk dengan rekomendasi
- ✅ Menambah produk ke keranjang
- ✅ Checkout dan tracking pesanan
- ✅ Melihat riwayat pesanan
- ✅ Mengelola profil
- ✅ Melihat FAQ dan mengirim pesan kontak

#### Fitur Admin

- ✅ Dashboard dengan statistik
- ✅ CRUD Produk dan Kategori
- ✅ Manajemen Order (update status, dll)
- ✅ Manajemen Customer
- ✅ Manajemen Diskon
- ✅ Manajemen Procurement (pengadaan)
- ✅ Manajemen FAQ
- ✅ Melihat pesan kontak
- ✅ Manajemen User Admin dan Role/Permission

#### State Management (Zustand)

```
store/
├── store_admin/
│   ├── authStore.js         # Admin authentication state
│   ├── productStore.js      # Products management
│   ├── categoryStore.js     # Categories management
│   ├── orderStore.js        # Orders management
│   └── ...
└── store_customer/
    ├── authStore.js         # Customer authentication state
    ├── cartStore.js         # Shopping cart state
    ├── productStore.js      # Products browsing
    └── ...
```

#### Komponen Utama

| Komponen             | Lokasi                   | Fungsi                         |
| -------------------- | ------------------------ | ------------------------------ |
| `Navbar`             | components/layout/       | Navigasi utama                 |
| `Footer`             | components/layout/       | Footer website                 |
| `ProductCard`        | components/ui/           | Card untuk display produk      |
| `LoginModal`         | components/ui/           | Modal login                    |
| `CartItem`           | components/layout/       | Item di keranjang              |
| `AdminLayout`        | components/layout_admin/ | Layout halaman admin           |
| `AdminSidebar`       | components/layout_admin/ | Sidebar navigasi admin         |
| `ProtectedRoute`     | components/auth/         | Route guard untuk auth         |
| `TokenExpiryChecker` | components/auth/         | Auto logout saat token expired |

---

### 2️⃣ Backend Service

#### Deskripsi

Backend BaleTani adalah REST API server yang dibangun dengan Node.js dan Express. Menggunakan arsitektur layered (Routes → Controllers → Services → Models).

#### Arsitektur Layer

```
┌──────────────────────────────────────────────────────────────┐
│                        ROUTES                                 │
│  Definisi endpoint dan HTTP methods                          │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      MIDDLEWARES                              │
│  - auth.middleware.js (JWT verification)                     │
│  - checkPermission.js (Role-based access)                    │
│  - rateLimiter.middleware.js (Rate limiting)                 │
│  - sanitize.middleware.js (Input sanitization)               │
│  - upload.middleware.js (File upload handling)               │
│  - error.middleware.js (Error handling)                      │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      CONTROLLERS                              │
│  Request handling, validation, response formatting           │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       SERVICES                                │
│  Business logic, data transformation                         │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     CACHE LAYER                               │
│  NodeCache untuk caching frequently accessed data            │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        MODELS                                 │
│  Sequelize ORM models untuk interaksi dengan MySQL           │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        MySQL                                  │
│  Database storage                                            │
└──────────────────────────────────────────────────────────────┘
```

#### Middleware Detail

| Middleware       | File                      | Fungsi                                  |
| ---------------- | ------------------------- | --------------------------------------- |
| **Auth**         | auth.middleware.js        | Verifikasi JWT token, extract user info |
| **Permission**   | checkPermission.js        | Cek permission berdasarkan role admin   |
| **Rate Limiter** | rateLimiter.middleware.js | Batasi jumlah request per IP            |
| **Sanitize**     | sanitize.middleware.js    | Bersihkan input dari XSS                |
| **Upload**       | upload.middleware.js      | Handle file upload dengan Multer        |
| **Error**        | error.middleware.js       | Global error handling                   |

#### Caching Strategy

Backend menggunakan **NodeCache** untuk in-memory caching:

```javascript
// Cache Keys Pattern (cacheKeys.js)
PRODUCTS_LIST: 'products:list',
PRODUCT_DETAIL: (id) => `products:${id}`,
CATEGORIES_LIST: 'categories:list',
DISCOUNTS_ACTIVE: 'discounts:active',
DASHBOARD_STATS: 'dashboard:stats'
```

| Data             | TTL      | Invalidation                       |
| ---------------- | -------- | ---------------------------------- |
| Product List     | 5 menit  | Saat create/update/delete product  |
| Product Detail   | 10 menit | Saat update/delete product         |
| Categories       | 30 menit | Saat create/update/delete category |
| Active Discounts | 5 menit  | Saat update discount               |
| Dashboard Stats  | 2 menit  | Otomatis expire                    |

#### Controller List

| Controller           | Prefix                      | Deskripsi               |
| -------------------- | --------------------------- | ----------------------- |
| adminAuth            | /api/admin/auth             | Login/logout admin      |
| adminProduct         | /api/admin/products         | CRUD produk             |
| adminCategory        | /api/admin/categories       | CRUD kategori           |
| adminOrder           | /api/admin/orders           | Manajemen order         |
| adminCustomer        | /api/admin/customers        | Manajemen customer      |
| adminDiscount        | /api/admin/discounts        | CRUD diskon             |
| adminProcurement     | /api/admin/procurements     | Manajemen pengadaan     |
| adminUser            | /api/admin/users            | Manajemen admin users   |
| adminFaq             | /api/admin/faqs             | CRUD FAQ                |
| adminContact         | /api/admin/contacts         | Lihat pesan kontak      |
| adminDashboard       | /api/admin/dashboard        | Dashboard statistics    |
| adminReport          | /api/admin/reports          | Generate reports        |
| customerAuth         | /api/customer/auth          | Register/login customer |
| customerCart         | /api/customer/cart          | Keranjang belanja       |
| customerOrder        | /api/customer/orders        | Buat pesanan            |
| customerOrderHistory | /api/customer/order-history | Riwayat pesanan         |
| customerProfile      | /api/customer/profile       | Profil customer         |
| customerContact      | /api/customer/contact       | Kirim pesan             |
| publicProduct        | /api/public/products        | List produk (public)    |
| publicCategory       | /api/public/categories      | List kategori (public)  |
| publicDiscount       | /api/public/discounts       | Diskon aktif (public)   |
| publicFaq            | /api/public/faqs            | FAQ (public)            |
| recommendation       | /api/recommendations        | Rekomendasi produk      |

---

### 3️⃣ ML Recommendation Service

#### Deskripsi

Service Python yang menyediakan rekomendasi produk menggunakan model Neural Content-Based (NCB). Service ini berjalan independen dan berkomunikasi dengan Backend via REST API.

#### Arsitektur Model

```
┌──────────────────────────────────────────────────────────────┐
│                    INPUT PRODUCT DATA                         │
│  - name, description, category                               │
│  - price, stock, unit                                        │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   FEATURE EXTRACTION                          │
│  - Text features (TF-IDF dari name + description)            │
│  - Categorical features (one-hot encoding category)          │
│  - Numerical features (normalized price, stock)              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    PRODUCT ENCODER                            │
│  Neural Network Architecture:                                │
│  Input → Dense(256) → ReLU → Dropout                        │
│       → Dense(128) → ReLU → Dropout                         │
│       → Dense(64) → Output (Embedding)                      │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   PRODUCT EMBEDDINGS                          │
│  Vector representation of each product (64 dimensions)       │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   SIMILARITY ENGINE                           │
│  - Cosine Similarity calculation                             │
│  - K-Nearest Neighbors search                                │
│  - Ranking by similarity score                               │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  RECOMMENDED PRODUCTS                         │
│  Top-K similar products with similarity scores               │
└──────────────────────────────────────────────────────────────┘
```

#### Data Pipeline

```
data/raw/                          data/processed/
├── products.csv          ──►      ├── products_features.csv
├── customers.csv         ──►      ├── customer_profiles.csv
└── orders.csv            ──►      └── order_history.csv
                │
                │  data_splitter.py
                ▼
data/splits/
├── train/
│   └── products_train.csv (70%)
├── validation/
│   └── products_val.csv (15%)
└── test/
    └── products_test.csv (15%)
```

#### Training Scripts

| Script            | Deskripsi                                    |
| ----------------- | -------------------------------------------- |
| `train_ncb.py`    | Training NCB model versi 1                   |
| `train_ncb_v2.py` | Training NCB model versi 2 (improved)        |
| `train_ncb_v3.py` | Training NCB model versi 3 (latest)          |
| `evaluate.py`     | Evaluasi model dengan test data              |
| `metrics.py`      | Perhitungan metrics (precision, recall, dll) |

#### Model Versions

| Version | Deskripsi                              | Status            |
| ------- | -------------------------------------- | ----------------- |
| NCB v1  | Initial model                          | ❌ Deprecated     |
| NCB v2  | Improved architecture, better accuracy | ✅ Active         |
| NCB v3  | Experimental                           | 🔄 In development |

---

## 🗄️ Database Schema

### Entity Relationship Diagram (Simplified)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   admins    │       │   roles     │       │ permissions │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ name        │  │    │ name        │  │    │ name        │
│ email       │  │    │ description │  │    │ action      │
│ password    │  │    └─────────────┘  │    │ resource    │
│ role_id(FK) │◀─┘                     │    └─────────────┘
│ is_active   │       ┌────────────────┴────────┐    ▲
└─────────────┘       │  role_permissions       │    │
                      ├────────────────────────┤    │
                      │ role_id (FK)           │────┘
                      │ permission_id (FK)     │────┘
                      └────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  customers  │       │   orders    │       │ order_items │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ name        │  │    │customer_id  │◀─┘    │ order_id(FK)│
│ email       │  │    │ total_amount│       │product_id   │
│ password    │  │    │ status      │       │ quantity    │
│ phone       │  │    │ address     │       │ price       │
│ address     │  │    │ created_at  │       │ subtotal    │
└─────────────┘  │    └─────────────┘       └─────────────┘
      │          │
      ▼          │
┌─────────────┐  │    ┌─────────────┐       ┌─────────────┐
│   carts     │  │    │  products   │◀──────│ categories  │
├─────────────┤  │    ├─────────────┤       ├─────────────┤
│ id (PK)     │  │    │ id (PK)     │       │ id (PK)     │
│customer_id  │◀─┘    │ name        │       │ name        │
│product_id   │───────│ description │       │ description │
│ quantity    │       │ price       │       │ image_url   │
└─────────────┘       │ stock       │       └─────────────┘
                      │category_id  │
                      │ unit        │
                      │ is_active   │
                      └─────────────┘
```

### Daftar Tabel

| Tabel                    | Deskripsi                                             |
| ------------------------ | ----------------------------------------------------- |
| `admins`                 | Data admin pengelola sistem                           |
| `roles`                  | Role/jabatan admin (Super Admin, Manager, Staff, dll) |
| `permissions`            | Daftar permission yang tersedia                       |
| `role_permissions`       | Relasi many-to-many role dan permission               |
| `customers`              | Data customer/pembeli                                 |
| `products`               | Data produk yang dijual                               |
| `product_images`         | Gambar produk (bisa multiple)                         |
| `categories`             | Kategori produk                                       |
| `carts`                  | Keranjang belanja customer                            |
| `orders`                 | Data pesanan                                          |
| `order_items`            | Item dalam pesanan                                    |
| `order_status_histories` | Riwayat perubahan status pesanan                      |
| `payment_details`        | Detail pembayaran pesanan                             |
| `discounts`              | Data diskon/promo                                     |
| `product_discounts`      | Relasi produk dengan diskon                           |
| `stock_movements`        | Riwayat pergerakan stok                               |
| `procurements`           | Data pengadaan barang                                 |
| `procurement_items`      | Item dalam pengadaan                                  |
| `faqs`                   | Frequently Asked Questions                            |
| `contact_messages`       | Pesan dari pengunjung                                 |
| `soft_delete_logs`       | Log data yang di-soft delete                          |

---

## 🔄 Alur Komunikasi

### 1. Customer Melihat Produk dengan Rekomendasi

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Customer │     │ Frontend │     │ Backend  │     │ML Service│
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Buka detail │                │                │
     │    produk      │                │                │
     │───────────────>│                │                │
     │                │ 2. GET /api/   │                │
     │                │    public/     │                │
     │                │    products/123│                │
     │                │───────────────>│                │
     │                │                │ 3. Query MySQL │
     │                │                │                │
     │                │                │ 4. Request to  │
     │                │                │    ML Service  │
     │                │                │───────────────>│
     │                │                │                │ 5. Process
     │                │                │                │    NCB Model
     │                │                │ 6. Return IDs  │
     │                │                │<───────────────│
     │                │                │                │
     │                │ 7. Return      │                │
     │                │    product +   │                │
     │                │    recommendations              │
     │                │<───────────────│                │
     │ 8. Render page │                │                │
     │<───────────────│                │                │
```

### 2. Customer Checkout

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Customer │     │ Frontend │     │ Backend  │     │  MySQL   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Checkout    │                │                │
     │───────────────>│                │                │
     │                │ 2. POST /api/  │                │
     │                │    customer/   │                │
     │                │    orders      │                │
     │                │───────────────>│                │
     │                │                │ 3. Verify JWT  │
     │                │                │ 4. Validate    │
     │                │                │───────────────>│
     │                │                │<───────────────│
     │                │                │ 5. Transaction │
     │                │                │    - Create    │
     │                │                │      order     │
     │                │                │    - Create    │
     │                │                │      items     │
     │                │                │    - Update    │
     │                │                │      stock     │
     │                │                │    - Clear     │
     │                │                │      cart      │
     │                │                │───────────────>│
     │                │                │<───────────────│
     │                │ 6. Return      │                │
     │                │    order       │                │
     │                │<───────────────│                │
     │ 7. Redirect    │                │                │
     │<───────────────│                │                │
```

---

## 📡 API Endpoints

### Public Endpoints (Tanpa Authentication)

| Method | Endpoint                     | Deskripsi               |
| ------ | ---------------------------- | ----------------------- |
| GET    | `/api/public/products`       | List semua produk aktif |
| GET    | `/api/public/products/:id`   | Detail produk           |
| GET    | `/api/public/categories`     | List semua kategori     |
| GET    | `/api/public/categories/:id` | Detail kategori         |
| GET    | `/api/public/discounts`      | List diskon aktif       |
| GET    | `/api/public/faqs`           | List FAQ                |

### Customer Endpoints (Requires Customer JWT)

| Method | Endpoint                           | Deskripsi                 |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/api/customer/auth/register`      | Registrasi customer baru  |
| POST   | `/api/customer/auth/login`         | Login customer            |
| POST   | `/api/customer/auth/logout`        | Logout customer           |
| GET    | `/api/customer/profile`            | Get profile customer      |
| PUT    | `/api/customer/profile`            | Update profile            |
| GET    | `/api/customer/cart`               | Get cart items            |
| POST   | `/api/customer/cart`               | Add item to cart          |
| PUT    | `/api/customer/cart/:id`           | Update cart item quantity |
| DELETE | `/api/customer/cart/:id`           | Remove item from cart     |
| DELETE | `/api/customer/cart`               | Clear cart                |
| POST   | `/api/customer/orders`             | Create new order          |
| GET    | `/api/customer/orders`             | Get customer orders       |
| GET    | `/api/customer/orders/:id`         | Get order detail          |
| POST   | `/api/customer/orders/:id/payment` | Upload payment proof      |
| GET    | `/api/customer/order-history`      | Get order history         |
| POST   | `/api/customer/contact`            | Send contact message      |

### Admin Endpoints (Requires Admin JWT + Permissions)

| Method | Endpoint                       | Permission          | Deskripsi             |
| ------ | ------------------------------ | ------------------- | --------------------- |
| POST   | `/api/admin/auth/login`        | -                   | Login admin           |
| GET    | `/api/admin/dashboard`         | view_dashboard      | Get dashboard stats   |
| GET    | `/api/admin/products`          | view_products       | List products         |
| POST   | `/api/admin/products`          | create_products     | Create product        |
| PUT    | `/api/admin/products/:id`      | edit_products       | Update product        |
| DELETE | `/api/admin/products/:id`      | delete_products     | Delete product        |
| GET    | `/api/admin/categories`        | view_categories     | List categories       |
| POST   | `/api/admin/categories`        | create_categories   | Create category       |
| PUT    | `/api/admin/categories/:id`    | edit_categories     | Update category       |
| DELETE | `/api/admin/categories/:id`    | delete_categories   | Delete category       |
| GET    | `/api/admin/orders`            | view_orders         | List orders           |
| PUT    | `/api/admin/orders/:id/status` | edit_orders         | Update order status   |
| GET    | `/api/admin/customers`         | view_customers      | List customers        |
| GET    | `/api/admin/discounts`         | view_discounts      | List discounts        |
| POST   | `/api/admin/discounts`         | create_discounts    | Create discount       |
| GET    | `/api/admin/procurements`      | view_procurements   | List procurements     |
| POST   | `/api/admin/procurements`      | create_procurements | Create procurement    |
| GET    | `/api/admin/users`             | view_users          | List admin users      |
| POST   | `/api/admin/users`             | create_users        | Create admin user     |
| GET    | `/api/admin/faqs`              | view_faqs           | List FAQs             |
| POST   | `/api/admin/faqs`              | create_faqs         | Create FAQ            |
| GET    | `/api/admin/contacts`          | view_contacts       | List contact messages |
| GET    | `/api/admin/reports`           | view_reports        | Generate reports      |

### Recommendation Endpoints

| Method | Endpoint                                    | Deskripsi                                                 |
| ------ | ------------------------------------------- | --------------------------------------------------------- |
| GET    | `/api/recommendations/similar/:productId`   | Get similar products berdasarkan product                  |
| POST   | `/api/recommendations/bundle`               | Get bundle recommendations untuk multiple products (cart) |
| GET    | `/api/recommendations/trending`             | Get trending products                                     |
| GET    | `/api/recommendations/category/:categoryId` | Get top products dari kategori tertentu                   |
| GET    | `/api/recommendations/health`               | Health check ML service (Admin only)                      |
| POST   | `/api/recommendations/track`                | Track recommendation analytics (Authenticated)            |

---

## 🤖 Sistem Rekomendasi ML

### Overview

Sistem rekomendasi BaleTani menggunakan **Neural Content-Based (NCB)** model yang menganalisis fitur-fitur produk untuk menemukan produk yang mirip.

### Cara Kerja

1. **Feature Extraction**

   - Text features: Nama dan deskripsi produk di-encode menggunakan TF-IDF
   - Categorical features: Kategori produk di-encode dengan one-hot encoding
   - Numerical features: Harga dan stok di-normalize

2. **Product Encoding**

   - Neural network menerima gabungan semua features
   - Output: Vector embedding 64 dimensi untuk setiap produk

3. **Similarity Calculation**

   - Cosine similarity antara embedding produk target dan semua produk lain
   - Hasil di-rank berdasarkan similarity score

4. **Recommendation Generation**
   - Return Top-K produk dengan similarity tertinggi
   - Filter produk yang out of stock atau inactive

### Model Architecture

```
Input Layer (combined features)
        │
        ▼
Dense Layer (256 units, ReLU)
        │
        ▼
Dropout (0.3)
        │
        ▼
Dense Layer (128 units, ReLU)
        │
        ▼
Dropout (0.3)
        │
        ▼
Dense Layer (64 units, Linear)
        │
        ▼
Output: Product Embedding (64-dim vector)
```

### Training Data

| Dataset                    | Jumlah | Deskripsi                     |
| -------------------------- | ------ | ----------------------------- |
| products.csv               | 57     | Data produk asli              |
| products_500_training.csv  | 500    | Data augmented untuk training |
| products_1000_balanced.csv | 1000   | Data balanced per kategori    |

---

## ⚙️ Environment Variables

### Frontend (.env)

```env
# API Configuration
VITE_API_BASE_URL=http://<backend-host>:5000/api
VITE_STATIC_BASE_URL=http://<backend-host>:5000

# App Configuration
VITE_APP_NAME="BaleTani Fresh Market"
VITE_APP_DESCRIPTION="Dari kebun ke Balé, dari Balé ke rumahmu"

# WhatsApp Configuration
VITE_WHATSAPP_NUMBER=6287735517999

# Social Media
VITE_INSTAGRAM_URL=https://instagram.com/baletani
VITE_FACEBOOK_URL=https://facebook.com/baletani
```

> **Development:** Ganti `<backend-host>` dengan `localhost` atau `127.0.0.1`  
> **Production:** Ganti dengan domain/IP server backend Anda

### Backend (.env)

```env
# Application Environment
NODE_ENV=development
PORT=5000

# Database Configuration (MySQL)
DB_HOST=<mysql-host>
DB_PORT=3306
DB_NAME=baletani_db
DB_USER=root
DB_PASSWORD=<your-password>

# JWT Configuration
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_CUSTOMER_URL=http://<frontend-host>:5173
FRONTEND_ADMIN_URL=http://<frontend-host>:5174

# WhatsApp Configuration
WHATSAPP_ADMIN_PHONE=6287735517999

# AI Recommendation Service
ML_SERVICE_URL=http://<ml-service-host>:8000

# Logging
LOG_LEVEL=debug
```

> **Development:** Ganti semua `<host>` dengan `localhost` atau `127.0.0.1`  
> **Production:** Ganti dengan domain/IP masing-masing service

### ML Service (.env)

```env
# Application Settings
APP_NAME="BaleTani ML Recommendation Service"
APP_VERSION="1.0.0"
ENVIRONMENT="development"
DEBUG=True
LOG_LEVEL="INFO"

# API Settings
API_HOST="0.0.0.0"
API_PORT=8000
API_PREFIX="/v1"
API_KEY="<your-api-key>"

# Data Source
DATA_SOURCE="csv"  # csv | mysql
CSV_DATA_PATH="./data/raw"

# MySQL Database (untuk production)
MYSQL_HOST="<mysql-host>"
MYSQL_PORT=3306
MYSQL_USER="<db-user>"
MYSQL_PASSWORD="<db-password>"
MYSQL_DATABASE="baletani_db"

# Redis Cache (optional)
# REDIS_HOST="<redis-host>"
# REDIS_PORT=6379
# REDIS_DB=0

# Model Configuration
MODEL_VERSION="v2"
MODEL_PATH="./models/saved_models/ncb_v2"
```

> **Development:** Ganti `<host>` dengan `localhost` atau `127.0.0.1`  
> **Production:** Ganti dengan domain/IP server yang sesuai

---

## 🚀 Cara Menjalankan

### Prerequisites

- ✅ Node.js 18.x atau lebih tinggi
- ✅ Python 3.10 atau lebih tinggi
- ✅ MySQL 8.0 atau lebih tinggi
- ✅ npm atau yarn
- ✅ pip

### 1️⃣ Setup Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE baletani_db;

# Exit
exit
```

### 2️⃣ Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env sesuai konfigurasi lokal

# Jalankan server development
npm run dev

# Backend berjalan di port 5000
# Akses via: http://localhost:5000 (development)
# atau http://<your-ip>:5000 (network access)
```

### 3️⃣ Setup ML Service

```bash
# Masuk ke folder ml-recommendation-service
cd ml-recommendation-service

# Buat virtual environment
python -m venv venv

# Aktivasi virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Jalankan server
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# ML Service berjalan di port 8000
# Akses via: http://localhost:8000 (development)
# atau http://<your-ip>:8000 (network access)
# Dokumentasi: http://<host>:8000/docs
```

### 4️⃣ Setup Frontend

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Jalankan development server
npm run dev

# Frontend berjalan di port 5173
# Akses via: http://localhost:5173 (development)
# atau http://<your-ip>:5173 (network access)
```

### 5️⃣ Akses Aplikasi

| Service                 | Port | Path          | Development URL                    |
| ----------------------- | ---- | ------------- | ---------------------------------- |
| 🌐 Frontend Customer    | 5173 | `/`           | `http://localhost:5173`            |
| 🔐 Frontend Admin       | 5173 | `/admin`      | `http://localhost:5173/admin`      |
| 🔌 Backend API          | 5000 | `/api`        | `http://localhost:5000`            |
| 💚 Backend Health Check | 5000 | `/api/health` | `http://localhost:5000/api/health` |
| 🤖 ML Service API       | 8000 | `/v1`         | `http://localhost:8000`            |
| 📖 ML Service Docs      | 8000 | `/docs`       | `http://localhost:8000/docs`       |
| 📊 ML Service Health    | 8000 | `/health`     | `http://localhost:8000/health`     |

> **Catatan:**
>
> - Frontend adalah single application dengan routing terpisah untuk Customer dan Admin
> - Development: URL di atas menggunakan `localhost`
> - Production: Ganti `localhost` dengan domain/IP server Anda
> - Network Access: Ganti dengan IP komputer (misal: `192.168.x.x:port`)
> - Gunakan reverse proxy (Nginx) untuk production deployment

---

## 🐳 Docker Deployment

### Menggunakan Docker Compose

```bash
# Build dan jalankan semua services
docker-compose up -d

# Atau untuk development
docker-compose -f docker-compose.dev.yml up -d

# Lihat logs
docker-compose logs -f

# Stop semua services
docker-compose down
```

### Docker Compose Architecture

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=mysql
      - PORT=5000
    depends_on:
      - mysql

  ml-service:
    build: ./ml-recommendation-service
    ports:
      - "8000:8000"
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## � Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT ENVIRONMENT                                 │
│                                                                                 │
│   ┌────────────────────────────────────────────────────────────────────────┐   │
│   │                         LOCAL MACHINE                                   │   │
│   │                                                                         │   │
│   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌───────────┐  │   │
│   │   │   Vite      │   │   Nodemon   │   │   Uvicorn   │   │   MySQL   │  │   │
│   │   │   Dev Server│   │   + Express │   │   + FastAPI │   │   Server  │  │   │
│   │   │   :5173     │   │   :5000     │   │   :8000     │   │   :3306   │  │   │
│   │   │             │   │             │   │             │   │           │  │   │
│   │   │   HMR ✓     │   │   Hot Reload│   │   --reload  │   │   Docker/ │  │   │
│   │   │   Fast Build│   │   Watch Mode│   │   Watch Mode│   │   Local   │  │   │
│   │   └─────────────┘   └─────────────┘   └─────────────┘   └───────────┘  │   │
│   │          │                 │                 │               │         │   │
│   │          └─────────────────┴─────────────────┴───────────────┘         │   │
│   │                              │                                          │   │
│   │                              ▼                                          │   │
│   │                    ┌─────────────────────┐                              │   │
│   │                    │    Browser          │                              │   │
│   │                    │  http://localhost   │                              │   │
│   │                    │    :5173            │                              │   │
│   │                    └─────────────────────┘                              │   │
│   └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   Tools:                                                                        │
│   • VS Code + Extensions (Prettier, ESLint, Tailwind IntelliSense)              │
│   • Docker Desktop (optional untuk MySQL)                                       │
│   • Postman/Thunder Client untuk API testing                                    │
│   • MySQL Workbench untuk database management                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Production Environment (Docker)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                                   │
│                                                                                 │
│   ┌────────────────────────────────────────────────────────────────────────┐   │
│   │                           SERVER / VPS                                  │   │
│   │                                                                         │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐  │   │
│   │   │                      DOCKER NETWORK                              │  │   │
│   │   │                     (baletani-network)                           │  │   │
│   │   │                                                                  │  │   │
│   │   │                  ┌─────────────────┐                             │  │   │
│   │   │                  │  NGINX REVERSE  │                             │  │   │
│   │   │                  │     PROXY       │                             │  │   │
│   │   │                  │   :80 / :443    │                             │  │   │
│   │   │                  │                 │                             │  │   │
│   │   │                  │  • SSL/TLS      │                             │  │   │
│   │   │                  │  • Load Balance │                             │  │   │
│   │   │                  │  • Gzip         │                             │  │   │
│   │   │                  │  • Static Files │                             │  │   │
│   │   │                  └────────┬────────┘                             │  │   │
│   │   │         ┌────────────────┬┴───────────────┬──────────────────┐   │  │   │
│   │   │         │                │                │                  │   │  │   │
│   │   │         ▼                ▼                ▼                  │   │  │   │
│   │   │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │   │  │   │
│   │   │  │ FRONTEND   │  │ BACKEND    │  │    ML SERVICE      │     │   │  │   │
│   │   │  │ CONTAINER  │  │ CONTAINER  │  │    CONTAINER       │     │   │  │   │
│   │   │  │            │  │            │  │                    │     │   │  │   │
│   │   │  │ nginx:alpine│ │ node:18    │  │ python:3.11-slim   │     │   │  │   │
│   │   │  │ + React    │  │ + Express  │  │ + FastAPI          │     │   │  │   │
│   │   │  │ Build      │  │            │  │ + TensorFlow       │     │   │  │   │
│   │   │  │            │  │            │  │                    │     │   │  │   │
│   │   │  │ :80        │  │ :5000      │  │ :8000              │     │   │  │   │
│   │   │  └────────────┘  └─────┬──────┘  └─────────┬──────────┘     │   │  │   │
│   │   │                        │                   │                 │   │  │   │
│   │   │                        └─────────┬─────────┘                 │   │  │   │
│   │   │                                  │                           │   │  │   │
│   │   │                                  ▼                           │   │  │   │
│   │   │                        ┌─────────────────┐                   │   │  │   │
│   │   │                        │     MYSQL       │                   │   │  │   │
│   │   │                        │   CONTAINER     │                   │   │  │   │
│   │   │                        │                 │                   │   │  │   │
│   │   │                        │  mysql:8.0      │                   │   │  │   │
│   │   │                        │  :3306          │                   │   │  │   │
│   │   │                        │                 │                   │   │  │   │
│   │   │                        └─────────────────┘                   │   │  │   │
│   │   │                               │                              │   │  │   │
│   │   │                               ▼                              │   │  │   │
│   │   │                     ┌─────────────────────┐                  │   │  │   │
│   │   │                     │   DOCKER VOLUME     │                  │   │  │   │
│   │   │                     │    mysql_data       │                  │   │  │   │
│   │   │                     │   (Persistent Data) │                  │   │  │   │
│   │   │                     └─────────────────────┘                  │   │  │   │
│   │   │                                                              │   │  │   │
│   │   └──────────────────────────────────────────────────────────────┘   │  │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   Deployment Commands:                                                          │
│   • docker compose up -d                      # Start all services              │
│   • docker compose -f docker-compose.dev.yml up  # Development mode             │
│   • docker compose logs -f backend            # View backend logs               │
│   • docker compose exec backend npm run migrate  # Run migrations               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Cloud Deployment (Optional)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     CLOUD DEPLOYMENT ARCHITECTURE                               │
│                                                                                 │
│                          ┌─────────────────────┐                                │
│                          │     DNS PROVIDER    │                                │
│                          │  (Cloudflare/Route53)│                               │
│                          │                     │                                │
│                          │  baletani.com       │                                │
│                          │  api.baletani.com   │                                │
│                          │  ml.baletani.com    │                                │
│                          └──────────┬──────────┘                                │
│                                     │                                           │
│                                     ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                            CDN (Optional)                                │   │
│   │                        (Cloudflare / AWS CloudFront)                     │   │
│   │                                                                          │   │
│   │   • Cache static assets (JS, CSS, images)                                │   │
│   │   • DDoS protection                                                      │   │
│   │   • Edge locations untuk latency rendah                                  │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │                                        │
│                                        ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                       LOAD BALANCER                                      │   │
│   │                 (AWS ALB / GCP Load Balancer / Nginx)                    │   │
│   │                                                                          │   │
│   │   • SSL Termination                                                      │   │
│   │   • Health checks                                                        │   │
│   │   • Auto-scaling trigger                                                 │   │
│   └───────────────┬───────────────────┬─────────────────────┬───────────────┘   │
│                   │                   │                     │                   │
│         ┌─────────┴─────────┐ ┌───────┴───────┐ ┌──────────┴──────────┐         │
│         │                   │ │               │ │                     │         │
│         ▼                   ▼ ▼               ▼ ▼                     ▼         │
│   ┌───────────────┐   ┌───────────────┐   ┌────────────────────────────┐        │
│   │   FRONTEND    │   │   BACKEND     │   │        ML SERVICE          │        │
│   │   HOSTING     │   │   SERVERS     │   │         SERVERS            │        │
│   │               │   │               │   │                            │        │
│   │  Options:     │   │  Options:     │   │  Options:                  │        │
│   │  • Vercel     │   │  • AWS EC2    │   │  • AWS EC2 (GPU optional)  │        │
│   │  • Netlify    │   │  • GCP GCE    │   │  • GCP Compute Engine      │        │
│   │  • AWS S3+CF  │   │  • DigitalOcean│  │  • AWS Lambda + API GW     │        │
│   │  • Firebase   │   │  • Heroku     │   │  • GCP Cloud Run           │        │
│   │    Hosting    │   │  • Railway    │   │                            │        │
│   └───────────────┘   └───────┬───────┘   └────────────────────────────┘        │
│                               │                                                  │
│                               ▼                                                  │
│                     ┌─────────────────────┐                                     │
│                     │   MANAGED DATABASE  │                                     │
│                     │                     │                                     │
│                     │  Options:           │                                     │
│                     │  • AWS RDS (MySQL)  │                                     │
│                     │  • GCP Cloud SQL    │                                     │
│                     │  • PlanetScale      │                                     │
│                     │  • DigitalOcean DB  │                                     │
│                     │                     │                                     │
│                     │  Features:          │                                     │
│                     │  • Auto backup      │                                     │
│                     │  • Read replicas    │                                     │
│                     │  • Auto failover    │                                     │
│                     └─────────────────────┘                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## �📝 Catatan Tambahan

### Security Features

- ✅ JWT Authentication dengan expiry
- ✅ Password hashing dengan bcrypt
- ✅ Rate limiting untuk mencegah brute force
- ✅ Input validation dengan express-validator
- ✅ Security headers dengan Helmet
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration
- ✅ SQL Injection protection (Sequelize ORM)
- ✅ Timezone handling (WIB +07:00)

### Performance Optimization

- ✅ In-memory caching dengan NodeCache
- ✅ Database connection pooling (max 100 connections)
- ✅ Database indexing
- ✅ Lazy loading untuk images
- ✅ Pagination untuk list data
- ✅ Optimized SQL queries dengan caching

### Monitoring & Logging

- ✅ Request logging dengan SQL query logging
- ✅ Error logging
- ✅ Health check endpoints (/api/health)
- ✅ Cache statistics
- ✅ Enhanced logging dengan Loguru (ML Service)

---

## 🔍 Informasi Tambahan

### Scripts yang Tersedia

**Backend:**

```bash
npm start           # Production mode
npm run dev         # Development mode dengan nodemon
npm run migrate     # Jalankan database migrations
npm run seed        # Seed semua data
npm run seed:admin  # Seed admin saja
npm run seed:roles  # Seed roles
npm run setup:rbac  # Setup Role-Based Access Control
```

**Frontend:**

```bash
npm run dev         # Development mode
npm run build       # Build untuk production
npm run preview     # Preview production build
npm run lint        # Lint code
```

**ML Service:**

```bash
# Training models
python training/train_ncb.py        # Train NCB v1
python training/train_ncb_v2.py     # Train NCB v2
python training/train_ncb_v3.py     # Train NCB v3
python training/evaluate.py         # Evaluate model

# Run service
uvicorn api.main:app --reload       # Development
uvicorn api.main:app --host 0.0.0.0 --port 8000 --workers 4  # Production
```

### Koneksi Database

**MySQL Configuration:**

- Pool Size: 20-100 connections
- Connection timeout: 120 seconds (2 menit)
- Idle timeout: 30 seconds
- Auto reconnect: Enabled
- Timezone: WIB (+07:00)

### File Upload

- **Maximum file size:** 5MB (5242880 bytes)
- **Upload path:** `backend/public/uploads/`
  - Products: `public/uploads/products/`
  - Categories: `public/uploads/categories/`
- **Supported formats:** JPG, JPEG, PNG, GIF

### Cache Strategy

**Backend NodeCache:**

- TTL Default: 5 menit (300 detik)
- Check period: 60 detik
- Products List: 5 menit
- Product Detail: 10 menit
- Categories: 30 menit
- Dashboard Stats: 2 menit

**ML Service (Redis - Optional):**

- Recommendations: 15 menit
- Product embeddings: 1 jam

---

## 👥 Tim Pengembang

**BaleTani Development Team**

---

## 📄 License

Copyright © 2024-2026 BaleTani. All rights reserved.
