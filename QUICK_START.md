# BaleTani Fresh Market - Quick Start Guide

## 🚀 Quick Start for Development

### Prerequisites
- Node.js >= 14.x
- MySQL >= 5.7
- npm or yarn

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd BaleTani_WEBSITE

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE baletani_db;
exit;

# Run migrations (if needed)
cd backend
mysql -u root -p baletani_db < migrations/add_category_image_field.sql
```

### 3. Environment Configuration

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and update:
# - Database credentials
# - Generate JWT secret: node scripts/generateJwtSecret.js

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env if needed (default values should work for local dev)
```

### 4. Generate JWT Secret

```bash
cd backend
node scripts/generateJwtSecret.js
# Copy the generated secret to your .env file
```

### 5. Run Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev
# Backend running on http://localhost:5000

# Frontend Customer (Terminal 2)
cd frontend
npm run dev
# Customer site running on http://localhost:5173

# Frontend Admin (Terminal 3 - if separate)
cd frontend
npm run dev:admin
# Admin site running on http://localhost:5174
```

### 6. Access the Application

- **Customer Site**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📝 Default Credentials

### Admin Login
```
Email: admin@baletani.com
Password: (check with your team)
```

## 🔧 Common Commands

### Backend
```bash
npm run dev          # Development mode with nodemon
npm start           # Production mode
npm run migrate     # Run database migrations
```

### Frontend
```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
```

## 📂 Project Structure

```
BaleTani_WEBSITE/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, app config
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, upload, etc.
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── public/uploads/     # Uploaded files
│   ├── migrations/         # SQL migrations
│   └── scripts/            # Utility scripts
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
└── docs/                   # Documentation

```

## 🆕 New Features (Latest Update)

### Category Image Upload
Categories now support image upload instead of just icons:

1. **Admin Panel**:
   - Create/Edit category with image upload
   - Max file size: 2MB
   - Supported formats: JPG, PNG, WebP
   - Preview before upload
   - Delete image separately from category

2. **Customer Side**:
   - Categories display uploaded images
   - Fallback to icon if no image
   - Responsive image display

### Security Updates
- ✅ Secure JWT secret (no more dummy tokens)
- ✅ Cleaned up console.log (production-ready)
- ✅ Proper environment separation

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Database Connection Failed
1. Check MySQL is running
2. Verify credentials in `backend/.env`
3. Ensure database exists

### Images Not Showing
1. Check `VITE_STATIC_BASE_URL` in frontend `.env`
2. Verify upload directories exist and have proper permissions
3. Check browser console for CORS errors

### JWT Errors
1. Ensure JWT_SECRET is set in `backend/.env`
2. Generate new secret: `node backend/scripts/generateJwtSecret.js`
3. Restart backend server

## 📚 Additional Documentation

- `PRODUCTION_READINESS.md` - Production deployment guide
- `API_DOCUMENTATION.md` - API endpoints documentation
- `docs/` - Detailed feature documentation

## 💡 Tips

1. **First Time Setup**: Run database migrations before starting
2. **Development**: Use `npm run dev` for hot reload
3. **Testing**: Check `/api/health` endpoint to verify backend
4. **Uploads**: Create upload directories if they don't exist
5. **Cache**: Clear browser cache if images don't update

## 🆘 Need Help?

- Check documentation in `docs/` folder
- Review error logs in terminal
- Verify environment variables are set correctly
- Ensure all dependencies are installed

---

**Happy Coding! 🚀**
