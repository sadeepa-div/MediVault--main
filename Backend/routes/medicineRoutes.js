const express = require("express");

const router = express.Router();

const {
  getAllMedicines,
  searchMedicines,
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