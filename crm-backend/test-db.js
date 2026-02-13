// test-db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "shortline.proxy.rlwy.net",  // Railway public host
  user: "root",
  password: "pGmONsfGQYAJkEsrPlCgneqUGtgcDfST",
  database: "railway",
  port: 37667, // public port for your Railway DB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Connection failed:", err);
  } else {
    console.log("✅ Connected successfully!");
    conn.release();
  }
});
