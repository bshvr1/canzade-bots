const Command = require("../../base/Command.js");
const moment = require("moment");
const Register = require('../../models/kayıt.js');
const data = require("../../models/cezalar.js")
const Ayar = require("../../Settings/RegisterAyar.json")
const Config = require("../../Settings/Settings.json")
const { MessageEmbed } = require("discord.js")
class Erkek extends Command {
  constructor(client) {
      super(client, {
          name: "erkek",
          description: "Latency and API response times.",
          usage: "erkek",
          aliases: ["e","erkek","man","bay","boy","adam"]
      });
  }
  async run(message, args, client) {
    let embed = new MessageEmbed().setColor("RANDOM").setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true, })).setFooter(`${this.client.users.cache.has(Config.Permissions.Sahip) ? this.client.users.cache.get(Config.Permissions.Sahip).tag : "Can"} was here!`).setTimestamp();

    if (!Ayar.Register) return message.channel.send(embed.setDescription(`Kayıtlar bir yetkili tarafından geçici süreliğine kapatılmıştır. Lütfen daha sonra tekrar deneyin.`))
    if (!Ayar.Cinsiyetteyit) return;

    if(!message.member.roles.cache.has(Config.Permissions.Register) && !message.member.hasPermission("VIEW_AUDIT_LOG")) return

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return this.client.yolla("Bir üye etiketle ve tekrardan dene!", message.author, message.channel);
    const nick = args.slice(1).filter(arg => isNaN(arg)).map(arg => arg[0].toUpperCase() + arg.slice(1).toLowerCase()).join(" ");
   if (!nick) return this.client.yolla("Yeni ismi belirtin.", message.author, message.channel);
    if (nick && (await this.client.chatKoruma(nick))) return this.client.yolla('Üyenin kullanıcı ismine reklam veya küfür yazamazsınız lütfen geçerli bir isim girip yeniden deneyiniz.', message.author, message.channel)
    const age = args.slice(1).filter(arg => !isNaN(arg))[0] ?? undefined;
    if (!age || isNaN(age)) return this.client.yolla("Geçerli bir yaş belirtin.", message.author, message.channel);
   if (message.guild.members.cache.has(member.id) && message.member.roles.highest.position <= message.guild.members.cache.get(member.id).roles.highest.position) return this.client.yolla("Kendi rolünden yüksek kişilere işlem uygulayamazsın!", message.author, message.channel)
    if(nick.length > 30) return client.reply(message, "isim ya da yaş ile birlikte toplam 30 karakteri geçecek bir isim giremezsin.")
    if (age < Config.Limit.Age_Limit) return this.client.yolla(`Kayıt ettiğin üyenin yaşı ${Config.Limit.Age_Limit}'(t(d)(a(e)n küçük olamaz.`, message.author, message.channel);
    if (age > 99) return this.client.yolla(`Kayıt ettiğin üyenin yaşı iki basamakdan büyük olamaz.`,message.author, message.channel);
    if (!member.manageable) return this.client.yolla(`Kullanıcı benden yüksek bir pozisyona sahip o yüzden kaydedemiyorum.`, message.author, message.channel)

    await data.find({ user: member.id }).sort({ ihlal: "descending" }).exec(async (err, res) => {
        if(!res) return this.client.yolla(`${member} kullanıcısının ceza bilgisi bulunmuyor.`, message.author, message.channel)
    
            let filterArr = res.map(x => (x.ceza))
            let chatMute = filterArr.filter(x => x == "Chat Mute").length || 0
            let voiceMute = filterArr.filter(x => x == "Voice Mute").length || 0
            let jail = filterArr.filter(x => x == "Cezalı").length || 0
            let ban = filterArr.filter(x => x == "Yasaklı").length || 0
            let warn = filterArr.filter(x => x == "Uyarı").length || 0
            let puan = await this.client.punishPoint(member.id)
    
    
      if (
        puan >= Config.Limit.Point &&
        !message.member.roles.cache.some(role => message.guild.roles.cache.get(Config.Permissions.UstYetkili).rawPosition <= role.rawPosition)
      ) {
        const embed = new MessageEmbed()
    .setAuthor(member.user.tag, member.user.avatarURL({ dynamic: true }))
    .setColor("RANDOM")
    .setDescription(`
    🚫 ${member.toString()} kişisinin toplam `+puan+` ceza puanı 
    olduğu için kayıt işlemi iptal edildi. Sunucumuzda tüm 
    işlemlerin kayıt altına alındığını unutmayın. Sorun Teşkil eden, 
    sunucunun huzurunu bozan ve kurallara uymayan kullanıcılar 
    sunucumuza kayıt olamazlar. 
    Belirtilen üye toplamda ${ban} adet ban, ${jail} adet cezalı,
    ${chatMute} adet chat-mute, ${voiceMute} adet voice-mute, ${warn} adet uyarı almış.
           
    Eğer konu hakkında bir şikayetiniz var ise <@&${Config.Permissions.UstYetkili}>
    rolü ve üstlerine ulaşabilirsiniz.
    `)
        return message.channel.send(embed)
      }

      if (Config.Limit.Tagli_Alim && (!member.user.username.includes(Config.Guild.Tag) && !member.premiumSince && !member.roles.cache.has(Config.Role.Vip))) return message.channel.send("Bu üye taglı olmadığı için kayıt edemezsiniz!");
      await member.setNickname(`${member.user.username.includes(Config.Guild.Tag) ? Config.Guild.Tag : (Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : (Config.Guild.Secondary_Tag || ""))} ${nick} | ${age}`).catch(e => { });

    let roles = member.roles.cache.clone().filter(e => e.managed).map(e => e.id).concat(Config.Role.Man);
    if(member.user.username.includes(Config.Guild.Tag)) roles.push(Config.Role.Family_Role)
    member.roles.set(roles).catch();
    
    let registerData = await Register.findOne({ guildId: message.guild.id, userId: member.id });
    let staffData = await Register.findOne({ guildId: message.guild.id, userId: message.author.id });
  
    if(!staffData) {
      let newStaffData = new Register({
        guildId: message.guild.id,
        userId: message.author.id,
        totalRegister: 1,
        womanRegister: 0,
        manRegister: 1,
        userNames: []
      }).save(); 
    } else {
      staffData.totalRegister++
      staffData.manRegister++
      staffData.save();
    }
  
    if(!registerData) {
      let newRegisterData = new Register({
        guildId: message.guild.id,
        userId: member.id,
        totalRegister: 0,
        womanRegister: 0,
        manRegister: 0,
        userNames: [{ nick: `${member.user.username.includes(Config.Guild.Tag) ? Config.Guild.Tag : (Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : (Config.Guild.Secondary_Tag || ""))} ${nick} | ${age}`, type: `<@&${Config.Role.Man[0]}>`}]
      }).save();
    } else {
      registerData.userNames.push({ nick: `${member.user.username.includes(Config.Guild.Tag) ? Config.Guild.Tag : (Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : (Config.Guild.Secondary_Tag || ""))} ${nick} | ${age}`, type: `<@&${Config.Role.Man[0]}>`})
      registerData.save();
    }
  
    const embed = new MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
    .setColor("RANDOM")
    .setDescription(`${member.toString()} üyesine ${Config.Role.Man.map(x => `<@&${x}>`)} rolleri verildi.`)
    .setFooter(`Üyenin ceza puanı `+puan+``);
  message.channel.send(embed)//.then(x => x.delete({timeout: 5000}))
  this.client.channels.cache.get(Config.Log.General_Chat).send(`Aramıza yeni biri katıldı! ${member.toString()} ona hoş geldin diyelim!`)

  this.client.channels.cache.get(Config.Log.Nick).send(new MessageEmbed()
  .setColor("RANDOM")
  .setFooter(`Üyenin ceza puanı `+puan+``+ ` - ` + moment(Date.now()).format("LLL")+"")
  .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
  .setDescription(`
  Üye: ${member.toString()} - **${member.id}**
  Yetkili: ${message.author} - **${message.author.id}**
  İsim: "${member.user.username.includes(Config.Guild.Tag) ? Config.Guild.Tag : (Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : (Config.Guild.Secondary_Tag || ""))} ${nick} | ${age}"
  Cinsiyet: Erkek
   `))  
  })

}
}



module.exports = Erkek;