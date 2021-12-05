const Command = require("../../base/Command.js");
const Discord = require("discord.js");
class banner extends Command {
    constructor(client) {
        super(client, {
            name: "banner",
            aliases: ["banner"],
            usage: "banner",
            description: "belirttiğiniz kullanıcın bannerini kanala gönderir."
        });
    }

    async run(message, args, data) {
        const client = this.client
        let user = args.length > 0 ? message.mentions.users.first() || await this.client.users.fetch(args[0]) || message.author : message.author
        const can = await client.api.users(user.id).get();
        message.channel.send(`https://cdn.discordapp.com/banners/${can.id}/${can.banner}?size=512`)
    }
}

module.exports = banner;