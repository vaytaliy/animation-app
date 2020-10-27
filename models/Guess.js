const mongoose = require('mongoose');

const guessSchema = new mongoose.Schema({
    guesserId: {type: String},
    animationId: {type: String},
    finished: {type: Boolean, default: false},
    hasWon: {type: Boolean, default: false},
    usedAttempts: {type: Number, default: 0}
});

module.exports = mongoose.model('Guess', guessSchema);