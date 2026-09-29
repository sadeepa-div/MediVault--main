const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/google", googleLogin);

// Protected route
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

module.exports = router;