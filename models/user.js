const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true,
    }
})
// Questo ci aggiungera passoword e username al nostro UserSchema
// oltre che ad Hash e Local
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema)