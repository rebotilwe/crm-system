require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const csv = require("csv-parse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// Middleware: Verify Token
// =====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// =====================
// Routes
// =====================

// Root
app.get("/", (req, res) => {
  res.send("CRM API Running...");
});

// Test DB
app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Database connected ✅" });
  });
});

// =====================
// Auth
// =====================
// Admin Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const sql = `
      SELECT * FROM users 
      WHERE email = ? 
        AND role IN ('super_admin','admin','controller')
    `;
    const [results] = await db.query(sql, [email]);

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

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
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// =====================
// Clients
// =====================

// Add client
app.post("/api/clients", (req, res) => {
  const {
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements
  } = req.body;

  const sql = `
    INSERT INTO clients
    (business_name, owner_name, owner_phone, landline, owner_email, physical_address, postal_address, security_complement, additional_requirements)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Client added successfully", id: result.insertId });
  });
});

// Get all clients / search
app.get("/api/clients", (req, res) => {
  const search = req.query.search;
  let sql = "SELECT * FROM clients";
  const params = [];

  if (search) {
    sql += " WHERE business_name LIKE ? OR owner_name LIKE ? OR owner_phone LIKE ? OR landline LIKE ?";
    const value = `%${search}%`;
    params.push(value, value, value, value);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Get single client
app.get("/api/clients/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM clients WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json(results[0]);
  });
});

// Update client
app.put("/api/clients/:id", (req, res) => {
  const id = req.params.id;
  const {
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements
  } = req.body;

  const sql = `
    UPDATE clients
    SET business_name = ?, owner_name = ?, owner_phone = ?, landline = ?, owner_email = ?, physical_address = ?, postal_address = ?, security_complement = ?, additional_requirements = ?
    WHERE id = ?
  `;

  db.query(sql, [
    business_name,
    owner_name,
    owner_phone,
    landline,
    owner_email,
    physical_address,
    postal_address,
    security_complement,
    additional_requirements,
    id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client updated successfully" });
  });
});

// Delete client
app.delete("/api/clients/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM clients WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  });
});

// Upload CSV
app.post("/api/clients/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const results = [];
  const failed = [];

  fs.createReadStream(req.file.path)
    .pipe(csv({ columns: true, trim: true }))
    .on("data", row => {
      if (!row.business_name || !row.owner_name || !row.owner_phone) {
        failed.push({ row, reason: "Missing required field" });
      } else {
        results.push(row);
      }
    })
    .on("end", () => {
      if (results.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "No valid clients in file", failed });
      }

      const sql = `
        INSERT INTO clients
        (business_name, owner_name, owner_phone, landline, owner_email, physical_address, postal_address, security_complement, additional_requirements)
        VALUES ?
      `;
      const values = results.map(c => [
        c.business_name,
        c.owner_name,
        c.owner_phone,
        c.landline || "",
        c.owner_email || "",
        c.physical_address || "",
        c.postal_address || "",
        c.security_complement || "",
        c.additional_requirements || ""
      ]);

      db.query(sql, [values], (err, dbRes) => {
        fs.unlinkSync(req.file.path);
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Clients uploaded successfully", inserted: dbRes.affectedRows, failed });
      });
    });
});

// =====================
// Dashboard
// =====================
app.get("/api/dashboard/stats", verifyToken, (req, res) => {
  const clientsQuery = "SELECT COUNT(*) AS totalClients FROM clients";
  const adminsQuery = "SELECT COUNT(*) AS totalAdmins FROM users WHERE role = 'admin'";

  db.query(clientsQuery, (err, clientResult) => {
    if (err) return res.status(500).json(err);

    db.query(adminsQuery, (err, adminResult) => {
      if (err) return res.status(500).json(err);

      res.json({
        clients: clientResult[0].totalClients,
        admins: adminResult[0].totalAdmins,
      });
    });
  });
});

app.get("/api/dashboard/clients-per-month", verifyToken, (req, res) => {
  const sql = `
    SELECT MONTH(created_at) AS month, COUNT(*) AS total
    FROM clients
    WHERE YEAR(created_at) = YEAR(CURDATE())
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formatted = months.map((m, i) => {
      const found = results.find(r => r.month === i + 1);
      return { name: m, clients: found ? found.total : 0 };
    });

    res.json(formatted);
  });
});

// =====================
// Admins
// =====================
app.get("/api/admins", verifyToken, (req, res) => {
  const sql = "SELECT id, name, email, role FROM users WHERE role = 'admin'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/api/admins", verifyToken, (req, res) => {
  const { name, email, password, role } = req.body;
  const validRoles = ['super_admin','controller','admin'];
  const userRole = validRoles.includes(role) ? role : 'controller';

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, password, userRole], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Admin added successfully", role: userRole });
  });
});

app.delete("/api/admins/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ? AND role = 'admin'";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Admin removed successfully" });
  });
});

// =====================
// Start Server
// =====================

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});