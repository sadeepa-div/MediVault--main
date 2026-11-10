const express = require("express");
<<<<<<< HEAD
const authMiddleware = require("../middleware/authMiddleware");
const { getAllPharmacies } = require("../controllers/pharmacyController");

const router = express.Router();

router.get("/", authMiddleware, getAllPharmacies);

=======

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

>>>>>>> bedd9650e9bcdedf57dff22c30d32f9aa757d255
module.exports = router;
