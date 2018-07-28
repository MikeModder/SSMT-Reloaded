const router = require('express').Router();
const passport = require('passport');
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('home', { user: req.user, error: req.flash('error'), info: req.flash('user') });
});

/* router.get('/error', (req, res) => {
    throw new Error('sample error');
}); */

router.get('/login', (req, res) => {
    if(req.user) {
        req.flash('error', 'You are already signed in!');
        return res.redirect('/');
    }
    res.render('login', { error: req.flash('error') });
});

router.get('/signup', (req, res) => {
    if(req.user){
        req.flash('error', 'You are already signed in!');
        return res.redirect('/');
    }
    res.render('signup', { error: req.flash('error') });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: 'Incorrect username or password!' }), (req, res) => {
    req.flash('info', 'Welcome back!');
    res.redirect('/');
});

router.post('/signup', async (req, res) => {
    if(req.user){
        req.flash('error', 'You are already signed in!');
        return res.redirect('/');
    }
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    if(validator.isEmpty(username) || validator.isEmpty(password) || validator.isEmpty(password2)) return res.render('signup', { error: 'One or more fields is empty!' });
    if(password !== password2) { req.flash('error', 'Passwords do not match!'); return res.redirect('/signup'); }
    const u = new User({ username, password });
    u.save()
        .then(() => {
            req.login(u, (e) => { req.flash('error', e) });
            res.redirect('/');
        })
        .catch(() => {
            req.flash('error', 'Error while signing up! Perhaps that username is taken?');
            res.redirect('/signup');
        });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;