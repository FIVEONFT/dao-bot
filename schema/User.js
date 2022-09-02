const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    address: {
        type: String,
        trim: true,
        default: null
    },
    twitter: {
        type: String,
        trim: true,
        default: null
    },
    discord: {
        id: '',
        username: '',
        discriminator: '',
        avatar: '',
        nickname: '',
        roles: []
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;