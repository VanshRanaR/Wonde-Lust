const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");

const MONGO_URL = "mongodb://127.0.0.1:27017/YOYO";

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection error:", err));

// Routes
app.use("/listings", listingRoutes);  // important: prefix is /listings
app.use("/", reviewRoutes);           // review routes handle /listings/:id/reviews

app.get("/", (req, res) => {
    res.redirect("/listings");  // redirect home to all listings
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { err });
});

// Start server
app.listen(8080, () => console.log("Server running on port 8080"));
