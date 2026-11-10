const express =
  require("express");

const router =
  express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
<<<<<<< HEAD
  updateCurrentUser
} = require("../controllers/authController");
=======
  updateProfile
} = require(
  "../controllers/authController"
);
>>>>>>> bedd9650e9bcdedf57dff22c30d32f9aa757d255

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

<<<<<<< HEAD
router.put(
  "/me",
  authMiddleware,
  updateCurrentUser
);

=======

// =====================================
// UPDATE PROFILE
// PUT /api/auth/profile
// =====================================

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);


>>>>>>> bedd9650e9bcdedf57dff22c30d32f9aa757d255
module.exports = router;