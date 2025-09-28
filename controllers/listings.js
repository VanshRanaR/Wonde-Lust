const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const { cloudinary } = require("../cloudConfig"); // Cloudinary for image management

module.exports = {
  // Show all listings
  index: async (req, res, next) => {
    try {
      const allListings = await Listing.find({});
      res.render("listings/index", { allListings });
    } catch (err) {
      next(err);
    }
  },

  // Render new listing form
  renderNewForm: (req, res) => {
    res.render("listings/new");
  },

  // Create a new listing
createListing: async (req, res, next) => {
  try {
    console.log("REQ.BODY.LISTING:", req.body.listing);
    console.log("REQ.FILE:", req.file);

    // Convert price to number
    const listingData = { ...req.body.listing };
    listingData.price = Number(listingData.price);

    // Validate
    const { error } = listingSchema.validate({ listing: listingData });
    if (error) {
      const msg = error.details.map(el => el.message).join(", ");
      throw new ExpressError(msg, 400);
    }

    // Check file
    if (!req.file) {
      req.flash("error", "Listing image is required!");
      return res.redirect("/listings/new");
    }

    // Create listing
    const { path: url, filename } = req.file;
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.log("ERROR CREATING LISTING:", err);
    req.flash("error", err.message || "Something went wrong!");
    res.redirect("/listings/new");
  }
}
,


  // Show a single listing
  showListing: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });

      if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
      }

      res.render("listings/show", { listing });
    } catch (err) {
      next(err);
    }
  },

  // Render edit form
  renderEditForm: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
      }
      if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit this listing!");
        return res.redirect(`/listings/${req.params.id}`);
      }
      res.render("listings/edit", { listing });
    } catch (err) {
      next(err);
    }
  },

  // Update listing
  updateListing: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
      }
      if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to update this listing!");
        return res.redirect(`/listings/${req.params.id}`);
      }

      // Update image if a new file is uploaded
      if (req.file) {
        if (listing.image && listing.image.filename) {
          await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image.url = req.file.path;
        listing.image.filename = req.file.filename;
      }

      // Update other fields
      const { title, description, price, location, country } = req.body.listing;
      listing.title = title;
      listing.description = description;
      listing.price = price;
      listing.location = location;
      listing.country = country;

      await listing.save();
      req.flash("success", "Listing Updated");
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      next(err);
    }
  },

  // Delete listing
  deleteListing: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
      }
      if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this listing!");
        return res.redirect(`/listings/${req.params.id}`);
      }

      // Delete image from Cloudinary
      if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
      }

      await Listing.findByIdAndDelete(req.params.id);
      req.flash("success", "Listing Deleted");
      res.redirect("/listings");
    } catch (err) {
      next(err);
    }
  },
};
