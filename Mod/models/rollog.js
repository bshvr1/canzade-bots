const mongoose = require("mongoose");

module.exports = mongoose.model("can_roller", new mongoose.Schema({
    user: String, 
    roller: Array
}));
