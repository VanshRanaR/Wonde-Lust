const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",   // 👈 reference to User model
        required: true
    }
    
});

module.exports = mongoose.model("Review", reviewSchema);
