const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path= require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema}= require("./schema.js");
const Review = require("./models/review.js");
 
const MONGO_URL = "mongodb://127.0.0.1:27017/YOYO";

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



// MongoDB connection
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(" Connection error:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("ho o am goot");
});

// app.get("/test", async (req, res) => {
//   const sampleListing = new Listing({
//     title: "my home",
//     description: "by the greenery",
//     price: 1200,
//     location: "himachal",
//     country: "india",
//   });

app.get("/listing", wrapAsync(async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index", { alllistings });


}));

app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs")
})


app.get("/listings/:id",wrapAsync( async(req,res)=>{
  let {id}= req.params;
 const listing= await Listing.findById(id);
 res.render("listings/show.ejs",{listing});

}));


app.post("/listings", 
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing!");
    // }
    
    // const newListing = new Listing(req.body.listing);
    
    // if (!newListing.title) {
    //   throw new ExpressError(400, "Title is missing!");
    // }
    
    // if (!newListing.description) {
    //   throw new ExpressError(400, "Description is missing!");
    // }
    
    // if (!newListing.location) {
    //   throw new ExpressError(400, "Location is missing!");
    // }
    let result=listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
      throw new ExpressError(400, result.error);
    }
    await newListing.save();
    res.redirect("/listings");
  })
);



app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
let {id}= req.params;
 const listing= await Listing.findById(id);
     res.render("listings/edit.ejs",{listing});
}));


// app.post("/listings",async (req,res)=>{
//    let listing = req.body;
//    console.log(listing);

// })



// Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect("/listing");
}));

//DEELETE
app.delete("/listings/:id",wrapAsync( async (req,res)=>{
  let {id}= req.params;
  let deleteListing=   await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listing");
}))
//reviews
app.post("/listings/:id/reviews", async(req, res)=>
{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new  reviw saved");
  res.send("new review saved");
});












































 
//   await sampleListing.save(); 
//   console.log(" Sample was saved");
//   res.send("Successful testing");
 
// });

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.render("error.ejs");
    // res.status(statusCode).send(message);
});


// Start server
app.listen(8080, () => {
  console.log(" Server is running on port 8080");

});
