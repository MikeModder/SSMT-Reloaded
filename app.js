require('dotenv').config();

const passport = require('passport');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const port = parseInt(process.env.PORT) || 8080;

/* Configure PassportJS */
require('./src/config/passport')(passport);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SECRET, resave: true, saveUninitialized: false, store: new MongoStore({ url: process.env.DB_URL }) }));
app.use('/assets', express.static(path.join(__dirname, 'src/static/')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(morgan('dev'));

/* Insert routes here */
app.use('/',        require('./src/routes/index'));
app.use('/threads', require('./src/routes/threads'));

/* Error handler */
app.use((err, req, res, next) => {
    if(err){
        console.error(err)
        return res.status(500).render('errors/500', { user: req.user });
    }
    next();
});
/* 404 handler */
app.all('*', (req, res) => {
    return res.status(404).render('errors/404', { user: req.user });
});

app.listen(port, () => {
    console.log(`[INFO] Listening on port ${port}`);
    mongoose.connect(process.env.DB_URL);
});