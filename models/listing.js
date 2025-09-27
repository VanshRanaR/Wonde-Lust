const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String, // The original filename or the Cloudinary public_id
    url: String,      // The Cloudinary secure URL
  },
  price: Number,
  location: String,
  country: String,
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "Review"
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",  
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
