
const Command = require("../../base/Command.js");
const Discord = require("discord.js");
const Config = require("../../Settings/Settings.json");
const moment = require("moment")
class Başvuru extends Command {
    constructor(client) {
        super(client, {
            name: "başvuru",
            aliases: ["başvuru"]
        });
    }
    async run(message, args, perm) {
      if (message.author.bot || message.channel.id !== Config.Log.BaşvuruKanal) return;
     // if (message.content !== conf.command) return message.delete();
      if (message.guild.channels.cache.filter((x) => x.parentID === Config.Parent.Başvuru).size >= 7) {
        //message.react(conf.cross);
        return message.channel.send(`${message.author.toString()}, Şuanda fazla kişi için başvuru kanalı açtım lütfen daha sonra dene!`).then((x) => x.delete({ timeout: 20000 }));
      }
      
      message.react(Config.Others.CheckTick);
      message.channel.send(`
      ${message.author.toString()}, sol en üst başvuru kategorisinde sana özel oda açıp seni etiketledim. Sana soracağımız soruları zamanında cevaplaman gerekiyor.
      `).then((x) => x.delete({ timeout: 10000 }));
      
      let modRole = message.guild.roles.cache.find(r => r.id === Config.Permissions.UstYetkili);

      const regex = /[a-zA-Z0-9]{1,20}/g;
      const username = message.author.username.match(regex)[0];
      const newChannel = await message.guild.channels.create(username, {
        topic: message.author.id,
        type: 'text',
        parent: (Config.Parent.Başvuru),
        permissionOverwrites: [
            { id: message.guild.id, deny: ['VIEW_CHANNEL'] },
            { id: modRole.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
            { id: message.author.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }
        ]
      });
    
      
    
        newChannel.overwritePermissions([{ id: message.author.id, allow: ["SEND_MESSAGES"] }]);
        //newMessage.delete();
        await newChannel.send(`${message.author.toString()} Yetkililik için sistemimize başvurdun, öncelikle ismini öğrenebilir miyiz?`);
        const name = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
          max: 1,
          time: 1000 * 60 * 5,
          errors: ["time"]
        }).catch(() => newChannel.delete());
        await newChannel.send(`Memnun oldum ${name.first().content}, Peki ya yaşınız?`);
        const age = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
          max: 1,
          time: 1000 * 60 * 5,
          errors: ["time"]
        }).catch(() => newChannel.delete());
        await newChannel.send(` Tanıştığımıza memnun oldum ${name.first().content}, şimdi bize Discord'da günde kaç saat aktif olduğunu söyleyebilir misin?`);
        const activity = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
          max: 1,
          time: 1000 * 60 * 5,
          errors: ["time"]
        }).catch(() => newChannel.delete());
        await newChannel.send(`Bize taglı üye, public odalarda ses aktifliği kasacak user veya invite sağlayabilir misin?`);
        const invite = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
          max: 1,
          time: 1000 * 60 * 5,
          errors: ["time"]
        }).catch(() => newChannel.delete());
        await newChannel.send(`Başvurunu başarıyla aldım ${name.first().content}, En kısa zamanda bilgilerini inceleyip sana döneceğiz. Başvurun onaylanırsa veya reddedilerse sana özelden mesaj atacağım. Eğer DM'n kapalıysa seni kanala etiketleyip bilgilendireceğim.`);
     
        const embed = new Discord.MessageEmbed()
          .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 2048 }))
          .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
          .setTitle("Cevap Bekliyor...")
          .setColor("BLUE")
          .setDescription(`
      **Başvuruda bulunan:** ${message.member.toString()} \`(${message.author.username} - ${message.author.id})\`
      **Başvuru tarihi:** ${moment().format("LLL")}
      **İsim:** ${name.first().content}
      **Yaş:** ${age.first().content}
      **Aktiflik Süresi:** ${activity.first().content}
      **Günlük İnvite Durumu:** ${invite.first().content}
          `);
        await message.guild.channels.cache.get(Config.Log.BaşvuruLog).send(embed).then(async can => {

let reactions = ['✅', '❌'];
for(let reaction of reactions) await can.react(reaction);

const first= can.createReactionCollector((reaction, user) => reaction.emoji.name == "✅" && user.id == message.author.id, { time: 30000 });
                const second = can.createReactionCollector((reaction, user) => reaction.emoji.name == "❌" && user.id == message.author.id, { time: 30000 });

first.on('collect', async reaction => {
  can.edit(new Discord.MessageEmbed()
  .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setTitle("Cevap Bekliyor...")
  .setColor("BLUE")
  .setDescription(`**ONAYLANDI!!!\n\n**Başvuruda bulunan:** ${message.member.toString()} \`(${message.author.username} - ${message.author.id})\`
          **Başvuru tarihi:** ${moment().format("LLL")}
          **İsim:** ${name.first().content}
          **Yaş:** ${age.first().content}
          **Aktiflik Süresi:** ${activity.first().content}
          **Günlük İnvite Durumu:** ${invite.first().content}`));
          message.guild.member(message.author).roles.add(Config.Permissions.Baslangic)})
    //      message.author.send(`Sunucumuza yetkililik başvurun kabul edildi. Yetki permlerini verdim.`).catch(err => {message.channel.send(`${message.author} Sunucumuza yetkili başvurun kabul edildi. Yetki permlerini verdim.`)})
second.on('collect', async reaction => {
  can.edit(new Discord.MessageEmbed()
  .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setTitle("Cevap Bekliyor...")
  .setColor("BLUE")
  .setDescription(`**REDDEDİLDİ!!!\n\n**Başvuruda bulunan:** ${message.member.toString()} \`(${message.author.username} - ${message.author.id})\`
          **Başvuru tarihi:** ${moment().format("LLL")}
          **İsim:** ${name.first().content}
          **Yaş:** ${age.first().content}
          **Aktiflik Süresi:** ${activity.first().content}
          **Günlük İnvite Durumu:** ${invite.first().content}`));
         // message.author.send(`Üzgünüm sunucumuza yetkililik başvurun reddedildi.`).catch(err => {message.channel.send(`${message.author} Üzgünüm sunucumuza yetkililik başvurun reddedildi.`)})
        })
first.on('end', async reaction => {
  can.edit(new Discord.MessageEmbed()
  .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
  .setTitle("Cevap Bekliyor...")
  .setColor("BLUE")
  .setDescription(`**SÜRESİ DOLDU!!!\n\n**Başvuruda bulunan:** ${message.member.toString()} \`(${message.author.username} - ${message.author.id})\`
          **Başvuru tarihi:** ${moment().format("LLL")}
          **İsim:** ${name.first().content}
          **Yaş:** ${age.first().content}
          **Aktiflik Süresi:** ${activity.first().content}
          **Günlük İnvite Durumu:** ${invite.first().content}`));
      //    message.author.send(`Üzgünüm sunucumuza yetkililik başvuruna yetkililer herhangi bir cevap vermediği için süresi doldu.`).catch(err => {message.channel.send(`${message.author} Üzgünüm sunucumuza yetkililik başvuruna yetkililer herhangi bir cevap vermediği için süresi doldu.`)})
          
  
          
})

})

       

        setTimeout(() => {
          newChannel.delete();
        }, 15000);
      }
      }
    
  
  
  
  module.exports = Başvuru;
      /*denied.on("collect", () => newChannel.delete());
      
      approved.on("end", (collected) => {
        if (collected.size !== 0) return;
        newChannel.delete();
      });
 

      
          
       
  */
      
  
      
      
    
      
  
      
  
      
      
    
      
  
      
  
      
      
    
      
  
      
  
      
      
    
      
  