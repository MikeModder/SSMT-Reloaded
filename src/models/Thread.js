const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: String,
    body: String,
    author: String,
    createdAt: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Thread', schema);