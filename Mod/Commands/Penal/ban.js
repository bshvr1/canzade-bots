const Command = require("../../base/Command.js");
const moment = require("moment")
const Config = require("../../Settings/Settings.json")
require("moment-duration-format")
const Discord = require("discord.js")
const data = require("../../models/cezalar.js")
class Ban extends Command {
    constructor(client) {
        super(client, {
            name: "ban",
            aliases: ["ban"]
        });
    }

    async run(message, args, perm) {
       if(!message.member.roles.cache.has(Config.Permissions.Ban) && !message.member.hasPermission("VIEW_AUDIT_LOG")) return
        if (args.length < 1) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        let user = message.mentions.users.first() || await this.client.users.fetch(args[0]).catch(e => console.log(e))
        if (!user) return this.client.yolla("Belirttiğiniz kullanıcı geçerli değil.", message.author, message.channel)
        if(user.id === message.author.id) return this.client.yolla("Kendi kendini banlayamazsın.", message.author, message.channel)
        if (message.guild.members.cache.has(user.id) && message.guild.members.cache.get(user.id).hasPermission("VIEW_AUDIT_LOG")) return this.client.yolla("Üst yetkiye sahip kişileri yasaklayamazsın!", message.author, message.channel)
        if (message.guild.members.cache.has(user.id) && message.member.roles.highest.position <= message.guild.members.cache.get(user.id).roles.highest.position) return this.client.yolla("Kendi rolünden yüksek kişilere işlem uygulayamazsın!", message.author, message.channel)
        let reason = args.slice(1).join(" ") || "Sebep Belirtilmedi."
        let count = await data.countDocuments().exec();
        //let can = count ? count++ : 1;
        let can = count
       /* const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setColor("RANDOM")
            .setDescription(`**${user.tag}** kullanıcısı **${message.author.tag}** tarafından başarıyla sunucudan yasaklandı. (Ceza Numarası: \`#${can + 1}\`)`).setImage(Config.Gif.Ban.length > 0 ? Config.Gif.Ban : null);
            await message.channel.send(embed)*/

           const banlandı = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setColor("32CD32")
            .setDescription(`
            ${user ? user.toString() : user.username} üyesi banlandı!

Ceza ID: \`#${can}\`
Banlanan Üye: ${user ? user.toString() : ""} \`(${user.username.replace(/\`/g, "")} - ${user.id})\`
Banlayan Yetkili: ${message.author} \`(${message.author.username.replace(/\`/g, "")} - ${message.author.id})\`
Ban Tarihi: \`${moment(Date.now()).format("LLL")}\`
Ban Sebebi: \`${reason}\`
            `)
         
         
            await this.client.channels.cache.get(Config.Log.Ban).send(banlandı)
            //await this.client.channels.cache.get(Config.Log.Ban).send(` ${this.client.ok} **${user.tag}** adlı kullanıcı __${reason}__ sebebiyle **${message.author.tag}** tarafından yasaklandı.`).catch(e => { })
            await user.send(new Discord.MessageEmbed().setColor("RANDOM").setImage(Config.Gif.Ban.length > 0 ? Config.Gif.Ban : null).setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true })).setDescription(`
                ${message.guild.name} adlı sunucudan ${message.author.tag} tarafından "${reason}" sebebiyle yasaklandınız! (Ceza Numaran: \`#${can + 1}\`)
           ` )).catch(err => {})
           
            message.guild.fetchBans(true).then(async (bans) => {
            let ban = await bans.find(a => a.user.id === user.id)
            if (ban) return this.client.yolla(`**${user.tag}** kullanıcısı zaten yasaklanmış durumda.`, message.author, message.channel)
            if (!ban) {
                let banNum = this.client.banLimit.get(message.author.id) || 0
                this.client.banLimit.set(message.author.id, banNum + 1)
                if (banNum == Config.Limit.Ban) return this.client.yolla("Gün içerisinde çok fazla ban işlemi uyguladığınız için komut geçici olarak kullanımınıza kapatılmıştır.", message.author, message.channel)
                await message.guild.members.ban(user.id, { reason: `${reason} | Yetkili: ${message.author.tag}` })
                await data.find({}).sort({ ihlal: "descending" }).exec(async (err, res) => {
                    const newData = new data({
                        user: user.id,
                        yetkili: message.author.id,
                        ihlal: can + 1,
                        ceza: "Yasaklı",
                        sebep: reason,
                        tarih: moment(Date.now()).format("LLL"),
                        bitiş: "-"
                    })
                    newData.save().catch(e => console.error(e))
                    this.client.savePunishment()
                })
            }
        })
    }
}

module.exports = Ban;
// https://cdn.discordapp.com/attachments/813361327950659585/817791306779852820/giphy_1.gif
