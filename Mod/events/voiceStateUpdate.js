const { MessageEmbed } = require("discord.js");
const Config = require("../Settings/Settings.json")

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(oldState, newState) {
    if (Config.Log.VoiceChannelJoin && newState.guild.channels.cache.get(Config.Log.VoiceChannelJoin)) {
        let logKanali = newState.guild.channels.cache.get(Config.Log.VoiceChannelJoin);
        if (!oldState.channelID && newState.channelID) return logKanali.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(newState.channelID).name}** adlı sesli kanala **katıldı!**`).catch();
        if (oldState.channelID && !newState.channelID) return logKanali.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(oldState.channelID).name}** adlı sesli kanaldan **ayrıldı!**`).catch();
        if (oldState.channelID && newState.channelID && oldState.channelID != newState.channelID) return logKanali.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi ses kanalını **değiştirdi!** (**${newState.guild.channels.cache.get(oldState.channelID).name}** => **${newState.guild.channels.cache.get(newState.channelID).name}**)`).catch();
       }
    if (Config.Log.VoiceMic && newState.guild.channels.cache.get(Config.Log)) {
        let can = newState.guild.channels.cache.get(Config.Log);
        if (oldState.channelID && oldState.selfMute && !newState.selfMute) return can.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(newState.channelID).name}** adlı sesli kanalda kendi susturmasını **kaldırdı!**`).catch();
        if (oldState.channelID && !oldState.selfMute && newState.selfMute) return can.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(newState.channelID).name}** adlı sesli kanalda kendini **susturdu!**`).catch();
        if (oldState.channelID && oldState.selfDeaf && !newState.selfDeaf) return can.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(newState.channelID).name}** adlı sesli kanalda kendi sağırlaştırmasını **kaldırdı!**`).catch();
        if (oldState.channelID && !oldState.selfDeaf && newState.selfDeaf) return can.send(`**${newState.guild.members.cache.get(newState.id).displayName}** üyesi **${newState.guild.channels.cache.get(newState.channelID).name}** adlı sesli kanalda kendini **sağırlaştırdı!**`).catch();
      }
    }
}

