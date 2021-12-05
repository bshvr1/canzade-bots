const Command = require("../../base/Command.js");
const Discord = require("discord.js")
const { MessageButton, MessageActionRow } = require("discord-buttons");
const db = require("../../models/cantUnBan.js")
class button extends Command {
    constructor(client) {
        super(client, {
            name: "button",
            aliases: ["button"]
        });
    }

    async run(message, args, client) {
      /*

 let button1 = new MessageButton()
 .setStyle("red")
 .setID("Notlarım")
 .setLabel("Notlarım")

 let button2 = new MessageButton()
 .setStyle("red")
 .setID("Cezalarım")
 .setLabel("Cezalarım")

 let button3 = new MessageButton()
 .setStyle("red")
 .setID("Aktif Cezalarım")
 .setLabel("Aktif Cezalarım")

 let button4 = new MessageButton()
 .setStyle("red")
 .setID("Ceza Sayım")
 .setLabel("Ceza Sayım")

 let button5 = new MessageButton()
 .setStyle("red")
 .setID("Ceza Puanım")
 .setLabel("Ceza Puanım")

*/

let memberJoinedServer = new MessageButton()
 .setStyle("blurple")
 .setID("memberJoinedServer")
 .setLabel("1")

 let historyName = new MessageButton()
 .setStyle("blurple")
 .setID("historyName")
 .setLabel("2")


 let activePenalties = new MessageButton()
 .setStyle("blurple")
 .setID("activePenalties")
 .setLabel("3")

 let row1 = new MessageActionRow()
.addComponent(memberJoinedServer)
.addComponent(historyName)
.addComponent(activePenalties)

 let penaltyPoints = new MessageButton()
 .setStyle("blurple")
 .setID("penaltyPoints")
 .setLabel("4")

 let historyPenalties = new MessageButton()
 .setStyle("blurple")
 .setID("historyPenalties")
 .setLabel("5")

 let notes = new MessageButton()
 .setStyle("blurple")
 .setID("notes")
 .setLabel("6")

 let row2 = new MessageActionRow()
 .addComponent(penaltyPoints)
 .addComponent(historyPenalties)
 .addComponent(notes)

 let penaltiesNumber = new MessageButton()
 .setStyle("blurple")
 .setID("penaltiesNumber")
 .setLabel("7")

 let memberRoles = new MessageButton()
 .setStyle("blurple")
 .setID("memberRoles")
 .setLabel("8")

 let createdAt = new MessageButton()
 .setStyle("blurple")
 .setID("createdAt")
 .setLabel("9")

 let row3 = new MessageActionRow()
 .addComponent(penaltiesNumber)
 .addComponent(memberRoles)
 .addComponent(createdAt)




 message.channel.send(`
 Aşağıdaki menüden kendinize bir işlem seçip sunucu içi depolanan verilerinizi sorgulayabilirsiniz. Verileriniz sadece sizin görebileceğiniz şekilde gönderilir.

 • 1: Sunucuya giriş tarihinizi öğrenin.
 • 2: Kayıt olmuş olduğunuz isimleri öğrenin.
 • 3: Devam eden cezanız (varsa) hakkında bilgi alın.
 
 • 4: Ceza puanınızı öğrenin.
 • 5: Geçmiş cezalarınızı öğrenin.
 • 6: Notlarınıza bakın.

 • 7: Ceza sayınız öğrenin.
 • 8: Üzerinizdeki rolleri sıralayın.
 • 9: Hesabınızın açılış tarihini öğrenin.`,{
     components: [row1, row2, row3]
 })// • 6: Üstünüzde bulunan rollerin listesini alın.

 
}

}
module.exports = button;
