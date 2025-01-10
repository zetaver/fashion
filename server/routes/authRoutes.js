// Import necessary Node.js modules
const express = require("express");
const passport = require("passport");
require("../config/passportConfig");  // Import passport configuration
const jwt = require("jsonwebtoken");  // Module to issue JWTs for authenticated users
const {
  registerUser,
  loginUser,
  getUserInfo,
  updateUserInfo
} = require("../controllers/authController");  // Controller functions handling user actions
const User = require("../models/User");  // User model for MongoDB

const router = express.Router();  // Create a new router object to handle routes

// Route to start Google OAuth authentication process
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }) // Scope specifies what data we want from Google's servers
);

// Route for Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), // Use passport to authenticate; redirect to login on fail
  (req, res) => {
    // Generate a JWT for the user with their ID and role, expiring in 1 hour
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Redirect user to the client-side route with the token and user info as query parameters
    res.redirect(`http://localhost:3000/login?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

// Route to register a new user
router.post("/api/register", registerUser);

// Route to login a user
router.post("/api/login", loginUser);

// Export the router to be mounted by the main application
module.exports = router;
