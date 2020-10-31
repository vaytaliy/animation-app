require('dotenv').config({ path: '../.env' })
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const middleware = require('../middleware/index.js')
const csurf = require('csurf');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const sessions = require('client-sessions');

let csrfProtection = csurf({ cookie: true });

let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ACCNAME,
        pass: process.env.ACCPASS,
    },
});

router.get('/register', csrfProtection, (req, res) => {
    res.render('./auth/register.ejs', { csrfToken: req.csrfToken(), username: req.query.username, email: req.query.email });
});

router.get('/verify', (req, res) => {
    if (req.session && req.session.userId && !(req.user.verified)) {

        const email = req.user.email;
        const username = req.user.username;
        const userSerial = { email: email };

        jwt.sign(userSerial, process.env.ACCESSTOKEN,
            { expiresIn: '300000' }, (err, token) => {
                if (err) {
                    console.log("error generating token");
                    res.redirect('/');
                } else {
                    const url = `http://${process.env.HOST}:${process.env.PORT}/confirmation/${token}`
                    transporter.sendMail({
                        from: "aniguessr@gmail.com",
                        to: email,
                        subject: "Email confirmation",
                        html: `Dear, ${username}. Please confirm your email: <a href="${url}">${url}</a><div>If you aren't the recipient of </div>`
                    })
                    req.flash('info', `An email with account verification token has been sent to ${email}. 
                    Please check your inbox and follow the link address to activate your account`);
                    return res.redirect('/login?email=' + email);
                }
            })
    } else {
        res.redirect('back');
    }
})

router.post('/register', middleware.passMismatch, async (req, res) => {
    const usernameRule = /^[a-zA-Z]\w{2,29}/g;
    const MIN_PASS_LENGTH = 5
    const MAX_PASS_LENGTH = 50;
    const MIN_USER_LENGTH = 3;
    const MAX_USER_LENGTH = 30;

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (email.length < 1 || email.length > 150
        || username.length < MIN_USER_LENGTH
        || username.length > MAX_USER_LENGTH
        || password.length < MIN_PASS_LENGTH
        || password.length > MAX_PASS_LENGTH
        || !username.match(usernameRule)
        || ((username.match(usernameRule)
        && username != username.match(usernameRule).toString()))) {
            req.flash('error', 'Incorrect data passed for registration');
            res.redirect('back');
    }

    const hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;
    const user = new User(req.body);
    try {
        let foundUser = await User.findOne({ $and: [{ verified: true }, { $or: [{ email: req.body.email }, { username: req.body.username }] }] })
        if (!foundUser) {
            try {
                await user.save();

                const email = req.body.email;
                const username = req.body.username;
                const userSerial = { email: email };

                jwt.sign(userSerial, process.env.ACCESSTOKEN,
                    { expiresIn: '300000' }, (err, token) => {
                        if (err) {
                            console.log("error generating token");
                            res.redirect('/');
                        } else {
                            const url = `http://localhost:5500/confirmation/${token}`
                            transporter.sendMail({
                                from: "aniguessr@gmail.com",
                                to: email,
                                subject: "Email confirmation",
                                html: `Dear, ${username}. Please confirm your email: <a href="${url}">${url}</a><div>If you aren't the recipient of </div>`
                            })
                            req.flash('info', `An email with account verification token has been sent to ${email}. 
                            Please check your inbox and follow the link address to activate your account`);
                            return res.redirect('/login?email=' + email);
                        }
                    })
            }
            catch (err) {
                console.log(err)
                req.flash('error', 'Error saving user, please try again');
                return res.redirect('/register');
            }
        }
        else {
            console.log('user exists');
            req.flash('error', 'User with the given email or username already exists');
            return res.redirect('/register');
        }
    }
    catch (err) {
        req.flash('error', 'Something broke please try again :(');
        return res.redirect('/register');
    }
});

