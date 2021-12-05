const Command = require("../../base/Command.js");
const data = require("../../models/cezalar.js")
const uyarılar = require("../../models/uyar.js")
const ms = require("ms")
const Config = require("../../Settings/Settings.json")
const moment = require("moment")
const sunucu = require("../../models/sunucu-bilgi")
require("moment-duration-format")
moment.locale("tr")
const { table } = require('table');
const uyar = require("../../models/uyar.js");
class Uyar extends Command {
    constructor(client) {
        super(client, {
            name: "uyar",
            aliases: ["uyar"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.roles.cache.has(Config.Permissions.Warn) && !message.member.hasPermission("ADMINISTRATOR")) return
        let user = message.mentions.members.first() || await this.client.üye(args[0], message.guild)
        if (!user) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel)
        let sebep = args.slice(1).join(" ")
        if(!sebep) return this.client.yolla("Kullanıcının uyarı sebebini belirtmelisin.", message.author, message.channel)
        if (sebep && (await this.client.chatKoruma(sebep))) return message.reply('Sebep olarak reklam veya küfür yazamazsınız. Lütfen geçerli bir sebep girip yeniden deneyin. ')
        let count = await data.countDocuments().exec();
        let can = count
        uyarılar.findOne({user: user.id}, async(err,res) => {
            if(!res) {
                let arr = []
                arr.push({mod: message.author.id, sebep: sebep, tarih: moment(Date.now()).format("LLL")})
                const newWarn = new uyarılar({
                    user: user.id,
                    uyarılar: arr
                })
                newWarn.save().catch(e => console.log(e))
                user.roles.add(Config.Role.Warn)
                await data.find({}).sort({ ihlal: "descending" }).exec(async (err, res) => {
                    const newData = new data({
                        user: user.id,
                        yetkili: message.author.id,
                        ihlal: can + 1,
                        ceza: "Uyarı",
                        sebep: sebep,
                        tarih: moment(Date.now()).format("LLL"),
                        bitiş: "-"
                    })
                    newData.save().catch(e => console.error(e))
                    this.client.savePunishment()
                })
                message.channel.send(`${this.client.ok} ${user} kişisine **${sebep}** sebebiyle ilk uyarısı verildi.Kullanıcının ceza puanı \`${await this.client.punishPoint(user.id) + 3}\` oldu.`)
                await this.client.channels.cache.get(Config.Log.CezaPuan).send(`${user}; adlı üye aldığınız **#${can + 1}** ID'li ceza ile **${await this.client.punishPoint(user.id) + 3}** ulaştınız.`).catch(e => { })

            } else {
                res.uyarılar.push({mod: message.author.id, sebep: sebep, tarih: moment(Date.now()).format("LLL")})
                res.save().catch(e => console.log(e))
                await data.find({}).sort({ ihlal: "descending" }).exec(async (err, res) => {
                    const newData = new data({
                        user: user.id,
                        yetkili: message.author.id,
                        ihlal: can + 1,
                        ceza: "Uyarı",
                        sebep: sebep,
                        tarih: moment(Date.now()).format("LLL"),
                        bitiş: "-"
                    })
                    newData.save().catch(e => console.error(e))
                    this.client.savePunishment()
                })
                if(res.uyarılar.length == 2) {
                    message.channel.send(`${this.client.ok} ${user} kişisine **${sebep}** sebebiyle 2. uyarısı verildi.Kullanıcının ceza puanı \`${await this.client.punishPoint(user.id) + 3}\` oldu.`)
                    user.roles.remove(Config.Role.Warn)
                    user.roles.add(Config.Role.Warn2)
                }
                if(res.uyarılar.length == 3) {
                    message.channel.send(`${this.client.ok} ${user} kişisine **${sebep}** sebebiyle 3. uyarısı verildi.Kullanıcının ceza puanı \`${await this.client.punishPoint(user.id) + 3}\` oldu.`)
                    user.roles.remove(Config.Role.Warn2)
                    user.roles.add(Config.Role.Warn3)
                }

            }

        })
      
    }
}

module.exports = Uyar;
