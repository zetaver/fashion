const express = require("express");
const passport = require("passport");
require("../config/passportConfig");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  getUserInfo,
  updateUserInfo
} = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`http://localhost:3000/login?token=${token}&user=${JSON.stringify(req.user)}`);
});


router.post("/api/register", registerUser);

router.post("/api/login", loginUser);



module.exports = router;
