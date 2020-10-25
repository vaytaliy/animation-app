require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const middleware = require('./middleware');
const methodOverride = require('method-override');
const sessions = require('client-sessions');
// const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
// const helmet = require("helmet");
const flash = require('connect-flash');
// const csurf = require('csurf');
// const Category = require('./models/Category.js')

// const myip = process.env.HOST
// const myport = process.env.PORT

//requiring routes

const authRoutes = require('./routes/index.js');
const animationRoutes = require('./routes/animations.js');
const profileRoutes = require('./routes/profile.js')

//======

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(express.json({
    type: ['application/json', 'text/plain'],
    limit: 80 * 100000 //8 megabytes
}))

app.use(require('express-session')({
	secret:'blabla',
	saveUninitialized: true,
    resave: true
}));

app.use(flash());
app.use(cookieParser());
// app.use(helmet());

app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.success = req.flash('success');
    next();
})

app.use(sessions({
    cookieName: "session",
    secret: process.env.PASSENC,
    duration: 60 * 60 * 1000, //60 minutes closed browser
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

app.use(middleware.sessionLocals);

try {
    mongoose.connect("mongodb://localhost:27017/aniguessr", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
}
catch (err) {
    console.log('unable to connect to db ' + err.message)
}

app.use(authRoutes);
app.use(animationRoutes);
app.use(profileRoutes);


app.listen(8080, '192.168.0.107', () => {
    console.log('listening on port')
})