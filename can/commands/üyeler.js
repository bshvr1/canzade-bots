const Command = require("../base/Command.js");
const { MessageEmbed } = require("discord.js");
const inviterSchema = require("../schemas/inviter");
const inviteMemberSchema = require("../schemas/inviteMember");
const conf = require("../configs/config.json");
const settings = require('../configs/settings.json');
class Üyeler extends Command {
    constructor(client) {
        super(client, {
            name: "inv-log",
            aliases: ["uyeler", "sondavet", "üyeler"]
        });
    }

    async run(message, args) {
        if(message.channel.id == conf.General_Chat && !message.member.hasPermission('ADMINISTRATOR')) return message.react(conf.no)
  
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const inviterData = await inviterSchema.findOne({ guildID: message.guild.id, userID: member.user.id });
        const total = inviterData ? inviterData.total : 0;
        const regular = inviterData ? inviterData.regular : 0;
        const bonus = inviterData ? inviterData.bonus : 0;
        const leave = inviterData ? inviterData.leave : 0;
        const fake = inviterData ? inviterData.fake : 0;
        const invMember = await inviteMemberSchema.find({ guildID: message.guild.id, inviter: member.user.id });
        const daily = invMember ? message.guild.members.cache.filter((m) => invMember.some((x) => x.userID === m.user.id) && Date.now() - m.joinedTimestamp < 1000 * 60 * 60 * 24).size : 0;
        const weekly = invMember ? message.guild.members.cache.filter((m) => invMember.some((x) => x.userID === m.user.id) && Date.now() - m.joinedTimestamp < 1000 * 60 * 60 * 24 * 7).size : 0;
        let tagged;
        if (conf.tag && conf.tag.length > 0) tagged = invMember ? message.guild.members.cache.filter((m) => invMember.some((x) => x.userID === m.user.id) && m.user.username.includes(conf.tag)).size : 0;
        else tagged = 0;
    
        const embed = new MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true }))
          .setFooter(`Can was here!`).setTimestamp()
          .setDescription(`
          Toplam **${total}** davete sahip! (**${regular}** gerçek, **${fake}** fake, **${leave}** ayrılmış, **${tagged}** taglı, **${daily}** günlük, **${bonus}** bonus.)
          
          `);
         // \` Haftalık: ${weekly}, Taglı: ${tagged}\`
    
        message.channel.send(embed);
      }
    }

module.exports = Üyeler; 