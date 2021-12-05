const mongoose = require("mongoose");

module.exports = mongoose.model("can_yasaklıtag", new mongoose.Schema({
    guild: String,
  taglar: Array
}));