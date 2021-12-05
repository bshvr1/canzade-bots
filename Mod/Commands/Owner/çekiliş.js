const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const { MessageButton } = require("discord-buttons");
const db = require("../../models/cantUnBan.js")
class cekilis extends Command {
    constructor(client) {
        super(client, {
            name: "cekilis",
            aliases: ["cekilis"]
        });
    }

    async run(message, args, client) {
      

 let button7 = new MessageButton()
 .setStyle("red")
 .setID("Etkinlik")
 .setLabel("🎉 Etkinlik Katılımcısı")

 let button6 = new MessageButton()
 .setStyle("red")
 .setID("Çekiliş")
 .setLabel("🎉 Çekiliş Katılımcısı")


 message.channel.send("Aşağıdaki menüden kendinize katılımcı rolü seçebilirsiniz. Herhangi bir rolü almak için o butona tıklayın.",{
     buttons: [button7, button6]
 })
 
}

}
module.exports = cekilis;
