const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const kayıtlar = require("../../models/kayıt.js")
const Config = require("../../Settings/Settings.json")

class RolsüzVer extends Command {
    constructor(client) {
        super(client, {
            name: "rolsuz",
            description: "Latency and API response times.",
            usage: "rolsüz",
            aliases: ["rolsuz","rolsüz"]
        });
    }

    async run(message, args, level) {
        if(!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("VIEW_AUDIT_LOG")) return
        let can = message.guild.members.cache.filter(m => m.roles.cache.filter(r => r.id !== message.guild.id).size == 0)
    
        if(args[0] == "ver") {
            can.forEach(r => {
        r.roles.add(Config.Role.Unregistered)
        })
        const cann = new Discord.MessageEmbed()
        .setAuthor(" "+message.author.username +" ", message.author.avatarURL())
        .setColor("RANDOM")
        .setDescription("Sunucuda rolü olmayan (everyone rolünde olan) \`"+ can.size +"\` kişiye kayıtsız rolü verildi!")
        message.channel.send(cann)
        } else if(!args[0]) {
        const can1 = new Discord.MessageEmbed()
        .setAuthor(""+message.author.username +" ", message.author.avatarURL())
        .setColor("RANDOM")
        .setDescription(`Sunucumuzda rolü olmayan (everyone rolünde olan) \``+ can.size +`\` kişi var. Bu kişilere kayıtsız rolü vermek için \`!rolsüz ver\` komutunu uygulayın!`)
        message.channel.send(can1)
        }
    }
}

module.exports = RolsüzVer;

