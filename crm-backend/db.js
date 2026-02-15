// db.js
const mysql = require("mysql2");
require("dotenv").config();

// Create a MySQL connection pool using env variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // DB host from .env
  user: process.env.DB_USER,       // DB user from .env
  password: process.env.DB_PASS,   // DB password from .env
  database: process.env.DB_NAME,   // DB name from .env
  port: Number(process.env.DB_PORT) || 3306, // DB port from .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // 10 seconds
});

// Promisified pool for async/await queries
const db = pool.promise();

// Test the connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
  } else {
    console.log("✅ Database connected successfully!");
    conn.release();
  }
});

module.exports = db;
