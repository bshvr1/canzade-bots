const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
class PublicSorumlusu extends Command {
    constructor(client) {
        super(client, {
            name: "pubsorumlusu",
            aliases: ["pub", "public-sorumlu", "ps","public"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if(!user.roles.cache.has(Config.Permissions.Pub_Sorumlusu)) {
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Pub_Sorumlusu}> rolü verildi.`, message.author, message.channel)
            user.roles.add(Config.Permissions.Pub_Sorumlusu)
        } else{
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Pub_Sorumlusu}> rolü alındı.`, message.author, message.channel)
            user.roles.remove(Config.Permissions.Pub_Sorumlusu)
        }
    }
}

module.exports = PublicSorumlusu;
