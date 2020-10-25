const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
    guesserId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    animationId: {type: mongoose.Schema.Types.ObjectId, ref: "Animation"},
    usedAttempts: {type: Number, default: 0}
});

module.exports = mongoose.model('Guess', guessSchema);