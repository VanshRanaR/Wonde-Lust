const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const { isLoggedIn } = require("../middleware.js");

// All listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

// New listing form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

// Create listing
router.post(
    "/",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { error } = listingSchema.validate(req.body);
        if (error) throw new ExpressError(400, error);

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; // set owner to logged-in user
        await newListing.save();

        req.flash("success", "Successfully created a new listing!");
        res.redirect(`/listings/${newListing._id}`);
    })
);

// Show single listing
router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate("reviews")
        .populate({ path: "owner" })
        .populate({ path: "reviews", populate: { path: "author" } });

    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
}));

// Edit form (owner only)
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit this listing!");
        return res.redirect(`/listings/${req.params.id}`);
    }
    res.render("listings/edit", { listing });
}));

// Update listing (owner only)
router.put("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to update this listing!");
        return res.redirect(`/listings/${req.params.id}`);
    }
    await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${req.params.id}`);
}));

// Delete listing (owner only)
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this listing!");
        return res.redirect(`/listings/${req.params.id}`);
    }
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;
