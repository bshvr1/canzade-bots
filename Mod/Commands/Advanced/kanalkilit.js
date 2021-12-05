const Command = require("../../base/Command.js")
const { MessageEmbed } = require("discord.js")
const Config = require("../../Settings/Settings.json")
const Ayar = require("../../Settings/RegisterAyar.json")
const fs = require("fs")
class Kanal2 extends Command {
    constructor(client) {
        super(client, {
            name: "kanal",
            aliases: ["kanal","kilit"]
        });
    }

    async run(message, args, perm) {
if(!message.member.roles.cache.has(Config.Permissions.Guild_Owner) && !message.member.hasPermission("ADMINISTRATOR")) return

let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true, })).setFooter(`${this.client.users.cache.has(Config.Permissions.Sahip) ? this.client.users.cache.get(Config.Permissions.Sahip).tag : "Can"} was here!`).setTimestamp();
if (!args[0]) return this.client.yolla(`Yanlış Argüman Kullandınız!  

**!kilit register aç-kapat** = Register kategorisindeki tüm kanallara mesaj gönderme, ses kanalına bağlanma yetkisini ve teyit sistemini kapatır, açar.

**!kilit chat aç-kapat** = Komutu kullandığınız kanaldaki mesaj gönderme izinlerini kapatıp, açar.`, message.author, message.channel)


  let channels = message.guild.channels.cache.filter(ch => ch.parentID == Config.Parent.Register);
  if (args[0] === "chat")  {
  if (args[1] == "kilit" || args[1] == "kapat" || args[1] == "kilitle") {
    message.channel.updateOverwrite(message.guild.id, {
        SEND_MESSAGES: false
    }).then(async() => {
        message.react("🔒")
        await this.client.yolla("Kanal başarıyla kilitlendi.", message.author, message.channel)
    })
}

if (args[1] == "aç") {
    message.channel.updateOverwrite(message.guild.id, {
        SEND_MESSAGES: true
    }).then(async() => {
        message.react("🔓")
        await this.client.yolla("Kanalın kilidi başarıyla açıldı.", message.author, message.channel)
    })
}
  }
  if (args[0] === "register")  {
  if (args[1] == "aç") {
{
    Ayar.Register = true;{
        channels.forEach(ch => {
          ch.updateOverwrite(Config.Role.Unregistered, {
              SEND_MESSAGES: true,
              CONNECT: true
          });
      });
      fs.writeFile("././Settings/RegisterAyar.json", JSON.stringify(Ayar), (err) => {
          if (err) console.log(err);
        }); 
    message.channel.send(embed.setDescription(`Teyit kanalı ve teyit sistemi açıldı.`));
    } 
} 
  }
  if (args[1] == "kapat") { 
        
    Ayar.Register = false;
    channels.forEach(ch => {
        ch.updateOverwrite(Config.Role.Unregistered, {
            SEND_MESSAGES: false,
            CONNECT: false
        });
    });
    fs.writeFile("././Settings/RegisterAyar.json", JSON.stringify(Ayar), (err) => {
      if (err) console.log(err);
    });
    message.channel.send(embed.setDescription(`Teyit kanalları ve teyit sistemi kapatıldı.`));
}
  }


}


}



module.exports = Kanal2;
