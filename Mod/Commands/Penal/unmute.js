const Command = require("../../base/Command.js");
const data = require("../../models/cezalar.js")
const ms = require("ms")
const moment = require("moment")
require("moment-duration-format")
const Discord = require("discord.js")
moment.locale("tr")
const can = require("pretty-ms");
const mutes = require("../../models/voicemute.js")
const Config = require("../../Settings/Settings.json")
const sunucu = require("../../models/sunucu-bilgi.js")
const wmute = require("../../models/waitMute.js")
class Unmute extends Command {
    constructor(client) {
        super(client, {
            name: "unmute",
            aliases: ["unmute","unchatmute","cunmute","chatunmute","unvoicemute","vunmute","voiceunmute","unvmute","uncmute"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.ChatMute) && !message.member.hasPermission("VIEW_AUDIT_LOG")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if(message.author.id == user.id) return
        if (!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        if (user.voice.serverMute == true) {
            message.react(Config.Others.CheckTick)
            user.voice.setMute(false)
        } else {
           // message.react(Config.Others.RedTick)
        }
        if (user.roles.cache.has(Config.Role.ChatMute)) {
            user.roles.remove(Config.Role.ChatMute)
            message.react(Config.Others.CheckTick)
        } else {
            message.react(Config.Others.RedTick)
        }

    }
}

module.exports = Unmute;
