require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const { parse } = require("csv-parse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =====================
   Middleware: Verify Token
===================== */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

/* =====================
   Routes
===================== */

// Root
app.get("/", (req, res) => {
  res.send("CRM API is live and running 🚀");
});

// Test DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "Database connected ✅", data: rows });
  } catch (err) {
    res.status(500).json({ message: "DB connection failed", error: err.message });
  }
});

/* =====================
   Auth
===================== */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const sql = `
      SELECT * FROM users 
      WHERE email = ? 
      AND role IN ('super_admin','admin','controller')
    `;

    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =====================
   Clients (PROTECTED)
===================== */

// Add client
app.post("/api/clients", verifyToken, async (req, res) => {
  const {
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements,
  } = req.body;

  const sql = `
    INSERT INTO clients 
    (business_name, owner_name, owner_phone, landline, owner_email,
     physical_address, postal_address, security_complement, additional_requirements)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [
      business_name,
      owner_name,
      owner_phone,
      landline,
      owner_email,
      physical_address,
      postal_address,
      security_complement,
      additional_requirements,
    ]);

    res.json({
      message: "Client added successfully",
      id: result.insertId,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all clients / search
app.get("/api/clients", verifyToken, async (req, res) => {
  const search = req.query.search;

  let sql = "SELECT * FROM clients";
  const params = [];

  if (search) {
    sql += `
      WHERE business_name LIKE ?
      OR owner_name LIKE ?
      OR owner_phone LIKE ?
      OR landline LIKE ?
    `;

    const value = `%${search}%`;
    params.push(value, value, value, value);
  }

  try {
    const [results] = await db.query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Update client
app.put("/api/clients/:id", verifyToken, async (req, res) => {
  const {
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements,
  } = req.body;

  try {
    const sql = `
      UPDATE clients SET
        business_name = ?,
        owner_name = ?,
        owner_phone = ?,
        landline = ?,
        owner_email = ?,
        physical_address = ?,
        postal_address = ?,
        security_complement = ?,
        additional_requirements = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [
      business_name,
      owner_name,
      owner_phone,
      landline,
      owner_email,
      physical_address,
      postal_address,
      security_complement,
      additional_requirements,
      req.params.id,
    ]);
     console.log("PUT affected rows:", result.affectedRows); // ✅ Add this

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Get single client
app.get("/api/clients/:id", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM clients WHERE id = ?",
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(results[0]);

  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete client
app.delete("/api/clients/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM clients WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload CSV
app.post(
  "/api/clients/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const fileContent = fs.readFileSync(req.file.path);

      parse(fileContent, { columns: true, trim: true }, async (err, records) => {

        if (err) throw err;

        const validRecords = records.filter(
          r => r.business_name && r.owner_name
        );

        if (validRecords.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: "No valid data found" });
        }

        const sql = `
          INSERT INTO clients
          (business_name, owner_name, owner_phone, landline, owner_email,
           physical_address, postal_address, security_complement, additional_requirements)
          VALUES ?
        `;

        const values = validRecords.map(c => [
          c.business_name,
          c.owner_name,
          c.owner_phone,
          c.landline || "",
          c.owner_email || "",
          c.physical_address || "",
          c.postal_address || "",
          c.security_complement || "",
          c.additional_requirements || "",
        ]);

        await db.query(sql, [values]);

        fs.unlinkSync(req.file.path);

        res.json({
          message: "Upload successful",
          count: validRecords.length,
        });
      });

    } catch (err) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================
   Dashboard
===================== */

app.get("/api/dashboard/stats", verifyToken, async (req, res) => {
  try {
    const [clientRes] = await db.query(
      "SELECT COUNT(*) AS totalClients FROM clients"
    );

    const [adminRes] = await db.query(
      "SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'admin'"
    );

    res.json({
      clients: clientRes[0].totalClients,
      admins: adminRes[0].totalAdmins,
    });

  } catch (err) {
    res.status(500).json(err);
  }
});
/* =====================
   Dashboard
===================== */

app.get("/api/dashboard/stats", verifyToken, async (req, res) => {
  try {
    const [clientRes] = await db.query(
      "SELECT COUNT(*) AS totalClients FROM clients"
    );

    const [adminRes] = await db.query(
      "SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'admin'"
    );

    res.json({
      clients: clientRes[0].totalClients,
      admins: adminRes[0].totalAdmins,
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD THIS NEW ENDPOINT for clients per month
app.get("/api/dashboard/clients-per-month", verifyToken, async (req, res) => {
  try {
    // This query groups clients by month and year
    const query = `
      SELECT 
        DATE_FORMAT(created_at, '%b') as name,
        MONTH(created_at) as month_num,
        YEAR(created_at) as year,
        COUNT(*) as clients
      FROM clients
      WHERE created_at IS NOT NULL
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC
      LIMIT 12
    `;

    const [results] = await db.query(query);
    
    // If no data, return empty array
    if (results.length === 0) {
      return res.json([]);
    }

    // Reverse to show chronological order
    res.json(results.reverse());
  } catch (err) {
    console.error("Error fetching monthly clients:", err);
    res.status(500).json({ error: err.message });
  }
});
/* =====================
   User Profile Routes
===================== */

// Get current user profile
app.get("/api/auth/me", verifyToken, async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, name, email, role, department, phone, location, employee_id, security_level, last_login, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put("/api/auth/profile", verifyToken, async (req, res) => {
  const { name, phone, location, department } = req.body;

  try {
    const sql = `
      UPDATE users 
      SET name = ?, phone = ?, location = ?, department = ?
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [name, phone, location, department, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
app.put("/api/auth/change-password", verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get current user with password
    const [results] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, req.user.id]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update notification preferences
app.put("/api/auth/notifications", verifyToken, async (req, res) => {
  const { email_notifications, client_alerts, system_updates, security_alerts } = req.body;

  try {
    const sql = `
      UPDATE users 
      SET email_notifications = ?, 
          client_alerts = ?, 
          system_updates = ?, 
          security_alerts = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      email_notifications || false,
      client_alerts || false,
      system_updates || false,
      security_alerts || false,
      req.user.id
    ]);

    res.json({ message: "Notification preferences updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user preferences
app.put("/api/auth/preferences", verifyToken, async (req, res) => {
  const { dark_mode, language, sound_effects, time_format } = req.body;

  try {
    const sql = `
      UPDATE users 
      SET dark_mode = ?, 
          language = ?, 
          sound_effects = ?, 
          time_format = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      dark_mode || false,
      language || 'en',
      sound_effects || false,
      time_format || '24h',
      req.user.id
    ]);

    res.json({ message: "Preferences updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================
   Start Server
===================== */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
