# PRODUCTION READINESS CHECKLIST - BaleTani Fresh Market

## ✅ Completed Tasks

### 1. Environment Configuration
- [x] Created `.env.example` for development reference
- [x] Created `.env.production` template for production deployment
- [x] Separated frontend environment variables for dev and production
- [x] Documented all environment variables with comments

### 2. Security Enhancements
- [x] Generated secure JWT secret (128 characters)
- [x] Replaced dummy JWT token with cryptographically secure secret
- [x] Created script to generate JWT secrets: `backend/scripts/generateJwtSecret.js`
- [x] Updated backend `.env` with new secure JWT secret

### 3. Code Cleanup
- [x] Removed unnecessary console.log from critical backend files
- [x] Cleaned up emoji from server logs (kept professional logging)
- [x] Updated logger implementation in server.js
- [x] Removed debug logs from orderAutoCancelCron service
- [x] Cleaned console.log from frontend OrderSuccessPage
- [x] Kept only error logging where necessary

### 4. Image Upload System
- [x] Added `category_image` field to Category model
- [x] Created SQL migration: `add_category_image_field.sql`
- [x] Updated upload middleware to support category images
- [x] Separated upload directories for products and categories
- [x] Added image upload to category create/update API endpoints
- [x] Added endpoint to delete category image: `DELETE /api/admin/categories/:id/image`
- [x] Updated Category controller with image handling
- [x] Updated Category routes with multer middleware

### 5. Frontend Updates
- [x] Updated CategoryFormModal to support image upload
- [x] Added image preview and remove functionality
- [x] Updated CategoryManagement page to handle FormData
- [x] Updated customer CategoryPage to display category images
- [x] Fallback to icon if no image available
- [x] Updated public category controller to return category images

## 📋 Pre-Deployment Steps

### Database Migration
```bash
# Run this SQL migration on production database
mysql -u username -p database_name < backend/migrations/add_category_image_field.sql
```

### Environment Setup
1. Copy `.env.production` to `.env` on production server
2. Update all placeholder values:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET` (generate new one using `node scripts/generateJwtSecret.js`)
   - `FRONTEND_CUSTOMER_URL`, `FRONTEND_ADMIN_URL`
   - Any other service URLs

3. Frontend environment:
   - Copy `frontend/.env.production` to `frontend/.env`
   - Update `VITE_API_BASE_URL` with production API URL
   - Update `VITE_STATIC_BASE_URL` with production static URL

### Build Commands
```bash
# Backend
cd backend
npm install --production
npm run start

# Frontend
cd frontend
npm install
npm run build
```

### Directory Permissions
Ensure upload directories exist and have proper permissions:
```bash
mkdir -p backend/public/uploads/products
mkdir -p backend/public/uploads/categories
chmod 755 backend/public/uploads/products
chmod 755 backend/public/uploads/categories
```

## 🔐 Security Checklist

- [x] JWT secret is strong and unique
- [x] No sensitive data in console.log
- [x] File upload validation (type, size)
- [x] SQL injection protection (using Sequelize ORM)
- [x] XSS protection (SVG files blocked in uploads)
- [ ] HTTPS enabled in production
- [ ] CORS properly configured for production domains
- [ ] Rate limiting implemented
- [ ] Request size limits configured

## 📝 Important Notes

### JWT Secret
- Development JWT: Updated with secure random string
- Production JWT: **MUST** be different from development
- Generate using: `node backend/scripts/generateJwtSecret.js`

### Category Images
- Maximum file size: 2MB
- Supported formats: JPEG, JPG, PNG, WebP
- Images stored in: `backend/public/uploads/categories/`
- Accessible via: `http://your-domain/uploads/categories/filename.jpg`

### Console Logging
- Production: Only error logs are shown
- Development: Info and debug logs available
- Use logger utility: `backend/src/utils/logger.js`

### Cache Invalidation
- Category create/update/delete automatically clears cache
- Ensures customers see updated category images immediately

## 🧪 Testing Checklist

### Backend API
- [ ] Test category creation with image upload
- [ ] Test category update with image replacement
- [ ] Test category delete (image file should be removed)
- [ ] Test category image delete endpoint
- [ ] Verify JWT authentication works with new secret
- [ ] Test file upload limits (size, type)
- [ ] Test error handling for invalid uploads

### Frontend
- [ ] Test admin category creation with image
- [ ] Test admin category update/edit with image
- [ ] Test image preview before upload
- [ ] Test image removal functionality
- [ ] Verify customer page displays category images
- [ ] Verify fallback to icons when no image
- [ ] Test responsive design with images

### Integration
- [ ] Backend restarts successfully with new JWT secret
- [ ] Frontend builds without errors
- [ ] Static file serving works correctly
- [ ] Upload directories have correct permissions
- [ ] Cache invalidation works properly

## 🚀 Deployment Commands

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Deploy dist folder to static hosting or serve via backend
```

### Start Production Server
```bash
# Backend
cd backend
NODE_ENV=production npm start
```

### Using PM2 (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start application
cd backend
pm2 start src/server.js --name baletani-api --env production

# Monitor
pm2 monit

# Save process list
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

## 📞 Support & Maintenance

### Logs Location
- Backend logs: Check console or configure file logging
- PM2 logs: `pm2 logs baletani-api`

### Common Issues
1. **Images not showing**: Check VITE_STATIC_BASE_URL in frontend
2. **Upload fails**: Check directory permissions
3. **JWT errors**: Verify JWT_SECRET is set correctly
4. **CORS errors**: Update CORS URLs in backend .env

---

**Last Updated**: December 18, 2025
**Version**: 1.0.0
**Status**: Ready for Production Testing
