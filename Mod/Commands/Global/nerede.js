const Command = require("../../base/Command.js");
const Discord = require("discord.js");

class Nerede extends Command {
    constructor(client) {
        super(client, {
            name: "nerede",
            aliases: ["n"]
        });
    }

    async run(message, args, data) {
    let can;
    var cannn = message.mentions.members.first();
    if (cannn) {
        can = cannn;
    } else {
        can = message.guild.members.cache.get(args[0]);
    }
    
    if (!can) return this.client.yolla(`Bir üye etiketle ve tekrardan dene!`, message.author, message.channel);
    let cann = ``;
    if (!can.voice.channel) {
        cann = `Belirtilen kullanıcı hiçbir kanalda bulunmamaktadır.`;
        
    } else {
        let süresi = this.client.channelTime.get(can.id) || {channel: can.voice.channel.name, time: "Yok"}
        let selfMt = can.voice.selfMute ? "**Mikrofonu: Kapalı**" : "**Mikrofonu: Açık**";
        let selfDf = can.voice.selfDeaf ? "**Kulaklığı: Kapalı**" : "**Kulaklığı: Açık**";
        let asd = await can.voice.channel.createInvite({maxUses: 1});
        cann = "<#" + can.voice.channel + ">" + " kanalında. " +  selfMt +"" + ", "+ selfDf +" \n```"+" Aktif Bilgiler: ```"+"\n" + "<#"+can.voice.channel+">"+" kanalına ``"+await this.client.turkishDate(Date.now() - süresi.time)+"``"+" önce giriş yapmış.";

    };//[tıklaman](https://discord.gg/"+asd.code+") yeterli.
    let xxx = message.guild.channels.cache.get(can.lastMessageChannelID);
    if (!xxx) {
        xxx = `Bulunamadı`;
    };
    const embed = new Discord.MessageEmbed().setColor("RANDOM").setAuthor(can.user.tag, can.user.avatarURL({ dynamic: true }))
    .setDescription(`${can} kişisi ${cann} \n${xxx} son olarak görüldüğü kanal. `)
    message.channel.send(embed);

}

}
module.exports = Nerede;
