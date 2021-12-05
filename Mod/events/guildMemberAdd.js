/*const cezalar = require("../models/cezalı.js")
const Discord = require("discord.js")
const Config = require("../Settings/Settings.json")
const data = require("../models/yasaklıtag.js")
const mute = require("../models/chatmute.js")
const ms = require("ms")
const moment = require("moment")
require("moment-duration-format")
moment.locale("tr")
module.exports = class {
    constructor(client) {
        this.client = client;
    }

      async run(member) {
        if (Date.now() - member.user.createdTimestamp < ms("5d")) {
          member.roles.add(Config.Role.Suspect)

            this.client.channels.cache.get(Config.Log.Suspect).send(new Discord.MessageEmbed().setFooter(moment(Date.now()).format("LLL")).setColor("RANDOM").setDescription(`
Şüpheli Kişi: ${member} - **${member.id}**

Kişinin hesabı 5 günden önce açıldığı için Şüpheliye atıldı.
`))
 
 } else 
 if(Config.Permissions.Sahip) {
 await data.findOne({ guild: member.guild.id }, async (err, res) => {
  res.taglar.forEach(async x => {
    
    if (member.user.username.includes(x)) { // && !member.roles.cache.has(Config.Role.Yasalıtag) 
      await member.roles.set(member.roles.cache.has(Config.Role.Booster) ? [Config.Role.Booster, Config.Role.Yasaklıtag] : [Config.Role.Yasaklıtag]).catch();
      member.send("Sunucumuzda yasaklı olan bir tagı ismine aldığın için sunucuya erişimin kısıtlandı. Aldığın tagı çıkarttığında sunucumuza tekrardan erişebileceksin, seni seviyor ve sayıyoruz.").catch(err => {})
    }
    }) 
  })  
}else

  cezalar.findOne({ user: member.id }, async (err, res) => {
            if (!res) {
                setTimeout(() => {
                member.roles.add(Config.Role.Unregistered)
                if (member.user.username.includes(Config.Guild.Tag)) member.roles.add(Config.Role.Family_Role);
                }, 1500);
                } else
                 if (res.ceza == true) {
                    await member.roles.add(Config.Role.Jail)
                  await member.roles.remove(Config.Role.Unregistered)
                 // member.roles.remove(Config.Role.Suspect)
                } 
        })
        mute.findOne({ user: member.id }, async (err, res) => {
            if (!res) return
            if (res.muted == true) {
                member.roles.add(Config.Role.ChatMute)
            }
        })
    }
};
*/

const cezalar = require("../models/cezalı.js")
const Discord = require("discord.js")
const Config = require("../Settings/Settings.json")
const data = require("../models/yasaklıtag.js")
const mute = require("../models/chatmute.js")
const ms = require("ms")
const moment = require("moment")
require("moment-duration-format")
moment.locale("tr")
module.exports = class {
    constructor(client) {
        this.client = client;
    }

      async run(member) {
        if (member.user.bot) return;
        if (Date.now() - member.user.createdTimestamp <= 1000 * 60 * 60 * 24 * 7) {
        await member.roles.add(Config.Role.Suspect)

            this.client.channels.cache.get(Config.Log.Suspect).send(new Discord.MessageEmbed().setFooter(moment(Date.now()).format("LLL")).setColor("RANDOM").setDescription(`
Şüpheli Kişi: ${member} - **${member.id}**

Kişinin hesabı 5 günden önce açıldığı için Şüpheliye atıldı.
`))
          } else
        await member.roles.add(Config.Role.Unregistered)
          if (member.user.username.includes(Config.Guild.Tag)) member.roles.add(Config.Role.Family_Role);
          cezalar.findOne({ user: member.id }, async (err, res) => {
            if (!res) return 
         if (res.ceza == true) {
            await member.roles.add(Config.Role.Jail)
          await member.roles.remove(Config.Role.Unregistered)
          member.roles.remove(Config.Role.Suspect)
        } 
})
mute.findOne({ user: member.id }, async (err, res) => {
  if (!res) return
  if (res.muted == true) {
      member.roles.add(Config.Role.ChatMute)
      
  } 
})
            await data.findOne({ guild: member.guild.id }, async (err, res) => {
              if (!res) return
            res.taglar.forEach(async x => {
              
              if (member.user.username.includes(x)) { // && !member.roles.cache.has(Config.Role.Yasalıtag) 
                 member.roles.set(member.roles.cache.has(Config.Role.Booster) ? [Config.Role.Booster, Config.Role.Yasaklıtag] : [Config.Role.Yasaklıtag]).catch();
                member.send("Sunucumuzda yasaklı olan bir tagı ismine aldığın için sunucuya erişimin kısıtlandı. Aldığın tagı çıkarttığında sunucumuza tekrardan erişebileceksin, seni seviyor ve sayıyoruz.").catch(err => {})
              } 
              }) 
              
            }) 
      
       //   await member.roles.add(Config.Role.Unregistered);
      
       

     
        
        
             
        }
        
    }
    



