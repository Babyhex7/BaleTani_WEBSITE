// Set environment variables manually
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'baletani_db';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
process.env.JWT_EXPIRES_IN = '7d';
process.env.FRONTEND_CUSTOMER_URL = 'http://localhost:5173';
process.env.FRONTEND_ADMIN_URL = 'http://localhost:5174';

// Now start the server
require('./src/server.js');