router.get('/confirmation/:token', async (req, res) => {
    jwt.verify(req.params.token, process.env.ACCESSTOKEN, (err, user) => {
        if (err) {
            console.log(err.message); // if jwt is malformed
            req.flash('error', 'Something went wrong activating your account, please try again')
            res.redirect('/login')
        } else {
            User.findOneAndUpdate({ email: user.email }, { $set: { verified: true } })
                .then(() => {
                    req.flash('success', 'Your account ' + user.email + ' has been successfully activated!')
                    res.redirect('/login?email=' + user.email);
                })
                .catch((err) => {
                    console.log(err.message);
                    req.flash('error', 'Something went wrong activating your account, please try again')
                    res.redirect('/animations')
                })
        }
    })
})

router.get('/login', csrfProtection, (req, res) => {
    res.render('./auth/login.ejs', { email: req.query.email, csrfToken: req.csrfToken() });
});

router.post('/login', async (req, res) => {
    try {
        let foundUser = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
        if (foundUser) {
            if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
                req.flash('error', 'Incorrect password');
                return res.redirect('/login')
            }
            req.session.userId = foundUser._id;
            req.flash('success', 'Successfully logged in');
            return res.redirect('/animations');
        } else {
            req.flash('error', 'Account does not exist');
            return res.redirect('/login');
        }
    }
    catch (err) {
        req.flash('error', err.message)
        return res.redirect('/login')
    }
});

router.get('/passwordrecovery', csrfProtection, (req, res) => {
    res.render('./auth/recovery.ejs', { csrfToken: req.csrfToken() });
})

router.post('/recovery', async (req, res) => {
    try {
        let foundUser = await User.findOne({ email: req.body.email });
        if (foundUser) {

            if (foundUser.verified) {

                const email = req.body.email;
                const username = foundUser.username;
                const userSerial = { email: email };

                jwt.sign(userSerial, process.env.RECOVERYTOKEN, { expiresIn: '300000' }, (err, token) => {
                    if (err) {
                        console.log("error generating token");
                        return res.redirect('/');
                    } else {
                        const url = `http://${process.env.HOST}:${process.env.PORT}/setpassword/${token}`
                        transporter.sendMail({
                            from: "aniguessr@gmail.com",
                            to: email,
                            subject: "Changing password",
                            html: `Dear, ${username}. Here is your link to set new password: <a href="${url}">${url}</a><div> If you aren't the recipient of 
                        this email, please ignore it.
                        </div>`
                        })
                        req.flash('info', `An email with password reset link has been sent to ${email}. 
                            Please check your inbox and follow the link address to change your password`);
                        return res.redirect('/animations');
                    }
                });
            } else {
                req.flash('error', 'Given email was not verified, please verify it first');
                return res.redirect('/login');
            }
        } else {
            req.flash('error', 'Given email not found');
            return res.redirect('/');
        }
    } catch (err) {
        console.log(err);
    }
})

router.get('/setpassword/:token', csrfProtection, (req, res) => {
    jwt.verify(req.params.token, process.env.RECOVERYTOKEN, (err, user) => {
        if (err) {
            console.log(err.message); // if jwt is malformed
            res.redirect('/');
        } else {
            res.render('./auth/passwordchange.ejs', { user: user, token: req.params.token, csrfToken: req.csrfToken() });
        }
    })
})

router.put('/setpassword/:token', middleware.passMismatch, (req, res) => {

    const hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;

    jwt.verify(req.params.token, process.env.RECOVERYTOKEN, (err, user) => {
        if (err) {
            console.log(err.message); // if jwt is malformed
            res.redirect('/');
        } else {
            User.findOne({ email: user.email })
                .then((foundUser) => {
                    if (foundUser) {
                        User.findOneAndUpdate({ email: user.email }, { $set: { password: req.body.password } })
                            .then(() => {
                                req.flash('success', 'Password changed successfully!')
                                return res.redirect('/login');
                            })
                            .catch((err) => {
                                console.log(err.message);
                                req.flash('error', 'Oops something went wrong :(')
                                return res.redirect('/login');
                            })
                    } else {
                        req.flash('error', 'Oops something went wrong :((')
                        return res.redirect('/login');
                    }
                })
        }
    })
})

router.get('/logout', (req, res) => {
    if (req.session) {
        console.log(req.session.userId = null)
        res.redirect('/animations')
    }
})

module.exports = router;