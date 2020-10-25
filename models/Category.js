const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    bgColorHex: {type: String},
    fontColorHex: {type: String},
    emojiCode: {type: String}
});

module.exports = mongoose.model('Category', CategorySchema);