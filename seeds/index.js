const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground"); // metto i due punti per uscire dalla cartella seeds

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

// funzione per avere un Camp casuale preso da seedHelpers
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Creo 50 città nel database casuali con nome e stato, presi da cities.js e un Camp casuale
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // YOUR AUTHOR ID 
      author: "6155d3f0255556654575fd35", // imposto tim come author di tutti i camp
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum facere placeat earum quia molestiae, nulla praesentium cumque delectus quasi velit, pariatur beatae id est fugiat ipsam libero nesciunt voluptatum esse.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/cloud91/image/upload/v1633453596/YelpCamp/obnpymwjil3os1bnsayo.jpg',
          filename: 'YelpCamp/nwdck2bxfnkp5pgnf5xi',
        },
        {
          url: 'https://res.cloudinary.com/cloud91/image/upload/v1633453383/YelpCamp/c8qo3eyvgwqjtmjrgh6f.jpg',
          filename: 'YelpCamp/x3l2v4vltevfpwdnn13t',
        }
      ]
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
