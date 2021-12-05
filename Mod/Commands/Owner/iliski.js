const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const { MessageMenuOption,  MessageMenu, MessageActionRow } = require("discord-buttons");
const Config = require("../../Settings/Settings.json")
class iliski extends Command {
    constructor(client) {
        super(client, {
            name: "iliski",
            aliases: ["iliski"]
        });
    }

    async run(message, args, client) {
        if(message.author.id !== Config.Permissions.Sahip) return


        const can = new MessageMenuOption()
        .setLabel('Sevgilim Var')
        .setEmoji('💍')
        .setValue('lovers')
        .setDescription('Sevgilim Var')
  
        const can1 = new MessageMenuOption()
        .setLabel('Sevgilim Yok')
        .setEmoji('💔')
        .setValue('unlovers')
        .setDescription('Sevgilim Yok')
        
    const select = new MessageMenu()
        .setID('select1')
        .setPlaceholder('İlişki Durumunuzu seçin')
        .addOption(can)
        .addOption(can1)
  
  
     const Row1 = new MessageActionRow()
     .addComponent(select)   
    
    await message.channel.send('İlişki Durumunuzu seçin', { components: [Row1] });
}

}
module.exports = iliski;
