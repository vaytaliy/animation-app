let middlewareObj = {};
const User = require('../models/User');
const Animation = require('../models/Animation');
const Category = require('../models/Category');

middlewareObj.sessionLocals = async (req, res, next) => {
    if (!(req.session && req.session.userId)) {
        return next();
    }
    try {
        let foundUser = await User.findById(req.session.userId)
        if (!foundUser) {
            return next();
        }
        foundUser.password = undefined;
        req.user = foundUser;
        res.locals.user = foundUser;
        next();
    }
    catch (err) {
        return next(err);
    }
}

middlewareObj.loginRequired = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'You must be logged in to do that')
        return res.redirect('/login')
    }
    next();
}

middlewareObj.passMismatch = (req, res, next) => {
    if (req.body.password !== req.body.repeatedPassword) {
        req.flash('error', "Password input and confirmation don't match!")
        if (req.params.token) {
            return res.redirect('/setpassword/' + req.params.token);
        } else {
            return res.redirect('/register/?email=' + req.body.email + '&username=' + req.body.username);
        }
    }
    next();
}

middlewareObj.findAllCategories = async(req, res, next) => {
    res.locals.categories = await Category.find({});
    next();
}

middlewareObj.animationBelongsToUser = async (req, res, next) => {
    try {
        let foundAnimation = await Animation.findById(req.params.id);
        console.log(foundAnimation.creator.id == res.locals.user._id);
        if (foundAnimation.creator.id.equals(res.locals.user._id)) {
            return next()
        } else {
            req.flash('error', 'You do not have access to this page')
            return res.redirect('/animations');
        }
    } catch(err) {
        req.flash('error', 'Could not find animation');
        console.log('error finding animation')
        res.redirect('/animations');
    }
}

module.exports = middlewareObj