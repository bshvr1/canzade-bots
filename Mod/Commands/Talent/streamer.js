const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
class Streamer extends Command {
    constructor(client) {
        super(client, {
            name: "yayıncı",
            aliases: ["youtuber", "streamer"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if(!user.roles.cache.has(Config.Role.Streamer)) {
            await this.client.yolla(`${user} kişisine <@&${Config.Role.Streamer}> rolü verildi.`, message.author, message.channel)
            user.roles.add(Config.Role.Streamer)
        } else{
            await this.client.yolla(`${user} kişisine <@&${Config.Role.Streamer}> rolü alındı.`, message.author, message.channel)
            user.roles.remove(Config.Role.Streamer)
        }
    }
}

module.exports = Streamer;
