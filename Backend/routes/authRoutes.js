const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  updateCurrentUser
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

router.put(
  "/me",
  authMiddleware,
  updateCurrentUser
);

module.exports = router;