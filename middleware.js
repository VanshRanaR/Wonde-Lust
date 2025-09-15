module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please login first");
        return res.redirect("/login");
    }
    next();
};
