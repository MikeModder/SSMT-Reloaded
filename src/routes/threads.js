const router = require('express').Router();

const Thread = require('../models/Thread');
const User   = require('../models/User');
const Reply  = require('../models/Reply');

const validator = require('validator');
const Joi       = require('joi');

const postSchema = Joi.object().keys({
    title: Joi.string().min(4).max(20).required(),
    text: Joi.string().min(1).max(200).required()
});

const replySchema = Joi.object().keys({
    text: Joi.string().min(1).max(120).required()
});

router.get('/', async (req, res) => {
    const threads = await Thread.find().lean().exec();
    let formatted = [];
    await eachOf(threads, async (t) => {
        t.author = await User.findById(t.author).select('-password').exec();
        t.commentCount = await Reply.count({ to: t._id });
        formatted.push(t);
    });
    res.render('threads/list', { user: req.user, threads: formatted, error: req.flash('error') });
});

router.post('/new', ensureLoggedIn, async (req, res) => {
    const { title, text } = req.body;
    /*if(validator.isEmpty(title) || validator.isEmpty(text)) {
        req.flash('error', 'You must provide a title and body!');
        return res.redirect('/threads');
    }*/
    const result = Joi.validate({ text, title }, postSchema);
    if(result.error) {
        req.flash('error', result.error.details[0].message);
        return res.redirect('/threads');
    }

    const t = new Thread({ title, body: text, author: req.user._id });
    t.save((err, newDoc) => {
        if(err) throw err;
        res.redirect(`/threads/${newDoc._id}`);
    });
    
    
});

router.get('/:tid', ensureThreadExists, async (req, res) => {
    const thread = res.locals.thread;
    const replies = await Reply.find({ to: thread._id }).lean().exec();
    let formattedRep = [];
    await eachOf(replies, async (r) => {
        r.author = await User.findById(r.author).select('-password').exec();
        formattedRep.push(r);
    });
    res.render('threads/thread', { user: req.user, thread, comments: formattedRep, error: req.flash('error') });
});

router.post('/:tid/new', ensureLoggedIn, ensureThreadExists, async (req, res) => {
    const tid = req.params.tid;
    const text = req.body.text;
    const result = Joi.validate({ text }, replySchema);
    if(result.error) {
        req.flash('error', result.error.details[0].message);
        return res.redirect(`/threads/${tid}`);
    }
    const r = new Reply({ to: tid, author: req.user._id, text });
    r.save((err, nr) => {
        if(err) throw err;
        res.redirect(`/threads/${tid}`);
    });
});

async function ensureThreadExists(req, res, next) {
    const tid = req.params.tid;
    if(!tid || !validator.isMongoId(tid)) {
        return res.redirect('/threads');
    }
    const thread = await Thread.findById(tid);
    if(!thread) return res.render('error/404', { user: req.user });
    thread.author = await User.findById(thread.author).select('-password').exec();
    res.locals.thread = thread;
    next();
}

function ensureLoggedIn(req, res, next) {
    if(req.isAuthenticated()) return next();
    return res.status(401).render('errors/401', { user: req.user });
}

async function eachOf(array, cb) {
    for(let i = 0; i < array.length; i++) {
        await cb(array[i], i);
    }
}

module.exports = router;