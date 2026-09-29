const medicineRoutes =
  require("./routes/medicineRoutes");
  const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MediVault Backend is running!");
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/medicines",
  medicineRoutes
);

// Test MySQL connection
db.query("SELECT 1", (err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
  } else {
    console.log("MySQL connected successfully!");
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});