const express = require("express");

const router = express.Router();

const {
  getAllMedicines,
  searchMedicines,
  getDashboardStats,
  addMedicine,
  updateMedicine,
  deleteMedicine
} = require("../controllers/medicineController");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");


// Logged-in users
router.get(
  "/",
  authMiddleware,
  getAllMedicines
);

router.get(
  "/search",
  authMiddleware,
  searchMedicines
);

router.get(
  "/stats",
  authMiddleware,
  getDashboardStats
);


// ADMIN ONLY

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addMedicine
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateMedicine
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteMedicine
);

module.exports = router;