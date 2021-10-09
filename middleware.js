const { campgroundSchema, reviewSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review")

//passport authentication
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first!")
        return res.redirect("/login")
    }
    next()
}

//Middleware con Joi per Campground
// Creo una funzione Middleware con uno schema con joi(non mongoose) 
// per validare ogni campo del form
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
//MIDDLEWARE per verificare se l'utente è autore del Campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) { //equals è un metodo di mongoose
        req.flash("error", "You do no have permission to do that!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//MIDDLEWARE per verificare se l'utente è autore della REVIEW
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) { //equals è un metodo di mongoose
        req.flash("error", "You do no have permission to do that!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//Middleware con Joi per Review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}