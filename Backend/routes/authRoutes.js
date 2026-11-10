const express =
  require("express");

const router =
  express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  updateProfile
} = require(
  "../controllers/authController"
);

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );


// =====================================
// REGISTER
// POST /api/auth/register
// =====================================

router.post(
  "/register",
  registerUser
);


// =====================================
// LOGIN
// POST /api/auth/login
// =====================================

router.post(
  "/login",
  loginUser
);


// =====================================
// GOOGLE LOGIN
// POST /api/auth/google
// =====================================

router.post(
  "/google",
  googleLogin
);


// =====================================
// CURRENT USER
// GET /api/auth/me
// =====================================

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);


// =====================================
// UPDATE PROFILE
// PUT /api/auth/profile
// =====================================

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);


module.exports = router;