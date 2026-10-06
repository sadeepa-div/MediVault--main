console.log("NEW MEDIVAULT SERVER FILE RUNNING");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const medicineRoutes = require("./routes/medicineRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "MediVault Backend is running!"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);

// Start serving only after the database is reachable.
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    db.end((closeErr) => {
      if (closeErr) {
        console.error("Failed to close MySQL pool:", closeErr.message);
      }
      process.exitCode = 1;
    });
    return;
  }

  console.log("MySQL connected successfully!");

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});