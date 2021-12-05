const Command = require("../../base/Command.js");
const Discord = require("discord.js");

class Randevu extends Command {
    constructor(client) {
        super(client, {
            name: "randevu",
            aliases: ["randevu","terapi"]
        });
    }
    async run(message, args, data) {
    const kanalakıs = message.guild.channels.cache.get(Log.Terapi.Log);
    const kanallog = message.guild.channels.cache.get(Log.Terapi.Onay);
    const kanalran = message.guild.channels.cache.get(Log.Terapi.Randevu);

    let yetki = message.guild.roles.cache.get(Permissions.Terapi.Auth_Roles);

    //let yetkili = message.guild.roles.cache.get(global.Perm.Terapi.Role2);

    if (message.channel.id !== kanalran.id) {
        return;
    };

    const erkek = [
        "erkek"
    ];
    const kız = [
        "kız",
        "kadın",
        "bayan"
    ];
    const trial = [
        "tri",
        "trial"
    ];

    const akısembed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(`${message.member} kişisi terapi bekliyor 2 saat içerisinde müsaitseniz lütfen onaylayın.`)
        .setThumbnail(`${message.member.user.displayAvatarURL()}`)
        .setTimestamp()
        .setFooter(`Emojiye basmanız terapiyi onayladığınız anlamına gelir.`)

    if (erkek.some(word => message.content.toLowerCase().includes(word))) {
        akısembed.addField('Ek istek', 'Erkek Terapist', true);
    }
    if (kız.some(word => message.content.toLowerCase().includes(word))) {
        akısembed.addField('Ek istek', 'Kadın Terapist', true);
    }
    if (trial.some(word => message.content.toLowerCase().includes(word))) {
        akısembed.addField('Ek istek', 'Trial Terapist', true);
    }

    const onayembed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(`${message.member} Terapi isteği onaylandı.`)
        .setTimestamp()

    message.channel.send(`Randevu talebiniz alındı ${message.member}. 2 saat içerisinde terapistlerden onay gelirse <#${Log.Terapi.Onay}> kanalında etiketleneceksiniz. İyi terapiler :)`);

    try {

        var akısmoji = await kanalakıs.send(akısembed);

        kanalakıs.send(`<@&${Permissions.Terapi.Auth_Roles}>`).then(
            //${yetkili}
            msg => msg.delete({ timeout: 1000 })
        );

        await akısmoji.react("✔️");
    } catch (error) {
        console.error(error);
    }
    const filter = (reaction, user) => user.id !== message.client.user.id;
    const collector = akısmoji.createReactionCollector(filter, {
        time: 7200000
    });

    collector.on("collect", (reaction, user) => {

        switch (reaction.emoji.name) {
            case "✔️":
                onayembed.setThumbnail(`${user.avatarURL()}`)
                onayembed.addField(`Onaylayan Terapist`, `${user}`, true)
                kanalakıs.send(onayembed).then(
                    kanallog.send(
                        `Talebiniz ${user} terapisti tarafından onaylandı ${message.member}. Lütfen bekleme odasına geçip terapistin sizi çekmesini bekleyin.`
                    )
                ).catch(console.error);
                collector.stop();
                reaction.users.remove(user);
                break;

            default:
                break;
        }
    });

    collector.on("end", () => {
        akısmoji.reactions.removeAll();
        akısmoji.delete({ timeout: 5000 });
    });

}

}

module.exports = Randevu;