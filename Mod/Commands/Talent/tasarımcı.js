const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
class Ressam extends Command {
    constructor(client) {
        super(client, {
            name: "tasarımcı",
            aliases: ["ressam", "tasarımcı"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if(!user.roles.cache.has(Config.Role.Tasarımcı)) {
            await this.client.yolla(`${user} kişisine <@&${Config.Role.Tasarımcı}> rolü verildi.`, message.author, message.channel)
            user.roles.add(Config.Role.Tasarımcı)
        } else{
            await this.client.yolla(`${user} kişisine <@&${Config.Role.Tasarımcı}> rolü alındı.`, message.author, message.channel)
            user.roles.remove(Config.Role.Tasarımcı)
        }
    }
}

module.exports = Ressam;
