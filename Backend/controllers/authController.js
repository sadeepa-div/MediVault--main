const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, birthday, phone } = req.body;

    // Required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
      async (err, results) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Database error",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "Email is already registered",
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        const sql = `
          INSERT INTO users
          (full_name, email, password_hash, birthday, phone)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          sql,
          [
            fullName,
            normalizedEmail,
            passwordHash,
            birthday || null,
            phone || null,
          ],
          (insertErr, result) => {
            if (insertErr) {
              console.error(insertErr);

              return res.status(500).json({
                message: "Could not create account",
              });
            }

            return res.status(201).json({
              message: "Account created successfully",
              user: {
                id: result.insertId,
                fullName: fullName,
                email: normalizedEmail,
              },
            });
          },
        );
      },
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail],
      async (err, results) => {

        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Database error"
          });
        }

        // User not found
        if (results.length === 0) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        const user = results[0];

        // Account may later be Google/Facebook only
        if (!user.password_hash) {
          return res.status(401).json({
            message: "Please login using Google or Facebook"
          });
        }

        // Compare entered password with hashed password
        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        // Create JWT
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h"
          }
        );

        return res.status(200).json({
          message: "Login successful",

          token,

          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google account"
      });
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const fullName = payload.name || "Google User";

    if (!email || !payload.email_verified) {
      return res.status(401).json({
        message: "Google email could not be verified"
      });
    }

    // First check Google ID
    db.query(
      "SELECT * FROM users WHERE google_id = ?",
      [googleId],
      (googleErr, googleResults) => {
        if (googleErr) {
          console.error(googleErr);

          return res.status(500).json({
            message: "Database error"
          });
        }

        // Existing Google user
        if (googleResults.length > 0) {
          return sendGoogleLoginResponse(
            googleResults[0],
            res
          );
        }

        // Check whether same email already exists
        db.query(
          "SELECT * FROM users WHERE email = ?",
          [email],
          (emailErr, emailResults) => {
            if (emailErr) {
              console.error(emailErr);

              return res.status(500).json({
                message: "Database error"
              });
            }

            // Existing manual account:
            // connect Google to same account
            if (emailResults.length > 0) {
              const existingUser = emailResults[0];

              db.query(
                "UPDATE users SET google_id = ? WHERE id = ?",
                [googleId, existingUser.id],
                (updateErr) => {
                  if (updateErr) {
                    console.error(updateErr);

                    return res.status(500).json({
                      message:
                        "Could not connect Google account"
                    });
                  }

                  return sendGoogleLoginResponse(
                    existingUser,
                    res
                  );
                }
              );

              return;
            }

            // Completely new Google user
            db.query(
              `
              INSERT INTO users
              (full_name, email, google_id, role)
              VALUES (?, ?, ?, 'user')
              `,
              [fullName, email, googleId],
              (insertErr, result) => {
                if (insertErr) {
                  console.error(insertErr);

                  return res.status(500).json({
                    message:
                      "Could not create Google account"
                  });
                }

                const newUser = {
                  id: result.insertId,
                  full_name: fullName,
                  email,
                  role: "user"
                };

                return sendGoogleLoginResponse(
                  newUser,
                  res
                );
              }
            );
          }
        );
      }
    );

  } catch (error) {
    console.error(
      "Google authentication error:",
      error
    );

    return res.status(401).json({
      message: "Google authentication failed"
    });
  }
};

const sendGoogleLoginResponse = (user, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );

  return res.status(200).json({
    message: "Google login successful",

    token,

    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    }
  });
};

const getCurrentUser = (req, res) => {

  const userId = req.user.id;

  const sql = `
    SELECT
      id,
      full_name,
      email,
      birthday,
      phone,
      role,
      created_at
    FROM users
    WHERE id = ?
  `;

  db.query(
    sql,
    [userId],
    (err, results) => {

      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Database error"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      const user = results[0];

      res.status(200).json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          birthday: user.birthday,
          phone: user.phone,
          role: user.role,
          createdAt: user.created_at
        }
      });
    }
  );
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser
};