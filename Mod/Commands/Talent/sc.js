const Command = require("../../base/Command.js");
const Config = require("../../Settings/Settings.json")

class SoruCevap extends Command {
    constructor(client) {
        super(client, {
            name: "sc",
            aliases: ["sc"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[1], message.guild)
        if(!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if (!args[0]) return this.client.yolla("Rol verme biçimini belirt ve tekrar dene. \`Örnek kullanım: !vk sorumlu @Zade/ID - !vk cezalı @Zade/ID\`", message.author, message.channel)

        if (args[0] == "sorumlu") {
            if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
            if (!user.roles.cache.has(Config.Role.Sc_Sorumlu)) {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.Sc_Sorumlu}> rolü verildi.`, message.author, message.channel)
                user.roles.add(Config.Role.Sc_Sorumlu)
            } else {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.Sc_Sorumlu}>  rolü alındı.`, message.author, message.channel)
                user.roles.remove(Config.Role.Sc_Sorumlu)
            }
        }

        if (args[0] == "denetleyici") {
            if (!message.member.roles.cache.has(Config.Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
            if (!user.roles.cache.has(this.client.Role.Sc_Denetliyici)) {
                await this.client.yolla(`${user} kişisine <@&${this.client.Role.Sc_Denetliyici}>  rolü verildi.`, message.author, message.channel)
                user.roles.add(this.client.Role.Sc_Denetliyici)
            } else {
                await this.client.yolla(`${user} kişisine <@&${this.client.Role.Sc_Denetliyici}>  rolü alındı.`, message.author, message.channel)
                user.roles.remove(this.client.Role.Sc_Denetliyici)
            }
        }

       /* if (args[0] == "elit") {
            if (!message.member.roles.cache.some(r => Permissions.Trident) && !message.member.hasPermission("ADMINISTRATOR")) return
            if (!user.roles.cache.has("740233528741986331")) {
                await this.client.yolla(`${user} kişisine <@&740233528741986331> rolü verildi.`, message.author, message.channel)
                user.roles.add("740233528741986331")
            } else {
                await this.client.yolla(`${user} kişisine <@&740233528741986331> rolü alındı.`, message.author, message.channel)
                user.roles.remove("740233528741986331")
            }
        }
*/

        if (args[0] == "cezalı") {
            if (!user.roles.cache.has(Config.Role.Sc_Cezalı)) {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.Sc_Cezalı}> rolü verildi.`, message.author, message.channel)
                user.roles.add(Config.Role.Sc_Cezalı)
            } else {
                await this.client.yolla(`${user} kişisine <@&${Config.Role.Sc_Cezalı}> rolü alındı.`, message.author, message.channel)
                user.roles.remove(Config.Role.Sc_Cezalı)
            }
        }
    }
}

module.exports = SoruCevap;
