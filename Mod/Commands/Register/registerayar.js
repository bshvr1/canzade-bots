const Command = require("../../base/Command.js");
const moment = require("moment");
const Register = require('../../models/kayıt.js');
const fs = require("fs")
const data = require("../../models/cezalar.js")
const Config = require("../../Settings/Settings.json")
const Ayar = require("../../Settings/RegisterAyar.json")
const { MessageEmbed } = require("discord.js")
class TeyitAyar extends Command {
  constructor(client) {
      super(client, {
          name: "teyit",
          description: "Latency and API response times.",
          usage: "teyit",
          aliases: ["teyit"]
      });
  }
  async run(message, args, client) {
    if(message.author.id !== Config.Permissions.Sahip) return

    let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true, })).setFooter(`${this.client.users.cache.has(Config.Permissions.Sahip) ? this.client.users.cache.get(Config.Permissions.Sahip).tag : "Can"} was here!`).setTimestamp();
   
    if (args[0] == "isimteyit") {

        if (!args[1] || args[1] !== "aç") return message.channel.send(embed.setDescription(`
.isim @Zade Can 22 - .e kayıt formatına geçmek için .teyit isimteyit yazmanız yeterlidir.
Aktif Kayıt Formatı: **${Ayar.İsimteyit ? ".isim @Zade Can 22 - .e" : ".e @Zade Can 22"}!**`));
        Ayar.İsimteyit = true;
        Ayar.Cinsiyetteyit = false;
        fs.writeFile("././Settings/RegisterAyar.json", JSON.stringify(Ayar), (err) => {
          if (err) console.log(err);
        });
        message.channel.send(embed.setDescription(`
**${args[0]}** kayıt formatı, ${message.author} tarafından **${Ayar.İsimteyit ? ".isim @Zade Can 22 - .e" : ".e @Zade Can 22"}**! olarak değiştirildi.`));
       
    }
    if (args[0] == "cinsiyetteyit") {

        if (!args[1] || args[1] !== "aç") return message.channel.send(embed.setDescription(`
.e @Zade Can 22 kayıt formatına geçmek için .teyit cinsiyetteyit yazmanız yeterlidir.
Aktif Kayıt Formatı: **${Ayar.Cinsiyetteyit ? ".e @Zade Can 22" : ".isim @Zade Can 22 - .e"}!**`));
        Ayar.Cinsiyetteyit = true;
        Ayar.İsimteyit = false;
        fs.writeFile("././Settings/RegisterAyar.json", JSON.stringify(Ayar), (err) => {
          if (err) console.log(err);
        });
        message.channel.send(embed.setDescription(`
**${args[0]}** kayıt formatı, ${message.author} tarafından **${Ayar.Cinsiyetteyit ? ".e @Zade Can 22" : ".isim @Zade Can 22 - .e"}**! olarak değiştirildi.`));
    }        
/*1
      if (command === "mod")  {
        if (!args[0] || args[0] !== "cinsiyetteyit") return message.channel.send(embed.setDescription(`.isim @Zade Can 22 - .e kayıt moduna geçmek için .teyit mod isimteyit yazmanız yeterlidirç **${Config.Limit.Cinsiyetteyit ? "Şuanki mod .isim @Zade Can 22 - .e" : "Şuanki mod .e @Zade Can 22"}!**`));
        Config.Limit.Cinsiyetteyit = !Config.Limit.Cinsiyetteyit;
        fs.writeFile("../../Settings/Settings.json", JSON.stringify(Config), (err) => {
          if (err) console.log(err);
        });
        message.channel.send(embed.setDescription(`**${args[0]}** teyit modu, ${message.author} tarafından ${Config.Limit.İsimteyCinsiyetteyitit ? ".isim @Zade Can 22 - .e olarak değiştirildi." : ".isim @Zade Can 22 - .e olarak değiştirildi."}!`));
}*/
}

}


module.exports = TeyitAyar;