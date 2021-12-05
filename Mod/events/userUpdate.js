const { MessageEmbed } = require("discord.js");
const Config = require("../Settings/Settings.json")
const data = require("../models/yasaklıtag")

module.exports = class {
    constructor(client) {
        this.client = client;
    }


    async run(oldUser, newUser) {  

  if (oldUser.username === newUser.username) return;
  const guild = this.client.guilds.cache.get(Config.Guild.Sunucu);
  if (!guild) return;
  const member = guild.members.cache.get(oldUser.id);
  if (!member) return;
  const channel = guild.channels.cache.get(Config.Log.Tag);


  if (oldUser.username.includes(Config.Guild.Tag) && !newUser.username.includes(Config.Guild.Tag)) {
    if (member.manageable && member.displayName.includes(Config.Guild.Tag)) member.setNickname(member.displayName.replace(Config.Guild.Tag, Config.Guild.Secondary_Tag));
  if (Config.Limit.Tagli_Alim && !member.premiumSince && !Config.Role.Vip && !Config.Role.Jail && !Config.Role.Karantina) member.roles.set(Config.Role.Unregistered);
  if (Config.Limit.Yetkili) {
    /*if (member.roles.cache.has(Config.Role.Family_Role.id)) member.roles.remove(Config.Role.Family_Role.id).catch(console.error);
  let roles = member.roles.cache.clone().filter(e => e.managed || e.position < Config.Role.Family_Role.position);
  member.roles.set(roles).catch();*/
   let ekipRol = member.roles.cache.get(Config.Role.Family_Role);
        member.roles.remove(member.roles.cache.filter(rol => ekipRol.position <= rol.position)).catch();
      
  }
   
    else member.roles.remove(Config.Role.Family_Role);
    if (!channel) return;
    const embed = new MessageEmbed().setColor("RANDOM").setAuthor(member.displayName,  newUser.displayAvatarURL({ dynamic: true })).setDescription(`
${member.toString()} kullanıcısı tagımızı bıraktığı için <@&${Config.Role.Family_Role}> rolünü aldım
Mevcut taglı sayımız: ${guild.members.cache.filter(x => x.user.username.includes(Config.Guild.Tag)).size} kişi
`);
    channel.send(embed);
  } else if (!oldUser.username.includes(Config.Guild.Tag) && newUser.username.includes(Config.Guild.Tag)){
    if (member.manageable) member.setNickname(member.displayName.replace(Config.Guild.Secondary_Tag, Config.Guild.Tag));
    member.roles.add(Config.Role.Family_Role);
    if (!channel) return;
    const embed = new MessageEmbed().setColor("RANDOM").setAuthor(member.displayName, newUser.displayAvatarURL({ dynamic: true })).setDescription(`
${member.toString()} kullanıcısı tagımızı aldığı için <@&${Config.Role.Family_Role}> rolünü verdim
Mevcut taglı sayımız: ${guild.members.cache.filter(x => x.user.username.includes(Config.Guild.Tag)).size} kişi
`);
    channel.send(embed);
  }

  await data.findOne({ guild: member.guild.id }, async (err, res) => {
    if (!res) return
  res.taglar.forEach(async x => {
    
    if (!oldUser.username.includes(x) && newUser.username.includes(x)) { // && !member.roles.cache.has(Config.Role.Yasalıtag) 
      await member.roles.set(member.roles.cache.has(Config.Role.Booster) ? [Config.Role.Booster, Config.Role.Yasaklıtag] : [Config.Role.Yasaklıtag]).catch();
      member.send("Sunucumuzda yasaklı olan bir tagı ismine aldığın için sunucuya erişimin kısıtlandı. Aldığın tagı çıkarttığında sunucumuza tekrardan erişebileceksin, seni seviyor ve sayıyoruz.").catch(err => {})
    } else
    if (oldUser.username.includes(x) && !newUser.username.includes(x)) { // && !member.roles.cache.has(Config.Role.Yasalıtag) 
    await member.roles.set(member.roles.cache.has(Config.Role.Booster) ? [Config.Role.Booster, Config.Role.Unregistered] : [Config.Role.Unregistered]).catch();
      member.send("Sunucumuzda yasaklı olan bir tagı isminden çıkarttığın için sunucumuza erişimin açıldı. Teyit kanallarına gelip kayıt olabilirsin, tekrardan aramıza hoş geldin!").catch(err => {})
    }
})
})
    }
  }

