const express = require("express");
// mergeParams: true si usa quando togliamo ID dal Path
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviews = require("../controllers/reviews")
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

// CREATE REVIEW
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))
// DELETE REVIEW con $pull(rimuove da un array tutte le instanze che matchano una specifica condizione.)
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;