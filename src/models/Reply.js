const mongoose = require('mongoose');

const schema = mongoose.Schema({
    to: String,
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Reply', schema);