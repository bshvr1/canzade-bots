const Command = require("../../base/Command.js");
const data = require("../../models/cezalar.js")
const ms = require("ms")
const Config = require("../../Settings/Settings.json")
const Discord = require("discord.js")
const mutes = require("../../models/voicemute.js")
const moment = require("moment")
require("moment-duration-format")
moment.locale("tr")
class TopluTaşı extends Command {
    constructor(client) {
        super(client, {
            name: "toplu-taşı",
            aliases: ["toplutaşı", "ttaşı"]
        });
    }

    async run(message, args, perm) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return
        let abc = args.slice(0).join(' ');
        let argskanal = message.guild.channels.cache.get(abc) || message.guild.channels.cache.find(a => a.name === abc);
        let kanallar = message.guild.channels.cache.filter(a => a.type === "voice" && a.permissionsFor(message.author).has('CONNECT'));
        let kanalsıra = kanallar.sort((x, y) => x.position-y.position).array();
        if(args[0] === "tüm") {
          try {
            message.guild.members.cache.filter(a => a.voice.channel && !a.user.bot && a.voice.channelID !== message.member.voice.channelID).array().forEach((x, index) => setTimeout(() => { x.voice.setChannel(message.member.voice.channelID ) }, index*1000));
            message.reply(`**Ses kanalında bulunan herkesi başarıyla**  \`${message.member.voice.channel.name}\`  **ses kanalına taşıyorum!**`);
            } catch (err) {
                return message.channel.send('Bir sorun oluştu!').then(x => x.delete(5000))
          }
        } else if(abc) {
          if(argskanal.type !== "voice" || !argskanal.permissionsFor(message.author).has('CONNECT')) return message.reply(`**Belirtilen kanala toplu taşıma işlemi yapılamaz veya kanala giriş iznin yok!**`).then(x => x.delete({timeout: 5000}));    message.member.voice.channel.members.array().forEach((x, index) => setTimeout(() => { x.voice.setChannel(argskanal.id) }, index*1000))
          message.reply(`Kanalında olan herkesi **${argskanal.name}** kanalına taşıyorum.`);
        } else {
          if(!message.member.voice) return message.reply('Ses kanalında değilsin!').then(x => x.delete({timeout: 5000}))
         // if(message.member.voice.channel.members.size < 2) return message.reply('Bunu sadece kanalda ikiden fazla kişi olduğunda yapabilirsin').then(x => x.delete({timeout: 5000}));
          message.channel.send(kanalsıra.map((x, index) => `${index+1}-) ${x.name}`).join('\n') + 'Üyeleri taşımak istediğin kanalın IDsini belirtmelisin.', {code: "css", split: true})//.then(x => x.delete({timeout: 30000}));
          try {
            var filter = m => m.author.id === message.author.id && Number(m.content) < kanallar.size
            message.channel.awaitMessages(filter, {max: 1, time: 30000, errors: ['time']}).then((collected) => {
              if(isNaN(collected.first().content)) return message.reply(`Belirttiğin kanal geçerli değil`).then(x => x.delete({timeout: 5000}));
              message.member.voice.channel.members.array().forEach((x, index) => setTimeout(() => { x.voice.setChannel(kanalsıra[Number(collected.first().content)-1].id) }, index*1000));
              message.reply(`**Ses kanalında bulunan herkesi başarıyla** **${kanalsıra[Number(collected.first().content)-1].name}** kanalına taşıyorum`);
            });
            } catch (err) {
                return message.channel.send('İşlem iptal edildi')
          }
        };
      }
    }

module.exports = TopluTaşı;
