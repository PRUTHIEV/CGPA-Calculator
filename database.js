const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  username: Number,
  email: String,
  password: String,
  marks: Array,
  CGPA: Array,
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
