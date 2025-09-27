// utils/middleware.js

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Save the URL the user was trying to access
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }
    next();
};

// Middleware to save redirect URL in locals
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
