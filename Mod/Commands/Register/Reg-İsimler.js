const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
const Register = require('../../models/kayıt.js');
const Discord = require("discord.js")
class İsimler extends Command {
  constructor(client) {
      super(client, {
          name: "isimler",
          description: "Latency and API response times.",
          usage: "erkek",
          aliases: ["nicks"]
      });
  }
  async run(message, args, level) {

  
  if(!message.member.roles.cache.has(Config.Permissions.Register) && !message.member.hasPermission("VIEW_AUDIT_LOG")) return


  let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
  if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)

  let registerModel = await Register.findOne({
    guildId: message.guild.id, 
    userId: user.id
  });
  if (!registerModel) registerModel = await Register.create({
      guildId: message.guild.id,
      userId: user.id,
      userNames: []
    });
  if(!registerModel.userNames.length) return this.client.yolla("Bu üyenin geçmiş isimleri bulunamadı.", user.user, message.channel)
  let embed = new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }));
  message.channel.send(embed.setDescription(`${user} Adlı üyenin ${registerModel.userNames.length} isim kayıtı bulundu. \n\n${registerModel.userNames.map(x => `\`• ${x.nick}\` (${x.type.replace(`Erkek`, `<@&${Config.Role.Man[0]}>`).replace(`Kız`, `<@&${Config.Role.Woman[0]}>`)})`).join("\n ")}`))

  }

}

module.exports = İsimler;
