const mongoose = require('mongoose');

const AnimationSchema = new mongoose.Schema({
    creator: {
        id:
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name:
            { type: String }
    },
    frames: { type: [String] },
    coverFrame: { type: String, default: '' },
    playSpeed: { type: Number, default: 6 },
    isDraft: { type: Boolean, default: true },
    colorCollections: { type: [String] },
    clipboard: { type: [String] },
    draftDate: { type: Date },
    postDate: { type: Date },
    name: { type: String, required: true },
    discardedByAdmin: { type: Boolean, default: false },
    description: { type: String },
    guessString: { type: [String] },
    congratulationsMessage: { type: String },
    guesses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guess"
        }
    ],
    allowedGuesses: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    adminComment: { type: String },
    isOfficial: { type: Boolean, default: false },
    isFileHeavy: { type: Boolean, default: false },
    likes: {
        voterIds: { type: [String] },
        totalLikes: { type: Number, default: 0 }
    },
    dislikes: {
        voterIds: { type: [String] },
        totalDislikes: { type: Number, default: 0 }
    },
    reactions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reaction"
        }
    ]
});

module.exports = mongoose.model('Animation', AnimationSchema);