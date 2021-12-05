const Command = require("../base/Command.js");
const inviterSchema = require("../models/inviter");
const inviteMemberSchema = require("../models/inviteMember");
const settings = require("../configs/settings.json");
const moment = require("moment");
const conf = require("../configs/config.json");
class Bonus extends Command {
    constructor(client) {
        super(client, {
            name: "bonus",
            aliases: ["bonus"]
        });
    }
    async run(message, args) {
        if(message.channel.id == conf.General_Chat && !message.member.hasPermission('ADMINISTRATOR')) return message.react(conf.no)
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
    if (message.author.id === settings.owners)
    if (!member) return message.reply("bir üye belirtmelisin!");

    if (args[0] === "ekle" || args[0] === "add") {
      if (!message.member.hasPermission(8)) return;
      const amount = args[2];
      if (!amount) return message.reply("bir miktar belirtmelisin!");
      await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: member.user.id }, { $inc: { total: parseInt(amount), bonus: parseInt(amount) } }, { upsert: true });
      message.channel.send(embed.setDescription(`${member.toString()} üyesine ${amount} adet bonus davet eklendi!`));
    } else if (args[0] === "sil" || args[0] === "delete") {
      if (!message.member.hasPermission(8)) return;
      const amount = args[2];
      if (!amount) return message.reply("bir miktar belirtmelisin!");
      const data = await inviterSchema.findOne({ guildID: message.guild.id, userID: member.user.id });
      if (!data) return message.reply("bu kişinin invite verisi bulunmuyor!");
      else {
        data.total -= parseInt(amount);
        data.bonus -= parseInt(amount);
        data.save();
      }
      message.channel.send(embed.setDescription(`${member.toString()} üyesinden ${amount} adet bonus davet çıkarıldı!`));
    } else if (args[0] === "sorgu" || args[0] === "query") {
      const data = await inviteMemberSchema.findOne({ guildID: message.guild.id, userID: member.user.id });
      if (!data) return message.reply("bu kişiyi kimin davet ettiğini bulamadım!");
      else {
        const inviter = await client.users.fetch(data.inviter);
        embed.setThumbnail(member.user.avatarURL({ dynamic: true }));
        message.channel.send(embed.setDescription(`${member.toString()} üyesi, ${moment(data.date).format("LLL")} tarihinde \`(${inviter.username} - ${inviter.id})\` tarafından davet edilmiş.`));
      }
    }
  }
};

module.exports = Bonus;