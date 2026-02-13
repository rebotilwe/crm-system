const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
});

const db = pool.promise();

// Test connection
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
