const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")

class TeyitSorumlu extends Command {
    constructor(client) {
        super(client, {
            name: "teyitsorumlusu",
            aliases: ["teyit", "teyit-sorumlu", "ts"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if(!user.roles.cache.has(Config.Permissions.Register)) {
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Register}> rolü verildi.`, message.author, message.channel)
            user.roles.add(Config.Permissions.Register)
        } else{
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Register}> rolü alındı.`, message.author, message.channel)
            user.roles.remove(Config.Permissions.Register)
        }
    }
}

module.exports = TeyitSorumlu;
