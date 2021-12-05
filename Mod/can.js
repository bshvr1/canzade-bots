const { Client, Collection, DiscordAPIError } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const klaw = require("klaw");
const Config = require("././Settings/Settings.json")
const path = require("path");
const notlar = require("./models/notlar.js")
const mongoose = require("mongoose")
const Discord = require("discord.js")
const cezalar = require("./models/cezalar.js")
const moment = require("moment")
const Register = require('./models/kayıt.js');
const sunucu = require("./models/sunucu-bilgi.js")
const extra = require("./models/extraMute.js")
const mutes = require("./models/chatmute.js")
const vmutes = require("./models/voicemute.js")
const ceza = require("./models/cezalı.js")
const { table } = require('table');
const logs = require("discord-logs");
const zadecan = require("pretty-ms");
const ms = require("ms");
class ZadeBot extends Client {
  constructor(options) {
    super(options);
    this.lastPunishment = 0
    this.kayıtlar = new Map()
    this.channelTime = new Map()
    this.snipe = new Map()
    this.banLimit = new Map()
    this.jailLimit = new Map()
    this.reklamLimit = new Map()
    this.karantinaLimit = new Map()
    this.boosterLimit = new Map()
    this.roleLimit = new Map()
    this.yasaklıtag = []
    this.blockedFromCommand = []
    this.commandBlock = new Map()
    this.commands = new Collection();
    this.aliases = new Collection();
    this.databaseCache = {};
    this.databaseCache.users = new Collection();
    this.databaseCache.guilds = new Collection();
    this.databaseCache.members = new Collection();
    this.usersData = require("./models/user.js")
    this.logger = require("./modules/Logger");

    this.wait = require("util").promisify(setTimeout);
  }

  loadCommand(commandPath, commandName) {
    try {
      const props = new (require(`${commandPath}${path.sep}${commandName}`))(
        this
      );
      this.logger.log(`Yüklenen Komut: ${props.help.name}. ✔`, "log");
      props.conf.location = commandPath;
      if (props.init) {
        props.init(this);
      }
      this.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        this.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      return `Komut yüklenirken hata oluştu: ${commandName}: ${e}`;
    }
  }

  lastCeza = sunucu.findOne({ guild: Config.Guild.Sunucu }).then()

  async savePunishment() {
    sunucu.findOne({ guild: Config.Guild.Sunucu }, async (err, res) => {
      if (!res) return
      res.ihlal = res.ihlal + 1
      res.save().catch(e => console.log(e))
    })
  }

  async unloadCommand(commandPath, commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command)
      return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;

