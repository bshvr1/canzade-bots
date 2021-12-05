const mongoose = require("mongoose");

module.exports = mongoose.model("can_extramute", new mongoose.Schema({
    user: String, 
    array: Array
}));