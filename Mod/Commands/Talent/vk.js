const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")
class VampirKöylü extends Command {
    constructor(client) {
        super(client, {
            name: "vk",
            aliases: ["vk"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[1], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if (!args[0]) return this.client.yolla("Rol verme biçimini belirt ve tekrar dene. \`Örnek kullanım: !vk sorumlu @Zade/ID - !vk cezalı @Zade/ID\`", message.author, message.channel)

        if (args[0] == "sorumlu") {
            if (!message.member.roles.cache.has(Config.Role.VK_SORUMLU) && !message.member.hasPermission("ADMINISTRATOR")) return
            if (!user.roles.cache.has(Config.Role.VK_SORUMLU)) {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.VK_SORUMLU}> rolü verildi.`, message.author, message.channel)
                user.roles.add(Config.Role.VK_SORUMLU)
            } else {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.VK_SORUMLU}> rolü alındı.`, message.author, message.channel)
                user.roles.remove(Config.Role.VK_SORUMLU)
            }
        }
        if (args[0] == "cezalı") {
            if (!user.roles.cache.has(Config.Role.VK_CEZALI)) {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.VK_CEZALI}> rolü verildi.`, message.author, message.channel)
                user.roles.add(Config.Role.VK_CEZALI)
            } else {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.VK_CEZALI}> rolü alındı.`, message.author, message.channel)
                user.roles.remove(Config.Role.VK_CEZALI)
            }
        }
    }
}

module.exports = VampirKöylü;
