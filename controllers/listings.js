const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema");
const { cloudinary } = require("../cloudConfig"); // cloudinary instance for deletion if needed

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
      // Validate incoming data
      const { error } = listingSchema.validate(req.body);
      if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(msg, 400);
      }

      // Make sure a file is uploaded
      if (!req.file) {
        throw new ExpressError("Listing image is required", 400);
      }

      const { path: url, filename } = req.file;

      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = { url, filename };
      await newListing.save();

      req.flash("success", "Successfully created a new listing!");
      res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
      next(err);
    }
  },

  // Show single listing
  showListing: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });

      if (!listing) {
        throw new ExpressError("Cannot find that listing!", 404);
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
      if (!listing) throw new ExpressError("Cannot find that listing!", 404);
      if (!listing.owner.equals(req.user._id))
        throw new ExpressError("You do not have permission to edit this listing!", 403);

      res.render("listings/edit", { listing });
    } catch (err) {
      next(err);
    }
  },

  // Update listing
  updateListing: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) throw new ExpressError("Cannot find that listing!", 404);
      if (!listing.owner.equals(req.user._id))
        throw new ExpressError("You do not have permission to update this listing!", 403);

      // Update image if a new file is uploaded
      if (req.file) {
        if (listing.image && listing.image.filename) {
          await cloudinary.uploader.destroy(listing.image.filename);
        }
        listing.image.url = req.file.path;
        listing.image.filename = req.file.filename;
      }

      // Update other fields safely
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
      if (!listing) throw new ExpressError("Cannot find that listing!", 404);
      if (!listing.owner.equals(req.user._id))
        throw new ExpressError("You do not have permission to delete this listing!", 403);

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
