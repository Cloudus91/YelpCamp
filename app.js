// SE SIAMO IN DEVELOPMENT MODE richied DOTENV
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session")
const flash = require("connect-flash")
const ExpressError = require("./utils/ExpressError")
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews");

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true })); // senza non prende ciò che inserito nel form
app.use(methodOverride("_method")); // per usare delete
app.use(express.static(path.join(__dirname, "public"))) // per usare la cartella public nell'app
app.use(mongoSanitize()); // previene che qualcuno usi delle query per modificare il database

const secret = process.env.SECRET || "thisshouldbeabettersecret!"

const store = MongoStore.create({ //https://www.npmjs.com/package/connect-mongo
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
  console.log("Store ERROR", e)
})

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true, // Only when we Deploy(https)
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // scadenza per IE
    maxAge: 1000 * 60 * 60 * 24 * 7, // scadenza per tutti i browser
  }
}
app.use(session(sessionConfig)) // use session
app.use(flash()) // flash use
app.use(helmet());

// HELMET 

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/cloud91/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);



// PASSPORT
app.use(passport.initialize()) // richiesto per inizializzare
app.use(passport.session()) // persistent local session
passport.use(new LocalStrategy(User.authenticate()))// autentica con User model

passport.serializeUser(User.serializeUser()) // come memorizzare User nella Session
passport.deserializeUser(User.deserializeUser()) // come portare fuori User dalla Session

//FLASH MIDDLEWARE con returnTo oringalUrl
app.use((req, res, next) => {
  if (!["/login", "/"].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next()
})

// ROUTER USE
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});


app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404))
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Oh no, somethinge went Wrong!"
  res.status(statusCode).render("error", { err })
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
