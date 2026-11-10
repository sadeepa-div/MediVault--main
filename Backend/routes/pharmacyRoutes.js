const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getAllPharmacies } = require("../controllers/pharmacyController");

const router = express.Router();

router.get("/", authMiddleware, getAllPharmacies);

module.exports = router;
