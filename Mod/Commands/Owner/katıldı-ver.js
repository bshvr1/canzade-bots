const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
const Discord = require("discord.js");
class Toplantı extends Command {
    constructor(client) {
        super(client, {
            name: "yoklama",
            aliases: ["yoklama"]
        });
    }

    async run(message, args, level) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return
        let embed = new Discord.MessageEmbed().setAuthor(message.member.displayName, message.author.avatarURL({dynamic: true})).setColor("RANDOM").setTimestamp();
        if(!message.member.voice || message.member.voice.channelID != Config.Log.Toplantı) return;
        
        let members = message.guild.members.cache.filter(member => member.roles.cache.has(Config.Log.Toplantı) && member.voice.channelID != Config.Log.Toplantı);
        members.array().forEach((member, index) => {
          setTimeout(() => {
            member.roles.remove(Config.Role.Katıldı).catch();
          }, index * 1250)
        });
        let verildi = message.member.voice.channel.members.filter(member => !member.roles.cache.has(Config.Role.Katıldı) && !member.user.bot)
        verildi.array().forEach((member, index) => {
          setTimeout(() => {
            member.roles.add(Config.Role.Katıldı).catch();
          }, index * 1250)
        });
        message.channel.send(embed.setDescription(`Toplantıda olan yetkililere katıldı permi verilmeye başlandı! \n\n Rol Verilecek Yetkili Sayısı: **${verildi.size}** \n Rol Alınacak Yetkili Sayısı: **${members.size}**`)).catch()
        return message.channel.send("Toplantıda olan tüm yetkililere katıldı permi verildi, Toplantıya gelip katıldı permini alan kişilerden ise katıldı permi alındı.")

    }
}
module.exports = Toplantı