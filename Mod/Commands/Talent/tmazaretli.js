const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")

class Mazaretli extends Command {
    constructor(client) {
        super(client, {
            name: "mazaretli",
            aliases: ["mazaretli","mazeretli","tmazaretli","tmazeretli","t-mazaretli","t-mazeretli","toplantı-mazeretli","toplantı-mazaretli"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if(!user.roles.cache.has(Config.Permissions.Mazaretli)) {
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Mazaretli}> rolü verildi.`, message.author, message.channel)
            user.roles.add(Config.Permissions.Mazaretli)
        } else{
            await this.client.yolla(`${user} kişisine <@&${Config.Permissions.Mazaretli}> rolü alındı.`, message.author, message.channel)
            user.roles.remove(Config.Permissions.Mazaretli)
        }
    }
}

module.exports = Mazaretli;
