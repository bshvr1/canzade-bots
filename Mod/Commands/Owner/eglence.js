const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const { MessageMenuOption,  MessageMenu, MessageActionRow } = require("discord-buttons");
const Config = require("../../Settings/Settings.json")
class eglence extends Command {
    constructor(client) {
        super(client, {
            name: "eglence",
            aliases: ["eglence"]
        });
    }

    async run(message, args, client) {
        if(message.author.id !== Config.Permissions.Sahip) return


        const can = new MessageMenuOption()
        .setLabel('Vampir Köylü')
        .setEmoji('🧛')
        .setValue('vk')
        .setDescription('Vampir Köylü')
  
        const can1 = new MessageMenuOption()
        .setLabel('Soru - Cevap')
        .setEmoji('❔')
        .setValue('sc')
        .setDescription('Soru - Cevap')

        const can2 = new MessageMenuOption()
        .setLabel('Gartic.io')
        .setEmoji('📝')
        .setValue('gc')
        .setDescription('Gartic.io')
        
    const select = new MessageMenu()
        .setID('select1')
        .setPlaceholder('Eğlence Rolünüzü Seçin')
        .addOption(can)
        .addOption(can1)
        .addOption(can2)
  
  
     const Row1 = new MessageActionRow()
     .addComponent(select)   
    
    await message.channel.send('Eğlence Rolünüzü Seçin', { components: [Row1] });
}

}
module.exports = eglence;
