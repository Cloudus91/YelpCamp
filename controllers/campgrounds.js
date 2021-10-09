const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN; // https://www.npmjs.com/package/@mapbox/mapbox-sdk#creating-clients
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary'); // Diverso dal video di Colt

// Campgroun index - lista di tutti i campground
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}
// Campground new - crea un nuovo campground(mettere il codice prima di Id senò non funziona)
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}
// Campground create - Richiedere il form compilato in new - GEOCODE
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); // richiedo le immagini
    campground.author = req.user._id; // author = utente autenticato login
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`);
}
// Campground show - pagina per ogni singolo campground con populate delle review e AUTHOR
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that Campground!")
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}
// Campground edit - modificare un campground
module.exports.renderEditCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Cannot find that Campground!")
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}
// UpdateCampground - Method-overide per editare con ?_method=PUT"
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); // richiedo le immagini
    campground.images.push(...imgs); //spread operator
    await campground.save();
    if (req.body.deleteImages) {
        // per cancellare le foto da cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        // In campground.aggiornaUno/tira da images con filename l'immagine da cancellare richiesta nel body.
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
}
// DELETE CAMPGROUND con ?_method=PUT"
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds");
}