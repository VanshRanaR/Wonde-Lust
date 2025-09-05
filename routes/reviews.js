const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

// Add review
router.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    await newReview.save();
    listing.reviews.push(newReview);
    await listing.save({ validateBeforeSave: false });
    req.flash("success"," Review created")
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete("/reviews/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    await Listing.updateMany({ reviews: id }, { $pull: { reviews: id } });
    req.flash("success"," Review Deleted")
     res.redirect(`/listings/${listingId}`);
}));

module.exports = router;
