Gunakan arsitektur layered (controller, service, repository).
Gunakan Gin sebagai HTTP handler, GORM untuk database MySQL.Semua request harus divalidasi dengan validator.
Gunakan DTO untuk request dan response, jangan expose model langsung.
Implement JWT authentication dengan refresh token di database.
Controller harus tipis, semua logic di service.
Repository hanya untuk akses database.
Pastikan clean, modular, dan scalable.