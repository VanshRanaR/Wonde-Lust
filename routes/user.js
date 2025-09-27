const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");
const usersController = require("../controllers/users");

// Signup routes
router
  .route("/signup")
  .get(usersController.renderSignup)              // Render signup page
  .post(wrapAsync(usersController.signup));       // Handle signup form submission

// Login routes
router
  .route("/login")
  .get(usersController.renderLogin)              // Render login page
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: "Invalid username or password!"
    }),
    usersController.login                          // Handle login
  );

// Logout
router.get("/logout", usersController.logout);

module.exports = router;
