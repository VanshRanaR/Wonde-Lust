const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

// Signup page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

// Signup POST route
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    if (e.name === "UserExistsError") {
      req.flash("error", "A user with that email already exists!");
      return res.redirect("/signup");
    }
    next(e);
  }
});


// Login page
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

// Login POST
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password!"
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash("success", "You have logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
