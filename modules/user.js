const mongoose = require("mongoose");
const User = mongoose.model("User", {
  name: String,
  last_name: String,
  email: String,
  pass: String,
  phone: String,
  idss:Array
});
module.exports = User;
