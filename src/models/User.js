const mongoose = require('mongoose');
const uniquePlugin = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');

const schema = mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

schema.methods.checkPass = function (pass) {
    bcrypt.compare(pass, this.password, (err, same) => {
        return same;
    });
};

schema.plugin(uniquePlugin);

/*schema.pre('save', (next) => {
    bcrypt.genSalt(10)
        .then(salt => {
            bcrypt.hash(this.password, salt)
                .then(hash => { this.password = hash; next(); });
        })
        .catch(e => { throw e; });
});*/

module.exports = mongoose.model('User', schema);