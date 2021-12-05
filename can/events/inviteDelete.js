module.exports = class {
    constructor(client) {
      this.client = client;
    }

    async run(invite) {
      const gi = this.client.invites.get(invite.guild.id);
      gi.delete(invite.code);
      this.client.invites.delete(invite.guild.id, gi);
        this.client.logger.log(`${invite.code} daveti silindi, davet sistemden kaldırıldı!`, "log")
    }
}