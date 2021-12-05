module.exports = class {
    constructor(client) {
      this.client = client;
    }

    async run(invite) {
      const gi = this.client.invites.get(invite.guild.id);
  gi.set(invite.code, invite);
 this.client.invites.set(invite.guild.id, gi);
 this.client.logger.log(`${invite.code} daveti oluşturukdu.`, "log")

    }
}