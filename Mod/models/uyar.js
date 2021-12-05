const mongoose = require("mongoose");

module.exports = mongoose.model("can_uyarılar", new mongoose.Schema({
   user: String,
   uyarılar: Array,
}));