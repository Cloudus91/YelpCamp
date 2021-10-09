const express = require("express");
const router = express.Router();
const passport = require("passport")
const catchAsync = require("../utils/catchAsync")
const User = require("../models/user");
const users = require("../controllers/users")

// REGISTER
router.route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.register))
// LOGIN
router.route("/login")
    .get(users.renderLogin)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login)
// LOGOUT
router.get("/logout", users.logout)

module.exports = router;