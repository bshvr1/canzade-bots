const roller = require("../models/rollog.js")
const moment = require("moment")
const Config = require("../Settings/Settings.json")
const Discord = require("discord.js")
module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(oldMember, newMember) {
        await newMember.guild.fetchAuditLogs({
            type: "MEMBER_ROLE_UPDATE"
        }).then(async (audit) => {
            let ayar = audit.entries.first()
            let hedef = ayar.target
            let yapan = ayar.executor
            if (yapan.bot) return
            newMember.roles.cache.forEach(async role => {
                if (!oldMember.roles.cache.has(role.id)) {
                    const emed = new Discord.MessageEmbed()
                        .setAuthor(hedef.tag, hedef.displayAvatarURL({ dynamic: true }))
                        .setColor("RANDOM")
                        .setDescription(`
                        **Rol Eklenen kişi**\n ${hedef} - **${hedef.id}** `)
                        .addField(`${this.client.ok} Rolü Ekleyen Kişi`, `${yapan} - **${yapan.id}**`, false)
                        .addField(`${this.client.ok} Eklenen Rol`, `${role} - **${role.id}**`, false)
                        .setFooter(yapan.tag, yapan.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                    this.client.channels.cache.get(Config.Log.Role).send(emed)
                    roller.findOne({
                        user: hedef.id
                    }, async (err, res) => {
                        if (!res) {
                            let arr = []
                            arr.push({
                                rol: role.id,
                                mod: yapan.id,
                                tarih: moment(Date.now()).format("LLL"),
                                state: "Ekleme"
                            })
                            let newData = new roller({
                                user: hedef.id,
                                roller: arr
                            })
                            newData.save().catch(e => console.log(e))
                        } else {
                            res.roller.push({
                                rol: role.id,
                                mod: yapan.id,
                                tarih: moment(Date.now()).format("LLL"),
                                state: "Ekleme"
                            })
                            res.save().catch(e => console.log(e))
                        }
                    })
                }
            });
            oldMember.roles.cache.forEach(async role => {
                if (!newMember.roles.cache.has(role.id)) {
                    const emeed = new Discord.MessageEmbed()
                        .setAuthor(hedef.tag, hedef.displayAvatarURL({ dynamic: true }))
                        .setColor("RANDOM")
                        .setDescription(`
                        **Rolü Alınan kişi** \n${hedef} - **${hedef.id}**`)
                        .addField(`${this.client.no} Rolü Alan Kişi`, `${yapan} - **${yapan.id}**`, false)
                        .addField(`${this.client.no} Alınan Rol`, `${role} - **${role.id}**`, false)
                        .setFooter(yapan.tag, yapan.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                    this.client.channels.cache.get(Config.Log.Role).send(emeed)
                    roller.findOne({
                        user: hedef.id
                    }, async (err, res) => {
                        if (!res) {
                            let arr = []
                            arr.push({
                                rol: role.id,
                                mod: yapan.id,
                                tarih: moment(Date.now()).format("LLL"),
                                state: "Kaldırma"
                            })
                            let newData = new roller({
                                user: hedef.id,
                                roller: arr
                            })
                            newData.save().catch(e => console.log(e))
                        } else {
                            res.roller.push({
                                rol: role.id,
                                mod: yapan.id,
                                tarih: moment(Date.now()).format("LLL"),
                                state: "Kaldırma"
                            })
                            res.save().catch(e => console.log(e))
                        }
                    })
                }
            });
        })
    }
};
