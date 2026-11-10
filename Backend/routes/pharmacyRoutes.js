const express = require("express");

const router = express.Router();

const {
  getAllPharmacies,
  addPharmacy,
  updatePharmacy,
  deletePharmacy,
} = require("../controllers/pharmacyController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

// Logged-in users can view pharmacies
router.get("/", authMiddleware, getAllPharmacies);

// Admin only
router.post("/", authMiddleware, adminMiddleware, addPharmacy);

router.put("/:id", authMiddleware, adminMiddleware, updatePharmacy);

router.delete("/:id", authMiddleware, adminMiddleware, deletePharmacy);

module.exports = router;
