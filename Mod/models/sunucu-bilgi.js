const mongoose = require("mongoose")

const can_sunucu = new mongoose.Schema({
   guild: String,
   ihlal: Number
})

module.exports = mongoose.model("can_sunucu", can_sunucu)