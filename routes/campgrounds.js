const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds")
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require('multer');
const { storage } = require("../cloudinary")
const upload = multer({ storage });

const Campground = require("../models/campground");
// Campgroun index e create new camp
router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))

// Campground new - crea un nuovo campground(mettere il codice prima di Id senò non funziona)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Campground show - update - delete
router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// Campground edit - modificare un campground
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));

module.exports = router