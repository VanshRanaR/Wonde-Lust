const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware.js");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// List all listings / Create new
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("image"), wrapAsync(listingController.createListing));

// Form to create a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Single listing operations
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, wrapAsync(listingController.deleteListing));

// Edit form
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

module.exports = router;
