const Command = require("../../base/Command.js")
const Config = require("../../Settings/Settings.json");
class Durum extends Command {
    constructor(client) {
        super(client, {
            name: "durum",
            aliases: []
        });
    }

    async run(message, args, data) {
        if (!message.member.hasPermission("VIEW_AUDIT_LOG")) return
        let rol = message.guild.roles.cache.find(x => x.name == "ζ Dynasty").members.size
        let members = message.guild.members.cache.size
        let tag = this.client.users.cache.filter(x => x.username.includes(Config.Guild.Tag)).size + 10
        let online = message.guild.members.cache.filter(m => m.presence.status !== "offline").size
        message.channel.send("Olivia " + members + " toplam üyeye sahip. %" + parseInt(((members - rol) / members) * 100) + " kayıtlı, %" + parseInt((rol / members) * 100) + " kayıtsız, %" + parseInt((online / members) * 100) + " çevrim içi ve %" + parseInt((tag / members) * 100) + " taglı.");

    }

};

module.exports = Durum;
