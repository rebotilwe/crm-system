// crm-backend/db.js
const mysql = require("mysql2");
require("dotenv").config();

console.log("🔧 Attempting to connect with:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
// Don't log the password for security

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // Add SSL for Railway's internal connection
  ssl: {
    rejectUnauthorized: false
  }
});

const db = pool.promise();

pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
  } else {
    console.log("✅ Database connected successfully!!!");
    conn.release();
  }
});

// Add pool error handler
pool.on('error', (err) => {
  console.error('⚠️ Database pool error:', err);
});

module.exports = db;