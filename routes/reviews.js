// routes/reviews.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const reviewsController = require("../controllers/reviews.js");

// Use router.route() for all actions on reviews of a listing
router
  .route("/")
  .get(wrapAsync(reviewsController.getReviews)) // GET all reviews
  .post(isLoggedIn, wrapAsync(reviewsController.createReview)); // POST a new review

router
  .route("/:reviewId")
  .delete(wrapAsync(reviewsController.deleteReview)); // DELETE a review

module.exports = router;
