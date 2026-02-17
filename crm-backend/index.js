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

    // Log the login activity
    try {
      await db.query(
        "INSERT INTO activity_logs (user_id, action_type, action, details, ip_address) VALUES (?, 'login', 'User logged in', ?, ?)",
        [user.id, `Login successful`, req.ip || req.connection.remoteAddress]
      );
    } catch (logErr) {
      console.error("Failed to log activity:", logErr);
      // Don't fail the login if logging fails
    }

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
// In your server.js, update the /api/clients POST route
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

    // Log the add client activity
    try {
      await db.query(
        "INSERT INTO activity_logs (user_id, action_type, action, details, client_name, client_id) VALUES (?, 'add', 'New client added', ?, ?, ?)",
        [req.user.id, `Added client: ${business_name}`, business_name, result.insertId]
      );
    } catch (logErr) {
      console.error("Failed to log activity:", logErr);
      // Don't fail the request if logging fails
    }

    // IMPORTANT: Send a success response with 201 status
    res.status(201).json({
      message: "Client added successfully",
      id: result.insertId,
      client: {
        id: result.insertId,
        business_name
      }
    });

  } catch (err) {
    console.error("Error adding client:", err);
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
     
    console.log("PUT affected rows:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Log the update activity
    try {
      await db.query(
        "INSERT INTO activity_logs (user_id, action_type, action, details, client_name, client_id) VALUES (?, 'update', 'Client updated', ?, ?, ?)",
        [req.user.id, `Updated client: ${business_name}`, business_name, req.params.id]
      );
    } catch (logErr) {
      console.error("Failed to log activity:", logErr);
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
    // First get the client name for logging
    const [client] = await db.query("SELECT business_name FROM clients WHERE id = ?", [req.params.id]);
    const business_name = client[0]?.business_name || 'Unknown';

    const [result] = await db.query(
      "DELETE FROM clients WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Log the delete activity
    try {
      await db.query(
        "INSERT INTO activity_logs (user_id, action_type, action, details, client_name, client_id) VALUES (?, 'delete', 'Client deleted', ?, ?, ?)",
        [req.user.id, `Deleted client: ${business_name}`, business_name, req.params.id]
      );
    } catch (logErr) {
      console.error("Failed to log activity:", logErr);
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

        // Log the upload activity
        try {
          await db.query(
            "INSERT INTO activity_logs (user_id, action_type, action, details) VALUES (?, 'upload', 'Bulk upload completed', ?)",
            [req.user.id, `Uploaded ${validRecords.length} clients via CSV`]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }

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

// SINGLE dashboard stats endpoint (duplicate removed)
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

// Clients per month endpoint
app.get("/api/dashboard/clients-per-month", verifyToken, async (req, res) => {
  try {
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
    
    if (results.length === 0) {
      return res.json([]);
    }

    res.json(results.reverse());
  } catch (err) {
    console.error("Error fetching monthly clients:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================
   Activity Logs
===================== */

// Get recent activity for dashboard
app.get("/api/activity/recent", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        al.id,
        al.action_type as type,
        al.action,
        al.details,
        al.client_name as client,
        al.created_at,
        u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    const [results] = await db.query(query);
    
    const formattedResults = results.map(log => {
      const timeAgo = formatTimeAgo(log.created_at);
      
      return {
        id: log.id,
        action: log.action,
        client: log.client || 'System',
        time: timeAgo,
        type: log.type || 'info',
        user: log.user_name
      };
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching recent activity:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get paginated activity logs (for full activity page)
app.get("/api/activity", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [countResult] = await db.query("SELECT COUNT(*) as total FROM activity_logs");
    const total = countResult[0].total;

    const query = `
      SELECT 
        al.id,
        al.action_type as type,
        al.action,
        al.details,
        al.client_name as client,
        al.ip_address,
        al.created_at,
        u.name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [results] = await db.query(query, [limit, offset]);
    
    const formattedResults = results.map(log => ({
      id: log.id,
      type: log.type,
      action: log.action,
      details: log.details,
      client: log.client,
      user: log.user_name || 'System',
      userEmail: log.user_email,
      ipAddress: log.ip_address,
      timestamp: log.created_at,
      timeAgo: formatTimeAgo(log.created_at)
    }));

    res.json({
      data: formattedResults,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to format time ago
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

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
    const [results] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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