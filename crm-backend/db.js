const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // From .env (Railway MYSQLHOST)
  user: process.env.DB_USER,      // From .env (Railway MYSQLUSER)
  password: process.env.DB_PASS,  // From .env (Railway MYSQLPASSWORD)
  database: process.env.DB_NAME,  // From .env (Railway MYSQL_DATABASE)
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // 10 seconds timeout
});

// Promisified pool for async/await
const db = pool.promise();

// Test connection
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Errno:", err.errno);
    console.error("Syscall:", err.syscall);
  } else {
    console.log("✅ Database connected successfully!");
    conn.release();
  }
});

module.exports = db;
