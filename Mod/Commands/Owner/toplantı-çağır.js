const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const Config = require("../../Settings/Settings.json")

class Toplantıçağır extends Command {
    constructor(client) {
        super(client, {
            name: "toplantıçağır",
            aliases: ["toplantıçağır"],
        });
    }


    async run(message, args, level) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return
        let enAltYetkiliRolü = message.guild.roles.cache.get(Config.Permissions.En_Alt_Yetkili); // EN ALT YETKILI ROLUNUN IDSI BURAYA
        let yetkililer = message.guild.members.cache.filter(uye => !uye.user.bot && uye.roles.highest.position >= enAltYetkiliRolü.position && uye.presence.status !== "offline" && !uye.voice.channel).array();
        if (yetkililer.length == 0) return message.reply('Aktif olup, seste olmayan yetkili bulunmuyor. Maşallah!');
        let mesaj = await message.channel.send(`**${yetkililer.length}** yetkiliye sese gelme çağırısı yapılıyor`);
        var filter = m => m.author.id === message.author.id && m.author.id !== client.user.id && !m.author.bot;
            yetkililer.forEach((yetkili, index) => {
              setTimeout(() => {
                yetkili.send(message.guild.name+' Sunucusunda toplantı başladı. Yetkili olduğun halde toplantıda değilsin. Eğer toplantıya girmezsen yetkilerin alınacaktır.').then(x => mesaj.edit(new Discord.MessageEmbed().setDescription(`${yetkili} yetkilisine özelden mesaj atıldı!`).setColor(message.member.displayHexColor))).catch(err => message.channel.send(`${yetkili}, Sunucusunda toplantı başladı. Yetkili olduğun halde toplantıda değilsin. Eğer toplantıya girmezsen yetkilerin alınacaktır.`).then(x => mesaj.edit(new Discord.MessageEmbed().setDescription(`${yetkili} yetkilisine özelden mesaj atılamadığı için kanalda etiketlendi!`).setColor(message.member.displayHexColor))));
              }, index*1000);
            });
    }
}

module.exports = Toplantıçağır
