const User = require('../schema/User.js');

class UserController {

    getUserByDiscordId(discordId) {
        return User.findOne({ 'discord.id': discordId });
    }

    async createUserIfNotExists(user) {
        const userExists = await this.getUserByDiscordId(user.id);
        if (userExists) return userExists;
        const newUser = new User({
            discord: {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar,
                nickname: user.nickname
            }
        });
        return await newUser.save();
    }
}

module.exports = new UserController();