    if (command.shutdown) {
      await command.shutdown(this);
    }
    delete require.cache[
      require.resolve(`${commandPath}${path.sep}${commandName}.js`)
    ];
    return false;
  }

  ok = "<:yes_zade:885606310937239562>"
  no = "<:no_zade:885606310748512347>"


  async yolla(mesaj, msg, kanal) {
    if (!mesaj || typeof mesaj !== "string") return
    const embd = new Discord.MessageEmbed()
      .setAuthor(msg.tag, msg.displayAvatarURL({ dynamic: true }))
      .setColor("RANDOM")
      .setDescription(mesaj)
    kanal.send(embd).then(msg => {
      msg.delete({ timeout: 15000 }).catch(err => { })
    })
      .catch(console.error);
  }

  async turkishDate(date) {
    if (!date || typeof date !== "number") return
    let convert = zadecan(date, { verbose: true })
      .replace("minutes", "dakika")
      .replace("minute", "dakika")
      .replace("hours", "saat")
      .replace("hour", "saat")
      .replace("seconds", "saniye")
      .replace("second", "saniye")
      .replace("days", "gün")
      .replace("day", "gün")
      .replace("years", "yıl")
      .replace("year", "yıl");
    return convert
  }

  async findOrCreateUser({ id: userID }, isLean){
    return new Promise(async (resolve) => {
        if(this.databaseCache.users.get(userID)){
            resolve(isLean ? this.databaseCache.users.get(userID).toJSON() : this.databaseCache.users.get(userID));
        } else {
            let userData = (isLean ? await this.usersData.findOne({ id: userID }).lean() : await this.usersData.findOne({ id: userID }));
            if(userData){
                resolve(userData);
            } else {
                userData = new this.usersData({ id: userID });
                await userData.save();
                resolve((isLean ? userData.toJSON() : userData));
            }
            this.databaseCache.users.set(userID, userData);
        }
    });
}



  async punishPoint(userID) {
    let res = await cezalar.find({ user: userID })
    if (!res) return 0
    let filterArr = res.map(x => (x.ceza))
    let chatMute = filterArr.filter(x => x == "Chat Mute").length || 0
    let voiceMute = filterArr.filter(x => x == "Voice Mute").length || 0
    let jail = filterArr.filter(x => x == "Cezalı").length || 0
    let reklam = filterArr.filter(x => x == "Reklam").length || 0
    let karantina = filterArr.filter(x => x == "Karantina").length || 0
    let ban = filterArr.filter(x => x == "Yasaklı").length || 0
    let uyarı = filterArr.filter(x => x == "Uyarı").length || 0
    let point = (chatMute * 8) + (voiceMute * 10) + (jail * 15) + (reklam * 20) + (karantina * 12) + (ban * 20) + (uyarı * 3)
    return point
  }

  async extraMute(userID, type, time) {
    let res = await extra.findOne({ user: userID })
    if ((!res)) {
      let buffer = new extra({
        __id: new mongoose.Types.ObjectId,
        user: userID,
        array: [{
          type: type,
          attendeAt: Date.now(),
          time: time
        }]
      })
      await buffer.save().catch(e => console.log(e))
      return 0
    }
    if (res.array.length == 0) return 0

    if (res && (res && res.array.filter(a => a.type == type).length == 0)) {
      res.array.push({
        type: type,
        attendeAt: Date.now(),
        time: time
      })
      res.save().catch(e => console.log(e))
      return 0
    }

    let datx = res.array.filter(a => (a.type == type) && (Date.now() - a.attendeAt < ms("12h")) && (a.time == time))
    if (datx.length == 0) return 0

    res.array = res.array.filter(a => Date.now() - a.attendeAt < ms("12h"))

    res.array.push({
      type: type,
      attendeAt: Date.now(),
      time: time
    })
    res.save().catch(e => console.log(e))
    return datx.length
  }

  async clean(text) {
    if (text && text.constructor.name == "Promise") text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(
        this.token,
        Config.Bot.TOKEN
      );

    return text;
  }

  async fetchPunishments() {
    let res = await cezalar.find()
    if (res.length == 0) return 0
    let last = await res.sort((a, b) => { return b.ihlal - a.ihlal })[0]
    return last.ihlal
  }


  async shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }


  async üye(search, guild) {
    let member = null;
    if (!search || typeof search !== "string") return;
    if (search.match(/^<@!?(\d+)>$/)) {
      let id = search.match(/^<@!?(\d+)>$/)[1];
      member = await guild.members.fetch(id).catch(() => { });
      if (member) return member;
    }
    if (search.match(/^!?([^#]+)#(\d+)$/)) {
      guild = await guild.fetch();
      member = guild.members.cache.find(m => m.user.tag === search);
      if (member) return member;
    }
    member = await guild.members.fetch(search).catch(() => { });
    return member;
  }

  async client_üye(search) {
    let user = null;
    if (!search || typeof search !== "string") return;
    if (search.match(/^!?([^#]+)#(\d+)$/)) {
      let id = search.match(/^!?([^#]+)#(\d+)$/)[1];
      user = this.users.fetch(id).catch(err => { });
      if (user) return user;
    }
    user = await this.users.fetch(search).catch(() => { });
    return user;
  }
}

const client = new ZadeBot();
require("discord-buttons")(client)
logs(client);
const init = async () => {
  klaw("./commands").on("data", item => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = client.loadCommand(
      cmdFile.dir,
      `${cmdFile.name}${cmdFile.ext}`
    );
    if (response) client.logger.error(response);
  });



  client.on('clickButton', async (button) => {
  
    if (button.length === 3);

    if (button.id === 'memberJoinedServer') {
      // await button.think(true); 
      await button.reply.think(true);
       //await button.reply.edit("Can")
 //To make your reply only send to the user who clicked the button, add true to the options param
     await button.reply.edit(`Sunucuya katılma tarihiniz: ${moment(button.clicker.member.joinedAt).format("LLL")}`)
     }

     if (button.id === 'historyName') {
      await button.reply.think(true);
   
      let registerModel = await Register.findOne({
        guildId: button.guild.id, 
        userId: button.clicker.member.user.id
      });
      if (!registerModel) registerModel = await Register.create({
          guildId: button.guild.id,
          userId: button.clicker.member.user.id,
          userNames: []
        });
          if(!registerModel.userNames.length) return await button.reply.edit("Geçmiş isimleriniz bulunamadı.")
     let embed = new Discord.MessageEmbed().setAuthor(button.clicker.user.tag);
     await button.reply.edit(embed.setDescription(`${registerModel.userNames.length} isim kayıtınız bulundu. \n\n${registerModel.userNames.map(x => `\`• ${x.nick}\` (${x.type.replace(`Erkek`, `<@&${Config.Role.Man[0]}>`).replace(`Kız`, `<@&${Config.Role.Woman[0]}>`)})`).join("\n ")}`))
     }

     if (button.id === 'activePenalties') {
      // await button.think(true); 
      await button.reply.think(true);
      let mute = ""
      let vmute = ""
      let cezalı = ""
      await ceza.findOne({ user: button.clicker.member.user.id }, async (err, doc) => {
          if (!doc) {
              cezalı = "```"+"Veritabanında aktif cezalı bilgisi bulunmamakta."+"```"
          } else {
              if (doc.ceza == false) {
                  cezalı = "```"+"Veritabanında aktif chat mute bilgisi bulunmamakta."+"```"
              } else if (doc.ceza == true) {
                  cezalı = "```"+"Cezalı Atan Yetkili: "+ doc.yetkili +"\nCeza Sebebi: " + doc.sebep + "\nCeza Tarihi: " + doc.tarih + "\nCeza Bitiş: Bilinmiyor."+"```"
              }
          }
      })
      await mutes.findOne({ user: button.clicker.member.user.id }, async (err, doc) => {
          if (!doc) {
              mute = "```"+"Veritabanında aktif chat mute bilgisi bulunmamakta."+"```"
          } else {
              if (doc.muted == false) {
                  mute = "```"+"Veritabanında aktif chat mute bilgisi bulunmamakta."+"```"
              } else if (doc.muted == true) {
                  mute = "```"+"Mute Atan Yetkili: "+ doc.yetkili +"\nMute Sebebi: " + doc.sebep + "\nMute Başlangıç: " + moment(doc.start).format("LLL") + "\nMute Bitiş: " + moment(doc.endDate).format("LLL") +"```"
              }
          }
      })
      await vmutes.findOne({ user: button.clicker.member.user.id }, async (err, doc) => {
          if (!doc) {
              vmute = "```"+"Veritabanında aktif ses mute bilgisi bulunmamakta."+"```"
          } else {
              if (doc.muted == false) {
                  vmute = "```"+"Veritabanında aktif voice mute bilgisi bulunmamakta."+"```"
              } else if (doc.muted == true) {
                  vmute = "```"+"Mute Atan Yetkili: "+ doc.yetkili +" \nMute Sebebi: " + doc.sebep + "\nMute Başlangıç: " + moment(doc.start).format("LLL") + "\nMute Bitiş: " + moment(doc.endDate).format("LLL") +"```"
              }
          }
      })
     await button.reply.edit(new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setDescription("Ceza bilgileriniz aşağıda belirtilmiştir.")
          .addFields(
              { name: '❯ Cezalı Bilgisi', value: cezalı || "```"+"Veritabanında aktif cezalı bilgisi bulunmamakta."+"```"},
              { name: '❯ Chat Mute Bilgisi:', value: mute || "```"+"Veritabanında aktif chat mute bilgisi bulunmamakta."+"```" },
              { name: '❯ Ses Mute Bilgisi:', value: vmute || "```"+"Veritabanında aktif voice mute bilgisi bulunmamakta."+"```" },
          ))
  

    }

    
    if (button.id === 'penaltyPoints') {
      
   
      let res = await cezalar.find({ user: button.clicker.member.user.id })
      if (!res) return 0
      let filterArr = res.map(x => (x.ceza))
      let chatMute = filterArr.filter(x => x == "Chat Mute").length || 0
      let voiceMute = filterArr.filter(x => x == "Voice Mute").length || 0
      let jail = filterArr.filter(x => x == "Cezalı").length || 0
      let reklam = filterArr.filter(x => x == "Reklam").length || 0
      let karantina = filterArr.filter(x => x == "Karantina").length || 0
      let ban = filterArr.filter(x => x == "Yasaklı").length || 0
      let uyarı = filterArr.filter(x => x == "Uyarı").length || 0
      let pointt = (chatMute * 8) + (voiceMute * 10) + (jail * 15) + (reklam * 20) + (karantina * 12) + (ban * 20) + (uyarı * 3)
     
        // await button.think(true); 
        await button.reply.think(true);
          await button.reply.edit(``+pointt+` ceza puanınız mevcut`) 
      
      
      }
      
    if (button.id === 'historyPenalties') {
      // await button.think(true); 
      await button.reply.think(true);

      await cezalar.find({ user: button.clicker.member.user.id }).sort({ ihlal: "descending" }).exec(async (err, res) => {
        if(!res) await button.reply.edit(`ceza bilginiz bulunmuyor.`)
        let datax = [
            ["ID", "Tarih", "Ceza", "Sebep"]
        ];

        let dataxe = [
            ["ID", "Ceza", "Tarih", "Bitiş", "Yetkili", "Sebep"]
        ];

        let config = {
            border: {
                topBody: ``,
                topJoin: ``,
                topLeft: ``,
                topRight: ``,

                bottomBody: ``,
                bottomJoin: ``,
                bottomLeft: ``,
                bottomRight: ``,

                bodyLeft: `│`,
                bodyRight: `│`,
                bodyJoin: `│`,

                joinBody: ``,
                joinLeft: ``,
                joinRight: ``,
                joinJoin: ``
            }
        };
        res.map(x => {
            datax.push([x.ihlal, x.tarih, x.ceza, x.sebep])
        })

        res.map(x => {
            dataxe.push([x.ihlal, x.ceza, x.tarih, x.bitiş, x.yetkili, x.sebep])
        })
        if (datax.length == 1) return button.reply.edit(`ceza bilginiz bulunmamaktadır`)

        let out = table(dataxe, config)
        let outi = table(datax.slice(0, 15), config)
        await button.reply.edit(`Toplam ${datax.length-1} cezanız bulunmakta son 15 cezanız aşağıda belirtilmiştir.\n\`\`\`fix
        ${outi}
        \`\`\``)
           
      })
      
    }
    if (button.id === 'notes') {
      // await button.think(true); 
      await button.reply.think(true);
       //await button.reply.edit("Can")
 //To make your reply only send to the user who clicked the button, add true to the options param
       await notlar.findOne({ user: button.clicker.member.user.id }, async (err, res) => {
        // if (!res) await button.reply.edit("Notlarına bakmak istediğin kullanıcıya ait sistemde not bulunmuyor.")
           await button.reply.edit(new Discord.MessageEmbed()
             .setColor("RANDOM")
             .setDescription(`${res?.notlar?.map ? `ceza notlarınız aşağıda belirtilmiştir.\n\n${res?.notlar?.map(x => `-Not Bırakan Yetkili: <@${x.yetkili}>(\`${x.yetkili}\`)\n-Not: \`${x.not}\``).slice(0, 10).join("\n\n")}` : `Ceza notunuz bulunmamaktadır.`}
     `))
 })
     }
     if (button.id === 'penaltiesNumber') {
      // await button.think(true); 
      await button.reply.think(true);

      await cezalar.find({ user: button.clicker.member.user.id }).sort({ ihlal: "descending" }).exec(async (err, res) => {
        if(!res) await button.reply.edit(`Ceza sayınız bulunmuyor.`)
    
    let filterArr = res.map(x => (x.ceza))
    let chatMute = filterArr.filter(x => x == "Chat Mute").length || 0
    let voiceMute = filterArr.filter(x => x == "Voice Mute").length || 0
    let jail = filterArr.filter(x => x == "Cezalı").length || 0
    let ban = filterArr.filter(x => x == "Yasaklı").length || 0
    let warn = filterArr.filter(x => x == "Uyarı").length || 0
   await button.reply.edit(new Discord.MessageEmbed().setColor("RANDOM")
    .setDescription(`🚫 Sahip olduğunuz ceza sayıları aşağıda belirtilmiştir
    
    ${chatMute} Chat Mute, ${voiceMute} Voice Mute, ${jail} Cezalı, ${ban} Ban, ve ${warn} uyarı almış.

    Toplam: ${chatMute + voiceMute + jail + ban + warn}
    `))

      })
    }

    if (button.id === 'memberRoles') {
      // await button.think(true); 
      await button.reply.think(true);
      const roles = button.clicker.member.roles.cache.filter(role => role.id !== button.guild.id).sort((a, b) => b.position - a.position).map(role => `<@&${role.id}>`);
            const rolleri = []
            if (roles.length > 50) {
                const lent = roles.length - 50
                let itemler = roles.slice(0, 50)
                itemler.map(x => rolleri.push(x))
                rolleri.push(`${lent} daha...`)
            } else {
                roles.map(x => rolleri.push(x))
            }


      await button.reply.edit(new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription("Üzerinizdeki roller aşağıda belirtilmiştir. (" + roles.length + " tane): "+"\n " + rolleri.join(", ") + " "))
    }

    
    if (button.id === 'createdAt') {
      // await button.think(true); 
      await button.reply.think(true);


      await button.reply.edit("Hesap oluşturulma tarihiniz: " + moment(button.clicker.member.user.createdTimestamp).format("LLL") + "")
    }
    
    if (button.id === 'Etkinlik') {
      await button.reply.think(true);
      if (button.clicker.member.roles.cache.get(Config.Role.Etkinlik)) {
        await button.clicker.member.roles.remove(Config.Role.Etkinlik);
        await button.reply.edit("Etkinlik Katılımcısı rolü üzerinizden alındı. Artık etkinliklerden bildirim almayacaksınız.")
    } else {
        await button.clicker.member.roles.add(Config.Role.Etkinlik);
        await button.reply.edit("Etkinlik Katılımcısı rolü üzerinize verildi. Artık etkinliklerimizden haberdar olacaksınız.")
    }   
    }
    if (button.id === 'Çekiliş') {
      await button.reply.think(true);
      if (button.clicker.member.roles.cache.get(Config.Role.Cekilis)) {
        await button.clicker.member.roles.remove(Config.Role.Cekilis);
        await button.reply.edit("Cekiliş Katılımcısı rolü üzerinizden alındı. Artık çekilişlerden bildirim almayacaksınız.")
    } else {
        await button.clicker.member.roles.add(Config.Role.Cekilis);
        await button.reply.edit("Cekiliş Katılımcısı rolü üzerinize verildi. Artık çekilişlerimizden haberdar olacaksınız.")
    }   
    }
    
  })
                   
  
  client.on('clickMenu', async menu => {

    const member = menu.clicker.member
  
    if(menu.values[0] == 'lovers') {
      if(!member.roles.cache.has(Config.Role.lovers)) {
        await member.roles.add(Config.Role.lovers)
        await member.roles.remove(Config.Role.unlovers)
        return menu.reply.send('Sevgilim Var rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.lovers)) {
        await member.roles.remove(Config.Role.lovers)
        return menu.reply.send("Sevgilim Var Rolü Üzerinizden alındı.", true)
      }
    }
  
    if(menu.values[0] == 'unlovers') {
      if(!member.roles.cache.has(Config.Role.unlovers)) {
        await member.roles.add(Config.Role.unlovers)
        await member.roles.remove(Config.Role.lovers)
        return menu.reply.send('Sevgilim Yok rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.unlovers)) {
        await member.roles.remove(Config.Role.unlovers)
        return menu.reply.send("Sevgilim Yok rolü üzerinizden alındı.", true)
      }
      
    }

     
    if(menu.values[0] == 'vk') {
      if(!member.roles.cache.has(Config.Role.Vampirkoylu)) {
        await member.roles.add(Config.Role.Vampirkoylu)
        return menu.reply.send('Vampir Köylü rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Vampirkoylu)) {
        await member.roles.remove(Config.Role.Vampirkoylu)
        return menu.reply.send("Vampir Köylü rolü üzerinizden alındı.", true)

      }
    }
    if(menu.values[0] == 'sc') {
      if(!member.roles.cache.has(Config.Role.SoruCevap)) {
        await member.roles.add(Config.Role.SoruCevap)
        return menu.reply.send('Soru - Cevap rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.SoruCevap)) {
        await member.roles.remove(Config.Role.SoruCevap)
        return menu.reply.send("Soru - Cevap rolü üzerinizden alındı.", true)
      }
    }
    if(menu.values[0] == 'gc') {
      if(!member.roles.cache.has(Config.Role.Gartic)) {
        await member.roles.add(Config.Role.Gartic)
        return menu.reply.send('Gartic.io rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Gartic)) {
        await member.roles.remove(Config.Role.Gartic)
        return menu.reply.send("Gartic.io rolü üzerinizden alındı.", true)
      }
    }

    let redd = [Config.Role.Yellow, Config.Role.Green, Config.Role.Blue, Config.Role.Orange, Config.Role.Purple]

    if(menu.values[0] == 'red') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sadece tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Red)) {
        await member.roles.add(Config.Role.Red)
        await member.roles.remove(redd)
  
        return menu.reply.send('Kırmızı rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Red)) {
        await member.roles.remove(Config.Role.Red)
        return menu.reply.send("Kırmızı rolü üzerinizden alındı.", true)
      }
    }
    let yelloww = [Config.Role.Red, Config.Role.Green, Config.Role.Blue, Config.Role.Orange, Config.Role.Purple]

    if(menu.values[0] == 'yellow') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sarı tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Yellow)) {
        await member.roles.add(Config.Role.Yellow)
        await member.roles.remove(yelloww)
    
        return menu.reply.send('Sarı rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Yelow)) {
        await member.roles.remove(Config.Role.Yellow)
        return menu.reply.send("Sarı rolü üzerinizden alındı.", true)
      }
    }

    let greenn = [Config.Role.Red, Config.Role.Yellow, Config.Role.Blue, Config.Role.Orange, Config.Role.Purple]

    if(menu.values[0] == 'green') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sadece tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Green)) {
        await member.roles.add(Config.Role.Green)
        await member.roles.remove(greenn)
   
        return menu.reply.send('Yeşil rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Green)) {
        await member.roles.remove(Config.Role.Green)
        return menu.reply.send("Yeşil rolü üzerinizden alındı.", true)
      }
    }

    let bluee = [Config.Role.Red, Config.Role.Yellow, Config.Role.Green, Config.Role.Orange, Config.Role.Purple]

    if(menu.values[0] == 'blue') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sadece tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Blue)) {
        await member.roles.add(Config.Role.Blue)
        await member.roles.remove(bluee)
  
        return menu.reply.send('Mavi rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Blue)) {
        await member.roles.remove(Config.Role.Blue)
        return menu.reply.send("Mavi rolü üzerinizden alındı.", true)
      }
    }

    let orangee = [Config.Role.Red, Config.Role.Yellow, Config.Role.Green, Config.Role.Blue, Config.Role.Purple]

    if(menu.values[0] == 'orange') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sadece tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Orange)) {
        await member.roles.add(Config.Role.Orange)
        await member.roles.remove(orangee)

        return menu.reply.send('Turuncu rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Orange)) {
        await member.roles.remove(Config.Role.Orange)
        return menu.reply.send("Turuncu rolü üzerinizden alındı.", true)
      }
    }

    let purplee = [Config.Role.Red, Config.Role.Yellow, Config.Role.Green, Config.Role.Blue, Config.Role.Orange]

    if(menu.values[0] == 'purple') {
      if(menu.clicker.member ==! Config.Role.Family_Role) 
      return menu.reply.send("Sadece tagımıza sahip olan üyelerimiz seçebilir", true)
      if(!member.roles.cache.has(Config.Role.Purple)) {
        await member.roles.add(Config.Role.Purple)
        await member.roles.remove(purplee)
    
        return menu.reply.send('Mor rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Purple)) {
        await member.roles.remove(Config.Role.Purple)
        return menu.reply.send("Mor rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'amongus') {
      if(!member.roles.cache.has(Config.Role.AmongUs)) {
        await member.roles.add(Config.Role.AmongUs)
    
        return menu.reply.send('Among Us rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.AmongUs)) {
        await member.roles.remove(Config.Role.AmongUs)
        return menu.reply.send("Among Us rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'lol') {
      if(!member.roles.cache.has(Config.Role.Lol)) {
        await member.roles.add(Config.Role.Lol)
    
        return menu.reply.send('League of Legends rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Lol)) {
        await member.roles.remove(Config.Role.Lol)
        return menu.reply.send("Mor rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'valo') {
      if(!member.roles.cache.has(Config.Role.Valorant)) {
        await member.roles.add(Config.Role.Valorant)
    
        return menu.reply.send('Valorant rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Valorant)) {
        await member.roles.remove(Config.Role.Valorant)
        return menu.reply.send("Valorant rolü üzerinizden alındı.", true)
      }
    }

    
    if(menu.values[0] == 'cs') {
      if(!member.roles.cache.has(Config.Role.CSGO)) {
        await member.roles.add(Config.Role.CSGO)
    
        return menu.reply.send('CS:GO rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.CSGO)) {
        await member.roles.remove(Config.Role.CSGO)
        return menu.reply.send("CS:GO rolü üzerinizden alındı.", true)
      }
    }

    
    if(menu.values[0] == 'minecraft') {
      if(!member.roles.cache.has(Config.Role.Minecraft)) {
        await member.roles.add(Config.Role.Minecraft)
    
        return menu.reply.send('Minecraft rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Minecraft)) {
        await member.roles.remove(Config.Role.Minecraft)
        return menu.reply.send("Minecraft rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'fortnite') {
      if(!member.roles.cache.has(Config.Role.Fortnite)) {
        await member.roles.add(Config.Role.Fortnite)
    
        return menu.reply.send('Fortnite rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Fortnite)) {
        await member.roles.remove(Config.Role.Fortnite)
        return menu.reply.send("Fortnite rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'gta') {
      if(!member.roles.cache.has(Config.Role.GtaV)) {
        await member.roles.add(Config.Role.GtaV)
    
        return menu.reply.send('Gta V rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.GtaV)) {
        await member.roles.remove(Config.Role.GtaV)
        return menu.reply.send("Gta V rolü üzerinizden alındı.", true)
      }
    }

    if(menu.values[0] == 'rust') {
      if(!member.roles.cache.has(Config.Role.Rust)) {
        await member.roles.add(Config.Role.Rust)
    
        return menu.reply.send('Rust rolü üzerinize verildi.', true)
      } else if(member.roles.cache.has(Config.Role.Rust)) {
        await member.roles.remove(Config.Role.Rust)
        return menu.reply.send("Rust rolü üzerinizden alındı.", true)
      }
    }




    
  })

  
  


  let kufurler = ["allahoc","allahoç","allahamk","allahaq","0r0spuc0cu","4n4n1 sk3r1m","p1c","@n@nı skrm","evladi","orsb","orsbcogu","amnskm","anaskm","oc","abaza","abazan","ag",
  "a\u011fz\u0131na s\u0131\u00e7ay\u0131m","fuck","shit","ahmak","seks","sex","allahs\u0131z","amar\u0131m","ambiti","am biti","amc\u0131\u011f\u0131","amc\u0131\u011f\u0131n",
  "amc\u0131\u011f\u0131n\u0131","amc\u0131\u011f\u0131n\u0131z\u0131","amc\u0131k","amc\u0131k ho\u015faf\u0131","amc\u0131klama","amc\u0131kland\u0131","amcik","amck","amckl",
  "amcklama","amcklaryla","amckta","amcktan","amcuk","am\u0131k","am\u0131na","amına","am\u0131nako","am\u0131na koy","am\u0131na koyar\u0131m","am\u0131na koyay\u0131m","am\u0131nakoyim",
  "am\u0131na koyyim","am\u0131na s","am\u0131na sikem","am\u0131na sokam","am\u0131n feryad\u0131","am\u0131n\u0131","am\u0131n\u0131 s","am\u0131n oglu","am\u0131no\u011flu","am\u0131n o\u011flu",
  "am\u0131s\u0131na","am\u0131s\u0131n\u0131","amina","amina g","amina k","aminako","aminakoyarim","amina koyarim","amina koyay\u0131m","amina koyayim","aminakoyim","aminda",
  "amindan","amindayken","amini","aminiyarraaniskiim","aminoglu","amin oglu","amiyum","amk","amkafa","amk \u00e7ocu\u011fu","amlarnzn","aml\u0131","amm","ammak","ammna","amn",
  "amna","amnda","amndaki","amngtn","amnn","amona","amq","ams\u0131z","amsiz","amsz","amteri","amugaa","amu\u011fa","amuna","ana","anaaann","anal","analarn","anam","anamla",
  "anan","anana","anandan","anan\u0131","anan\u0131","anan\u0131n","anan\u0131n am","anan\u0131n am\u0131","anan\u0131n d\u00f6l\u00fc","anan\u0131nki","anan\u0131sikerim",
  "anan\u0131 sikerim","anan\u0131sikeyim","anan\u0131 sikeyim","anan\u0131z\u0131n","anan\u0131z\u0131n am","anani","ananin","ananisikerim","anani sikerim","ananisikeyim",
  "anani sikeyim","anann","ananz","anas","anas\u0131n\u0131","anas\u0131n\u0131n am","anas\u0131 orospu","anasi","anasinin","anay","anayin","angut","anneni","annenin","annesiz",
  "anuna","aq","a.q","a.q.","aq.","ass","atkafas\u0131","atm\u0131k","att\u0131rd\u0131\u011f\u0131m","attrrm","auzlu","avrat","ayklarmalrmsikerim","azd\u0131m","azd\u0131r",
  "azd\u0131r\u0131c\u0131","babaannesi ka\u015far","baban\u0131","baban\u0131n","babani","babas\u0131 pezevenk","baca\u011f\u0131na s\u0131\u00e7ay\u0131m","bac\u0131na",
  "bac\u0131n\u0131","bac\u0131n\u0131n","bacini","bacn","bacndan","bacy","bastard","b\u0131z\u0131r","bitch","biting","boner","bosalmak","bo\u015falmak","cenabet",
  "cibiliyetsiz","cibilliyetini","cibilliyetsiz","cif","cikar","cim","\u00e7\u00fck","dalaks\u0131z","dallama","daltassak","dalyarak","dalyarrak","dangalak","dassagi",
  "diktim","dildo","dingil","dingilini","dinsiz","dkerim","domal","domalan","domald\u0131","domald\u0131n","domal\u0131k","domal\u0131yor","domalmak","domalm\u0131\u015f",
  "domals\u0131n","domalt","domaltarak","domalt\u0131p","domalt\u0131r","domalt\u0131r\u0131m","domaltip","domaltmak","d\u00f6l\u00fc","d\u00f6nek","d\u00fcd\u00fck","eben",
  "ebeni","ebenin","ebeninki","ebleh","ecdad\u0131n\u0131","ecdadini","embesil","emi","fahise","fahi\u015fe","feri\u015ftah","ferre","fuck","fucker","fuckin","fucking","gavad",
  "gavat","giberim","giberler","gibis","gibi\u015f","gibmek","gibtiler","goddamn","godo\u015f","godumun","gotelek","gotlalesi","gotlu","gotten","gotundeki","gotunden","gotune",
  "gotunu","gotveren","goyiim","goyum","goyuyim","goyyim","g\u00f6t","g\u00f6t deli\u011fi","g\u00f6telek","g\u00f6t herif","g\u00f6tlalesi","g\u00f6tlek","g\u00f6to\u011flan\u0131",
  "g\u00f6t o\u011flan\u0131","g\u00f6to\u015f","g\u00f6tten","g\u00f6t\u00fc","g\u00f6t\u00fcn","g\u00f6t\u00fcne","g\u00f6t\u00fcnekoyim","g\u00f6t\u00fcne koyim","g\u00f6t\u00fcn\u00fc",
  "g\u00f6tveren","g\u00f6t veren","g\u00f6t verir","gtelek","gtn","gtnde","gtnden","gtne","gtten","gtveren","hasiktir","hassikome","hassiktir","has siktir","hassittir","haysiyetsiz","hayvan herif",
  "ho\u015faf\u0131","h\u00f6d\u00fck","hsktr","huur","\u0131bnel\u0131k","ibina","ibine","ibinenin","ibne","ibnedir","ibneleri","ibnelik","ibnelri","ibneni","ibnenin","ibnerator","ibnesi","idiot",
  "idiyot","imansz","ipne","iserim","i\u015ferim","ito\u011flu it","kafam girsin","kafas\u0131z","kafasiz","kahpe","kahpenin","kahpenin feryad\u0131","kaka","kaltak","kanc\u0131k","kancik","kappe",
  "karhane","ka\u015far","kavat","kavatn","kaypak","kayyum","kerane","kerhane","kerhanelerde","kevase","keva\u015fe","kevvase","koca g\u00f6t","kodu\u011fmun","kodu\u011fmunun","kodumun","kodumunun",
  "koduumun","koyarm","koyay\u0131m","koyiim","koyiiym","koyim","koyum","koyyim","krar","kukudaym","laciye boyad\u0131m","libo\u015f","madafaka","malafat","malak","mcik","meme","memelerini","mezveleli",
  "minaamc\u0131k","mincikliyim","mna","monakkoluyum","motherfucker","mudik","oc","ocuu","ocuun","O\u00c7","o\u00e7","o. \u00e7ocu\u011fu","o\u011flan","o\u011flanc\u0131","o\u011flu it","orosbucocuu",
  "orospu","orospucocugu","orospu cocugu","orospu \u00e7oc","orospu\u00e7ocu\u011fu","orospu \u00e7ocu\u011fu","orospu \u00e7ocu\u011fudur","orospu \u00e7ocuklar\u0131","orospudur","orospular","orospunun",
  "orospunun evlad\u0131","orospuydu","orospuyuz","orostoban","orostopol","orrospu","oruspu","oruspu\u00e7ocu\u011fu","oruspu \u00e7ocu\u011fu","osbir","ossurduum","ossurmak","ossuruk","osur","osurduu",
  "osuruk","osururum","otuzbir","\u00f6k\u00fcz","\u00f6\u015fex","patlak zar","penis","pezevek","pezeven","pezeveng","pezevengi","pezevengin evlad\u0131","pezevenk","pezo","pic","pici","picler",
  "pi\u00e7","pi\u00e7in o\u011flu","pi\u00e7 kurusu","pi\u00e7ler","pipi","pipi\u015f","pisliktir","porno","pussy","pu\u015ft","pu\u015fttur","rahminde","revizyonist","s1kerim","s1kerm","s1krm",
  "sakso","saksofon","saxo","sekis","serefsiz","sevgi koyar\u0131m","sevi\u015felim","sexs","s\u0131\u00e7ar\u0131m","s\u0131\u00e7t\u0131\u011f\u0131m","s\u0131ecem","sicarsin","sie","sik","sikdi",
  "sikdi\u011fim","sike","sikecem","sikem","siken","sikenin","siker","sikerim","sikerler","sikersin","sikertir","sikertmek","sikesen","sikesicenin","sikey","sikeydim","sikeyim","sikeym","siki","sikicem",
  "sikici","sikien","sikienler","sikiiim","sikiiimmm","sikiim","sikiir","sikiirken","sikik","sikil","sikildiini","sikilesice","sikilmi","sikilmie","sikilmis","sikilmi\u015f","sikilsin","sikim","sikimde",
  "sikimden","sikime","sikimi","sikimiin","sikimin","sikimle","sikimsonik","sikimtrak","sikin","sikinde","sikinden","sikine","sikini","sikip","sikis","sikisek","sikisen","sikish","sikismis","siki\u015f",
  "siki\u015fen","siki\u015fme","sikitiin","sikiyim","sikiym","sikiyorum","sikkim","sikko","sikleri","sikleriii","sikli","sikm","sikmek","sikmem","sikmiler","sikmisligim","siksem","sikseydin","sikseyidin",
  "siksin","siksinbaya","siksinler","siksiz","siksok","siksz","sikt","sikti","siktigimin","siktigiminin","sikti\u011fim","sikti\u011fimin","sikti\u011fiminin","siktii","siktiim","siktiimin","siktiiminin",
  "siktiler","siktim","siktim","siktimin","siktiminin","siktir","siktir et","siktirgit","siktir git","siktirir","siktiririm","siktiriyor","siktir lan","siktirolgit","siktir ol git","sittimin","sittir",
  "skcem","skecem","skem","sker","skerim","skerm","skeyim","skiim","skik","skim","skime","skmek","sksin","sksn","sksz","sktiimin","sktrr","skyim","slaleni","sokam","sokar\u0131m","sokarim","sokarm",
  "sokarmkoduumun","sokay\u0131m","sokaym","sokiim","soktu\u011fumunun","sokuk","sokum","soku\u015f","sokuyum","soxum","sulaleni","s\u00fclaleni","s\u00fclalenizi","s\u00fcrt\u00fck","\u015ferefsiz",
  "\u015f\u0131ll\u0131k","taaklarn","taaklarna","tarrakimin","tasak","tassak","ta\u015fak","ta\u015f\u015fak","tipini s.k","tipinizi s.keyim","tiyniyat","toplarm","topsun","toto\u015f","vajina",
  "vajinan\u0131","veled","veledizina","veled i zina","verdiimin","weled","weledizina","whore","xikeyim","yaaraaa","yalama","yalar\u0131m","yalarun","yaraaam","yarak","yaraks\u0131z","yaraktr",
  "yaram","yaraminbasi","yaramn","yararmorospunun","yarra","yarraaaa","yarraak","yarraam","yarraam\u0131","yarragi","yarragimi","yarragina","yarragindan","yarragm","yarra\u011f",
  "yarra\u011f\u0131m","yarra\u011f\u0131m\u0131","yarraimin","yarrak","yarram","yarramin","yarraminba\u015f\u0131","yarramn","yarran","yarrana","yarrrak","yavak","yav\u015f","yav\u015fak",
  "yav\u015fakt\u0131r","yavu\u015fak","y\u0131l\u0131\u015f\u0131k","yilisik","yogurtlayam","yo\u011furtlayam","yrrak","z\u0131kk\u0131m\u0131m","zibidi","zigsin","zikeyim","zikiiim","zikiim",
  "zikik","zikim","ziksiiin","ziksiin","zulliyetini","zviyetini"];
  client.chatKoruma = async mesajIcerik => {
    if (!mesajIcerik) return;
      let inv = /(https:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)?/i;  
      if (inv.test(mesajIcerik)) return true;
  
      let link = /(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;  
      if (link.test(mesajIcerik)) return true;
  
      if ((kufurler).some(word => new RegExp("(\\b)+(" + word + ")+(\\b)", "gui").test(mesajIcerik))) return true;
    return false;
  };

client.on("message", message => {
  if(message.channel.id === Config.Log.Spotify) return
      if(message.author.bot) return
      if(message.activity){
        message.delete()
   message.reply(`Lütfen parti isteklerinizi <#${Config.Log.Spotify_Chat}> kısmına atınız.`)
      }
      })

client.on('message', message =>{
  let taglar = ['tag','TAG','Tag',`!tag`,`!Tag`,`!TAG`,`.tag`,`.Tag`,`.TAG`]
  if(message.author.bot) return
  if(taglar.some(r =>message.content.toLowerCase() ===r )){
    message.channel.send(`${Config.Guild.Tag}`) 
  }
   })

  const evtFiles = await readdir("./events/");
  client.logger.log(`Toplam ${evtFiles.length} event yükleniyor.`, "log");
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    client.logger.log(`Yüklenen Event: ${eventName} ✔`);
    const event = new (require(`./events/${file}`))(client);
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./events/${file}`)];
  });


  client.login(Config.Bot.TOKEN);
  mongoose.connect(Config.Bot.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client.logger.log("Mongo Bağlantısı Kuruldu ✔", "log"));

};

init();

client
  .on("disconnect", () => client.logger.warn("Bot is disconnecting..."))
  .on("reconnecting", () => client.logger.log("Bot reconnecting...", "log"))
  .on("error", e => client.logger.error(e))
  .on("warn", info => client.logger.warn(info));


process.on("uncaughtException", err => {
  const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
  console.error("Beklenmedik yakalanamayan hata: ", errorMsg);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.error("Promise Hatası: ", err);
});

setInterval(() => {
  let GuildID = Config.Guild.Sunucu
  let OneMonth = Config.Role.OneMonth
  let ThreeMonth = Config.Role.ThreeMonth
  let SixMonth = Config.Role.SixMonth
  let NineMonth = Config.Role.NineMonth
  let OneYear = Config.Role.OneYear
  const server = client.guilds.cache.get(GuildID); 
  server.members.cache.forEach(async member => {
if(Date.now() - member.joinedAt > 1000 * 60 * 60 * 24 * 30) {await member.roles.add(OneMonth)}

if(Date.now() - member.joinedAt > 1000 * 60 * 60 * 24 * 90) {await member.roles.remove(OneMonth)
  await member.roles.add(ThreeMonth)}

if(Date.now() - member.joinedAt > 1000 * 60 * 60 * 24 * 180) {await member.roles.remove(ThreeMonth)
await member.roles.add(SixMonth)}

if(Date.now() - member.joinedAt > 1000 * 60 * 60 * 24 * 270) {await member.roles.remove(SixMonth)
  await member.roles.add(NineMonth)}

  if(Date.now() - member.joinedAt > 1000 * 60 * 60 * 24 * 365) {await member.roles.remove(NineMonth)
    await member.roles.add(OneYear)}

        })
  }, 1000 * 60 * 60 * 24 * 7)

 /* client.on('voiceStateUpdate', member => {
    client.guilds.cache.get("885555131687526461").channels.cache.get('885555136691322927').members.cache.forEach(can =>{
      setTimeout(() => {
    can.roles.add('886983750628565002')
     }, 1000) 
    })
    })
*/
  
  client.on("messageDelete", async deletedMessage => {
    if (deletedMessage.author.bot || deletedMessage.channel.type === "dm") return;
    let sc = deletedMessage.guild.channels.cache.get(Config.Log.MessageDelete)
      
    
    let embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setThumbnail(deletedMessage.author.avatarURL())
      .setAuthor(`Mesaj Silindi`, deletedMessage.author.avatarURL())
      .addField("Kullanıcı", "<@"+deletedMessage.author+">**  -  **"+deletedMessage.author.id +"")
      .addField("Kanal Adı - Mesaj ID", ""+deletedMessage.channel.name+"**  -  **"+deletedMessage.id+"")
      .addField("Silinen Mesaj", "```" + deletedMessage.content + "```")
      .setFooter(`Bugün saat ${deletedMessage.createdAt.getHours()}:${deletedMessage.createdAt.getMinutes()}`
      );
    sc.send(embed);
      })

      client.on("guildMemberNicknameUpdate", (member, oldNickname, newNickname) => {
        if (member.user.bot) return;
        let canbabe = member.guild.channels.cache.get(Config.Log.Nick2)

        let embedd = new Discord.MessageEmbed()
        .setThumbnail(member.user.avatarURL())
        .setAuthor(member.user.tag, member.user.avatarURL())
        .setTimestamp()
        .setColor("RANDOM")
        .setDescription("<@"+member+"> " + oldNickname+"'s nickname is now " + `${newNickname ?? "Reset the username"}`)

        canbabe.send(embedd)
      });