const mysql = require("mysql2");

// Railway public MySQL port is 21874
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // turntable.proxy.rlwy.net
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASS,   // Railway password
  database: process.env.DB_NAME,   // railway
  port: 21874,                     // add this line!
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: use promise wrapper for async/await
const db = pool.promise();

module.exports = db;
