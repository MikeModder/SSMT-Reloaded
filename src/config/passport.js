const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const User = require('../models/User');

module.exports = (passport) => {
    passport.use(new LocalStrategy((username, password, cb) => {
        User.findOne({ username })
            .then(u => {
                if(!u) return cb(null, false);
                if(!bcrypt.compareSync(password, u.password)) return cb(null, false);
                return cb(null, u);
            })
            .catch(e => {
                return cb(e);
            });
    }));

    passport.serializeUser((user, cb) => { return cb(null, user); });
    passport.deserializeUser((id, cb) => { return cb(null, id); });
};