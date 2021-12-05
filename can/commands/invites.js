const Command = require("../base/Command.js");
const inviteMemberSchema = require("../models/inviteMember");
const conf = require("../configs/config.json");
const moment = require("moment");
moment.locale("tr");
class Rank extends Command {
    constructor(client) {
        super(client, {
            name: "davet",
            aliases: ["invites", "rank", "davetlerim"]
        });
    }
    async run(message, args, data) {
        if(message.channel.id == conf.General_Chat && !message.member.hasPermission('ADMINISTRATOR')) return message.react(conf.no)
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const data = await inviteMemberSchema.find({ guildID: message.guild.id, inviter: member.user.id });
        const filtered = data.filter(x => message.guild.members.cache.get(x.userID));
       // console.log(filtered)
       embed.setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true }))
       .setFooter(`Can was here!`).setTimestamp()
        embed.setDescription(filtered.length > 0 ? filtered.map(m => `<@${m.userID}>: ${moment(m.date).format("LLL")}`).join("\n") : "İnvite yapmamışsın.");
        message.channel.send(embed);
      
    }
}

module.exports = Rank;