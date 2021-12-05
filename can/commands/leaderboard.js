const Command = require("../base/Command.js");
const db = require("../models/inviter");
const conf = require("../configs/config.json");
class Leaderboard extends Command {
    constructor(client) {
        super(client, {
            name: "leaderboard",
            aliases: ["top-invites", "top-inv"]
        });
    }

    async run(message, args, data) {
        if(message.channel.id == conf.General_Chat && !message.member.hasPermission('ADMINISTRATOR')) return message.react(conf.no)
        let data = await db.find({ guildID: message.guild.id }).sort({ total: -1 });
        if (!data.length)return message.channel.send(embed.setDescription("Herhangi bir invite verisi bulunamadı!"));
        let arr = [];
        data.forEach((x) => arr.push({ id: x.userID, total: x.total }));
        let index = arr.findIndex((x) => x.id == message.author.id) + 1;
    
        let list = data
          .filter((x) => message.guild.members.cache.has(x.userID))
          .splice(0, 10)
          .map((x, index) => `${x.userID === message.author.id ? `**${index + 1}.** <@${x.userID}> **${x.total}** davet. (**${x.regular}** gerçek, **${x.leave}** ayrılmış, **${x.fake}** fake, **${x.bonus}** bonus.)` : `**${index + 1}.** <@${x.userID}> **${x.total}** davet. (**${x.regular}** gerçek, **${x.leave}** ayrılmış, **${x.fake}** fake, **${x.bonus}** bonus.)`}`)
          .join("\n");
    
        const veri = await db.findOne({ guildID: message.guild.id, userID: message.author.id });
        if (index < 10) {
          embed.setDescription(list);
          embed.setAuthor("Davet Sıralaması", message.guild.iconURL({dynamic: true})).setFooter(message.member.displayName + " tarafından istendi!", message.author.displayAvatarURL({dynamic: true})).setThumbnail().setFooter(`Can was here!`).setTimestamp()
          message.channel.send(embed);
        } else {
          embed.setDescription( `${list} \n... \n**${index}.** ${message.author} **${veri.total}** davet. (**${veri.regular}** gerçek, **${veri.leave}** ayrılmış, **${veri.fake}** fake, **${veri.bonus}** bonus.)`);
          message.channel.send(embed);
        }
      }// ${veri.bonus} bonus,
    
}

module.exports = Leaderboard;