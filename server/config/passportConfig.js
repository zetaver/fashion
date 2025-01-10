// Require necessary modules and packages
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/User');  // MongoDB model for users
const dotenv = require("dotenv");
dotenv.config();  // Load environment variables from .env file

// Configure Passport to use a GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      // Google client ID and secret obtained from the Google Developer Console
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // The URL to which Google will redirect the user after authentication
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    // Verification function that is called with the returned Google profile information
    async (token, tokenSecret, profile, done) => {
      try {
        // Extract useful information from the profile
        const { id, emails, displayName } = profile;

        // Check if the user already exists in the database based on their email
        let user = await User.findOne({ email: emails[0].value });

        // If the user does not exist, create a new user document in MongoDB
        if (!user) {
          user = new User({
            username: displayName,  // Use the name from Google as username
            email: emails[0].value,  // Email returned from Google
            googleId: id,  // Google ID to link the account
            role: 'designer',  // Assign a role or default attribute if necessary
          });
          await user.save();  // Save the new user to the database
        }

        // Pass the user to the done callback, which will continue the authentication process
        return done(null, user);
      } catch (error) {
        // Handle errors and pass them to the done callback
        return done(error, null);
      }
    }
  )
);

// Serialize the user ID into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize the user ID from the session to retrieve the user object
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);  // Fetch the user from the database using their ID
  done(null, user);  // Pass the user object to the done callback
});

// Export the configured passport module
module.exports = passport;
