const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false},
    isPremium: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', UserSchema);