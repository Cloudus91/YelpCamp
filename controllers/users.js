const User = require("../models/user");
// RENDER REGISTER
module.exports.renderRegister = (req, res) => {
    res.render("users/register")
}
// REGISTER
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {// login all'utente appena registrato
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp Camp!");
            res.redirect("/campgrounds")
        });
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("register")
    }
}
// RENDER login
module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}
// LOGIN passport middleware
module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back!");
    const redirectUrl = req.session.returnTo || "/campgrounds"; //reindirizzo nella sessione corrente o campgrounds
    delete req.session.returnTo; //cancello la richiesta
    res.redirect(redirectUrl);
}
// LOGOUT
module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye!")
    res.redirect("/campgrounds");
}