const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",  // Railway private networking
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || "railway",
  port: parseInt(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000
});

const db = pool.promise();

// Test connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully via private network!");
    console.log(`📍 Connected to: ${process.env.DB_HOST || 'mysql'}:${process.env.DB_PORT || 3306}`);
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:");
    console.error(`Error: ${err.message}`);
    console.error(`Code: ${err.code}`);
  }
})();

module.exports = db;