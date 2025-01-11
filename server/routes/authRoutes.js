// Import necessary modules
const express = require("express");
const passport = require("passport");
require("../config/passportConfig");  // Initialize Passport configuration
const jwt = require("jsonwebtoken");  // For issuing JSON Web Tokens (JWT)

// Import controller functions for handling authentication logic
const {
  registerUser,
  loginUser,
  getUserInfo,
  updateUserInfo
} = require("../controllers/authController");

// Import the User model for MongoDB operations
const User = require("../models/User");

// Create a new router instance to define route handlers
const router = express.Router();

// Initiate Google OAuth authentication process
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // Request profile and email information
);

// Handle Google OAuth callback and issue a JWT upon successful authentication
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate a JWT with the user's ID and role, valid for 1 hour
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Redirect the user to the frontend app with the token and user data
    res.redirect(`http://localhost:3000/login?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

// Define route for user registration
router.post("/api/register", registerUser);

// Define route for user login
router.post("/api/login", loginUser);

// Export the router for use in the main application
module.exports = router;
