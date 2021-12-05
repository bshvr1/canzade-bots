const Register = require("../models/kayıt.js")
const mongoose = require("mongoose");
const Config = require("../Settings/Settings.json")
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
      if (member.roles.cache.has(Config.Role.Unregistered)) return
      if (member.roles.cache.has(Config.Role.Jail)) return
      if (member.roles.cache.has(Config.Role.YasaklıTag)) return
        let nameData = await Register.findOne({ guildId: member.guild.id, userId: member.id});

    if(!nameData) {
      let newNameData = new Register({
        _id: new mongoose.Types.ObjectId(),
        guildId: member.guild.id,
        userId: member.id,
        registerSize: 0,
        userNames: [{ nick: member.displayName, type: `Sunucudan Ayrılma`}]
      }).save();
    } else {
       nameData.userNames.push({ nick: member.displayName, type: `Sunucudan Ayrılma`})
       nameData.save();
        }
    }
};
