let cezalar = require("../models/cezalar.js")
const Config = require("../Settings/Settings.json")
  module.exports = class {
    constructor(client) {
      this.client = client;

    }

  async run() {
  
    this.client.lastPunishment = this.client.lastPunishment + await this.client.fetchPunishments()
    await this.client.wait(1000);
    this.client.appInfo = await this.client.fetchApplication();
    setInterval(async () => {
      this.client.appInfo = await this.client.fetchApplication();
    }, 60000);
    require("../modules/unmutes.js")(this.client)
    require("../modules/vunmutes.js")(this.client)
    require("../modules/zamanlayıcı.js")(this.client)
    this.client.user.setActivity(`Can`);
    this.client.logger.log(`${this.client.user.tag}, kullanıma hazır ${this.client.users.cache.size} kullanıcı, ${this.client.guilds.cache.size} sunucu.`, "ready");
    this.client.logger.log(`${this.client.lastPunishment} ceza tanımlandı!`, "ready");

    setInterval(() => { YasaklıTagKontrol(); }, 600 * 1000);
    setInterval(() => { TagAlıncaKontrol(); }, 600 * 1000);
    setInterval(() => { TagBırakanKontrol(); }, 60 * 1000);
    setInterval(() => { TagliAlim(); }, 120 * 1000);
    setInterval(() => { RolsuzeKayitsizVerme(); }, 15 * 1000);
  }
}


const client = client

  async function YasaklıTagKontrol() { // Yasaklı tag Kontrol
    const guild = this.client.guilds.cache.get(Config.Guild.Sunucu)
    await data.findOne({ guild: guild.id }, async (err, res) => {
      if (!res) return
      res.taglar.forEach(async x => {
      const members = guild.members.cache.filter(member => member.user.username.includes(x)) && !member.roles.cache.has(Config.Role.Yasaklıtag).array().splice(0, 10)
      for await (const member of members) {
        await member.roles.set(Config.Role.Yasaklıtag)
        await member.send(`**${member.guild.name}** sunucusunda ismine yasaklı tag aldığın için yasaklı taga atıldın! Tagı bıraktığında tekrardan aramıza katılabilirsin`).catch(error => {})
      }
    } )
  })
    
  };

  
  async function TagAlıncaKontrol() { // Tag alınca tarama
    const guild = this.client.guilds.cache.get(Config.Guild.Sunucu)
    const members = guild.members.cache.filter(member => member.user.username.includes(Config.Guild.Tag) && /*!yasaklıtagblabla.value().some(tag => member.user.username.includes(tag)) && !member.roles.cache.has(Config.Role.Jail) && !member.roles.cache.has(Config.Role.Yasaklıtag) && !member.roles.cache.has(Config.Role.Suspect) && */!member.roles.cache.has(Config.Role.Family_Role)).array().splice(0, 10)
    for await (const member of members) {
      await member.roles.add(Config.Role.Family_Role);
      if (!member.manageable) await member.setNickname(member.displayName.replace(Config.Guild.Tag, Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : Config.Guild.Tag))
    }
  };
  
  async function TagBırakanKontrol() { // Tagı olmayanın family ve renk rollerini çekme
    const guild = this.client.guilds.cache.get(Config.Guild.Sunucu)
    const members = guild.members.cache.filter(member => !member.user.username.includes(Config.Guild.Tag) && !member.user.bot && member.roles.cache.has(Config.Role.Family_Role)).array().splice(0, 10)
    for await (const member of members) {
      await member.roles.remove(Config.Role.Family_Role)
      let renkroller = [Config.Role.Red, Config.Role.Yellow, Config.Role.Green, Config.Role.Blue, Config.Role.Orange, Config.Role.Purple]
      if (renkroller.some(rol => member.roles.cache.has(rol))) { await member.roles.remove(renkroller) };
      //if (!member.manageable) await member.setNickname(member.displayName.replace(Config.Guild.Tag, Config.Guild.Secondary_Tag ? Config.Guild.Secondary_Tag : Config.Guild.Tag))
    }
  };
  
  async function TagliAlim() { // Rolü olmayanı kayıtsıza atma
    if (!Config.Limit.Tagli_Alim) {
      const guild = this.client.guilds.cache.get(Config.Guild.Sunucu)
      const members = guild.members.cache.filter(member => !member.user.username.includes(Config.Guild.Tag) && !member.permissions.has("ADMINISTRATOR") && !member.user.bot && !member.roles.cache.has(Config.Role.Vip) && !member.roles.cache.has(Config.Role.Booster) && !member.roles.cache.has(Config.Role.Unregistered) && !member.roles.cache.has(Config.Role.Jail) && !member.roles.cache.has(Config.Role.Yasaklıtag) && !member.roles.cache.has(Config.Role.Suspect)).array().splice(0, 10)
      for await (const member of members) {
        await member.roles.set(Config.Role.Unregistered)
       // await member.setNickname(`${Config.Guild.Tag} İsim | Yaş`)
      }
    }
  };

  async function RolsuzeKayitsizVerme()  { // Rolü olmayanı kayıtsıza atma
    
    const guild = client.guilds.cache.get(Config.Guild.Sunucu);
    let can = guild.members.cache.filter(m => m.roles.cache.filter(r => r.id !== guild.id).size == 0)
            can.forEach(r => {
        r.roles.add(Config.Role.Unregistered)
        })
      
  };

  

  
