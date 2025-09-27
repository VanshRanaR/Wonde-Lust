const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports = {
    createReview: async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Cannot find that listing!");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        await newReview.save();

        listing.reviews.push(newReview);
        await listing.save({ validateBeforeSave: false });

        req.flash("success", "Review created");
        res.redirect(`/listings/${listing._id}`);
    },

    deleteReview: async (req, res) => {
        const { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review Deleted");
        res.redirect(`/listings/${id}`);
    }
};
