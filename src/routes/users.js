const router = require('express').Router();
const validator = require('validator');
const User = require('../models/User');
const Thread = require('../models/Thread');
const Reply = require('../models/Reply');

router.get('/:uid', ensureUserExists, async (req, res) => {
    const uid = req.params.uid;
    const pUser = res.locals.pUser;
    const threads = await Thread.find({ author: uid }).lean().exec();
    const comments = await Reply.find({ author: uid }).lean().exec();

    res.render('users/user', { user: req.user, pUser, threads, comments });
});

async function ensureUserExists(req, res, next) {
    const uid = req.params.uid;
    if(!uid || !validator.isMongoId(uid)) {
        return res.redirect('/');
    }
    const user = await User.findById(uid).select('-password').exec();
    if(!user) return res.status(404).render('errors/404', { user: req.user });
    res.locals.pUser = user;
    next();
}

function ensureLoggedIn(req, res, next) {
    if(req.isAuthenticated()) return next();
    return res.status(401).render('errors/401', { user: req.user });
}

module.exports = router;