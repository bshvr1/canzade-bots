const inviterSchema = require("../schemas/inviter");
const inviteMemberSchema = require("../schemas/inviteMember");
const conf = require("../configs/config.json");
module.exports = class {
    constructor(client) {
      this.client = client;
    }
    
    async run(member) {
        const channel = member.guild.channels.cache.get(conf.invLogChannel);
        if (!channel) return;
        if (member.user.bot) return;
      
      
      
        const inviteMemberData = await inviteMemberSchema.findOne({ guildID: member.guild.id, userID: member.user.id });
        if (!inviteMemberData) {
          channel.send(`\`${member.user.tag}\` sunucumuzdan ayrıldı ama kim tarafından davet edildiğini bulamadım.`);
        } else {
          const inviter = await this.client.users.fetch(inviteMemberData.inviter);
          await inviterSchema.findOneAndUpdate({ guildID: member.guild.id, userID: inviter.id }, { $inc: { leave: 1, total: -1 } }, { upsert: true });
          const inviterData = await inviterSchema.findOne({ guildID: member.guild.id, userID: inviter.id, });
          const toplam = inviterData ? inviterData.total : 0;
          channel.send(`\`${member.user.tag}\` sunucumuzdan ayrıldı. Davet eden kişi ${inviter.tag} (**${toplam}** davet)`);
        }
      }
    }