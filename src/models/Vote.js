const mongoose = require('mongoose');

const schema = mongoose.Schema({
    post: String,
    from: String,
    score: Number
});

module.exports = mongoose.model('Vote', schema);