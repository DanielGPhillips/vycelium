const { model, Schema } = require('mongoose');
// const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Artist = require('./Artist');
const userSchema = new Schema({
    username: String,
    password: String,
    email: {
        type: String,
        match: [/.+@.+\..+/, 'Must match an email adress!']
    },
    profilePicture: String,
    token: String,
    dateCreated: String,
    profileBanner: String,
    primaryTag: String,
    primaryPlatform: String,
    primaryLanguage: String,
    about: String,
    vtuber: Boolean,
    vtuberId: String,
    artist: Boolean,
    artistId: String,
    followers: Array,
    followersCount: Number,
    following: Array,
    followingCount: Number,
    posts: Array
});

// userSchema.pre('save', async function (next) {
//     if (this.isNew || this.isModified('password')) {
//         const saltRounds = 10;
//         this.password = await bcrypt.has(this.password, saltRounds);
//     }

//     next();
// });

// userSchema.methods.isCorrectPassword = async function (password) {
//     return bcrypt.compare(password, this.password);
// };

const User = model('User', userSchema);

module.exports = User;