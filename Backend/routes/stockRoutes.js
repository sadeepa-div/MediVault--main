const express = require("express");

const router = express.Router();

const {
  getAllStock,
  addStock,
  updateStock,
  deleteStock
} = require("../controllers/stockController");


const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");


// Logged-in users can view stock
router.get(
  "/",
  authMiddleware,
  getAllStock
);


// Admin only
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  addStock
);


router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateStock
);


router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteStock
);


module.exports = router;
