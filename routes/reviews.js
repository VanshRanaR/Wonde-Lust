// routes/reviews.js
const express = require("express");
const router = express.Router({ mergeParams: true }); // IMPORTANT
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// POST /listings/:id/reviews
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const review = new Review(req.body.review);
    review.author = req.user._id; // assign logged in user as author
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "Review added!");
    res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;
