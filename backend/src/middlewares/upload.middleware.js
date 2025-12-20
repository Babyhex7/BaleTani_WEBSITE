const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories if not exists
const productUploadDir = path.join(__dirname, "../../public/uploads/products");
const categoryUploadDir = path.join(__dirname, "../../public/uploads/categories");

// Ensure directories exist
[productUploadDir, categoryUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// Configure storage for categories
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoryUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, `category-${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images (exclude SVG for security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const blockedTypes = /svg/; // Block SVG (XSS vector)

  const ext = path.extname(file.originalname).toLowerCase();
  const extname = allowedTypes.test(ext);
  const mimetype = allowedTypes.test(file.mimetype);

  // Explicitly block SVG
  if (blockedTypes.test(ext) || file.mimetype === "image/svg+xml") {
    return cb(
      new Error("File SVG tidak diperbolehkan karena alasan keamanan"),
      false
    );
  }

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (JPEG, JPG, PNG, WEBP, GIF) yang diperbolehkan"
      ),
      false
    );
  }
};

// Configure multer for products
const uploadProduct = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

// Configure multer for categories (single image)
const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for category images
    files: 1, // Only 1 image per category
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Ukuran file terlalu besar. Maksimal 5MB per file.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Terlalu banyak file. Maksimal 5 file.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

module.exports = {
  upload: uploadProduct, // backward compatibility
  uploadProduct,
  uploadCategory,
  handleMulterError,
};
