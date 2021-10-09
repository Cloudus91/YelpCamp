const mongoose = require("mongoose");
const Review = require("./review")
const Schema = mongoose.Schema;

//https://res.cloudinary.com/cloud91/image/upload/w_200/v1633355602/YelpCamp/wfb96vcbt8ygawlvobie.jpg
// Abbassare la risoluzione/larghezza delle immagini w_200
const ImageSchema = new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200")
});

// https://mongoosejs.com/docs/tutorials/virtuals.html
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: { // https://mongoosejs.com/docs/geojson.html
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: { // Autorizzazione per Review
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p > `
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  //console.log(doc)
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
