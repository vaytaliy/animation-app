const express = require('express');
const middleware = require('../middleware/index.js');
const router = express.Router();
// const mongoose = require('mongoose');
const Category = require('../models/Category.js');
const Animation = require('../models/Animation.js');

router.use(express.json({
    type: ['application/json', 'text/plain'],
    limit: 80 * 100000 //8 megabytes
}))

router.get('/', middleware.sessionLocals, (req, res) => {
    if (!(req.session && req.session.userId)) {
        return res.render('landing.ejs', { user: req.user });
    }
    return res.redirect('/animations');
});

router.get('/animations', middleware.sessionLocals, async (req, res) => {

    let page;
    let limit = 6;

    if (!req.query.page) {
        return res.redirect('/animations?page=1');
    } else {
        page = parseInt(req.query.page);
    }

    const countAnimations = await Animation.find({}).countDocuments();

    let lastPage = Math.ceil(countAnimations / limit);
    let previousButtonState = '';
    let nextButtonState = '';

    if (page == lastPage) {
        page = lastPage;
        nextButtonState = 'disabled'
    } else if (page <= 0) {
        page = 1;
        previousButtonState = 'disabled';
    }

    let pagination = {
        beforePreviousPage: page - 2,
        previousPage: page - 1,
        currentPage: page,
        nextPage: page + 1,
        afterNextPage: page + 2,
        nextButtonState: nextButtonState,
        previousButtonState: previousButtonState,
        lastPage: lastPage
    }

    const startQuery = limit * page - limit;

    const allAnimations = await Animation.find({}).sort({ draftDate: -1 }).skip(startQuery).limit(limit);
    let dataToSend = [];
    for (let animation of allAnimations) {
        let category = await Category.findById(animation.category);
        let likes = animation.likes.totalLikes - animation.dislikes.totalDislikes;
        let disliked = '';
        let liked = '';
        if (req.user) {
            let hasDisliked = animation.dislikes.voterIds.indexOf(req.user._id);
            let hasLiked = animation.likes.voterIds.indexOf(req.user._id);
            if (hasDisliked == -1) {
                disliked = '';
            } else {
                disliked = 'pressed';
            }
            if (hasLiked == -1) {
                liked = '';
            } else {
                liked = 'pressed'
            }
        }
        let data = {
            id: animation._id,
            speed: animation.playSpeed,
            thumbnail: animation.coverFrame,
            creator: animation.creator,
            name: animation.name,
            description: animation.description,
            draftDate: animation.draftDate,
            category: category,
            likes: likes,
            disliked: disliked,
            liked: liked
        }
        dataToSend.push(data);
    }
    res.render('home.ejs', { user: req.user, animations: dataToSend, pagination: pagination });
});



router.get('/animations/new', middleware.loginRequired, async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: -1 });
        return res.render('./animations/create.ejs', { categories: categories });
    } catch (err) {
        req.flash('Error displaying categories, try and refresh the page');
        return res.redirect('/animations/new');
    }
});

router.get('/animations/:id', middleware.loginRequired, middleware.animationBelongsToUser, async (req, res) => {
    try {
        const foundAnimation = await Animation.findById(req.params.id);
        const stringified = JSON.stringify(foundAnimation);
        return res.render('./animations/draw.ejs', { animation: stringified });
    } catch (err) {
        console.log(err.message)
        req.flash('error', 'This page does not exist');
        return res.redirect('back');
    }
});

router.put('/animations/:id', middleware.loginRequired, middleware.animationBelongsToUser, async (req, res) => {
    console.log("current user" + req.user + ":" + req.userId);
    console.log("hit correctly")


    let foundAnimation;
    try {
        foundAnimation = await Animation.findByIdAndUpdate({ _id: req.params.id });
        if (!foundAnimation.isDraft) {
            return res.json({ message: 'Posted animation can not be updated', type: 'error' });
        }
    } catch (err) {
        return res.json({ message: 'Error updating animation, given ID does not exist', type: 'error' });
    }

    const UPLOAD_RULES = {
        PLAY_SPEED_MIN: 0.1,
        PLAY_SPEED_MAX: 24,
        COLOR_COLLECTIONS_MIN: 0,
        COLOR_COLLECTIONS_MAX: 50,
        CLIPBOARD_MIN: 0,
        CLIPBOARD_MAX: 20,
        MAX_SIZE_PREMIUM: 16,
        MAX_SIZE_STANDARD: 8,
        HEAVY_FILE_MB: 5,
        VALID_COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/,
        GUESS_STRING_RULE: /\w{1,50}/g
    }

    const frames = req.body.frames;
    const playSpeed = req.body.playSpeed;
    let colorCollections = req.body.colorCollections;
    let clipboard = req.body.clipboard;

    let totalDrawingSize = 0; //total drawing size in Megabytes

    //constraint controls:

    const isValidFileSize = () => {
        totalDrawingSize = frames.reduce((total, frame) => { return total + (new TextEncoder().encode(frame)).length / 1000000 });
        if (req.user.isPremium) {
            return UPLOAD_RULES.MAX_SIZE_PREMIUM > totalSize ? true : false;
        }
        return UPLOAD_RULES.MAX_SIZE_STANDARD > totalSize ? true : false;
    }

    const isHeavy = () => {
        return totalDrawingSize > UPLOAD_RULES.HEAVY_FILE_MB ? true : false;
    }

    const goodGuessString = () => {
        if (req.body.guessString) {
            if (req.body.guessString.match(UPLOAD_RULES.GUESS_STRING_RULE)[0]) {
                return true;
            }
        }
        return false;
    }

    const goodColorHex = () => {
        for (color of colorCollections) {
            if (!color.match(UPLOAD_RULES.VALID_COLOR_HEX)[0]) {
                colorCollections = [];
            }
        }
        return;
    }

    const hasMoreThanOneFrame = () => {
        if (req.body.frames.length <= 1) {
            return false;
        }
        return true;
    }

    const handleClipboardLimit = () => {
        if (clipboard.length < UPLOAD_RULES.CLIPBOARD_MIN || clipboard.length > UPLOAD_RULES.CLIPBOARD_MAX) {
            clipboard = [];
        }
        return;
    }

    const goodPlaySpeed = () => {
        if (playSpeed < UPLOAD_RULES.PLAY_SPEED_MIN || playSpeed > UPLOAD_RULES.PLAY_SPEED_MAX) {
            return false;
        }
        return true;
    }

    const handleColorsLimit = () => {
        if (colorCollections.length < UPLOAD_RULES.COLOR_COLLECTIONS_MIN || colorCollections.length > UPLOAD_RULES.COLOR_COLLECTIONS_MAX) {
            colorCollections = [];
        }
        return;
    }

    if (!isValidFileSize) {
        return res.json({ message: `Error saving. The animation is too big ${totalDrawingSize} Mb`, type: 'error' });
    }
    if (!goodGuessString) {
        return res.json({ message: `Error saving. The guess word is too long/short/contains illegal symbols`, type: 'error' });
    }
    if (!hasMoreThanOneFrame) {
        return res.json({ message: 'Failed saving draft. Please create more than 1 frame', type: 'error' });
    }
    if (!goodPlaySpeed) {
        return res.json({ message: 'The speed set for animation contains incorrect value', type: 'error' });
    }

    const trimReceivedParameters = () => {
        goodColorHex(); // checking if array of hex colors is good values, otherwise empty the array
        handleClipboardLimit();
        handleColorsLimit(); // splice clipboard limit and color limit to handle the error better instead of removing everything;
    }
    trimReceivedParameters();
    //updates necessary for draft version only

    Object.assign(foundAnimation, {
        frames: req.body.frames,
        coverFrame: req.body.thumbnail,
        playSpeed: req.body.playSpeed,
        clipboard: clipboard,
        colorCollections: colorCollections,
        draftDate: new Date().getTime()
    })
    foundAnimation.save();
    if (req.query.post && req.query.post == '1') {
        Object.assign(foundAnimation, {
            isDraft: false,
            postDate: new Date().getTime(),
            isFileHeavy: isHeavy(),
            needsGuessing: req.body.needsGuessing || false,
            guessString: req.body.guessString || ''
        })
        foundAnimation.save();
        try {
            return res.json({ message: 'The animation has been posted. Further changes wont take effect', type: 'success' });
        } catch (err) {
            console.log('error posting animation');
            return res.json({ message: 'Error posting animation', type: 'error' });
        }
    } else {
        return res.json({ message: 'Draft saved successfully', type: 'success' });
    }
});

router.post('/animations/new', middleware.loginRequired, async (req, res) => {
    try {
        let foundCategory = await Category.findOne({ name: req.body.category });
        let createdDraft = await Animation.create(req.body.animation);


        createdDraft.creator.id = req.user._id;
        createdDraft.creator.name = req.user.username;
        // createdDraft.category.name = foundCategory.name;
        createdDraft.category = foundCategory._id;
        console.log(createdDraft);
        const date = new Date();
        const currentDate = date.getTime();
        createdDraft.draftDate = currentDate;
        createdDraft.markModified('draftDate');
        try {
            await createdDraft.save();
            req.flash('success', 'Draft created successfully');
            res.redirect('/animations/' + createdDraft._id)
            //redirect to edit and send parameters
        } catch (err) {
            console.log(err);
            req.flash('error', 'Something went wrong');
            return res.redirect('/animations/new');
        }
    }
    catch (err) {
        console.log(err);
        req.flash('error', 'Something went wrong try again');
        return res.redirect('back');
    }

});

router.get('/animations/view/:id', async (req, res) => {
    try {
        let foundAnimation = await Animation.findById(req.params.id);
        let foundCategory = await Category.findById(foundAnimation.category);

        res.render('./animations/show.ejs', { animation: foundAnimation, category: foundCategory.name, user: req.user })

    } catch (err) {
        req.flash('error', 'Animation not found');
        return res.redirect('/animations');
    }
})


router.get('/api/play/:id', async (req, res) => {
    try {
        let foundAnimation = await Animation.findById(req.params.id);

        const data = {
            frames: foundAnimation.frames
        }

        return res.json({
            data: data,
        })
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
})

router.put('/api/rate/:id', async (req, res) => {
    if (!req.user) {
        return res.json({
            type: 'error',
            message: 'You must be logged in to do that!',
            redirectURL: 'keep',
        })
    }
    let reqBody = req.body;
    let rateType = reqBody.type;
    let postId = req.params.id;
    let choice;
    let likes;
    try {
        let foundAnimation = await Animation.findById(postId);
        if (foundAnimation) {
            let likesFound = foundAnimation.likes.voterIds.indexOf(req.user._id);
            let dislikesFound = foundAnimation.dislikes.voterIds.indexOf(req.user._id);
            if (rateType == 'like') {
                if (likesFound != -1) {
                    foundAnimation.likes.voterIds.splice(likesFound, 1);
                    foundAnimation.likes.totalLikes -= 1;
                    choice = 'none';
                } else {
                    if (dislikesFound != -1) {
                        foundAnimation.dislikes.voterIds.splice(dislikesFound, 1);
                        foundAnimation.dislikes.totalDislikes -= 1;
                    }
                    foundAnimation.likes.voterIds.push(req.user._id);
                    foundAnimation.likes.totalLikes += 1;
                    choice = 'like';
                }

            } else if (rateType == 'dislike') {
                if (dislikesFound != -1) {
                    foundAnimation.dislikes.voterIds.splice(dislikesFound, 1);
                    foundAnimation.dislikes.totalDislikes -= 1;
                    choice = 'none';
                } else {
                    if (likesFound != -1) {
                        foundAnimation.likes.voterIds.splice(likesFound, 1);
                        foundAnimation.likes.totalLikes -= 1;
                    }
                    foundAnimation.dislikes.voterIds.push(req.user._id);
                    foundAnimation.dislikes.totalDislikes += 1;
                    choice = 'dislike';
                }
            } else {
                return res.json({
                    type: 'error',
                    message: 'Invalid request',
                    redirectURL: 'keep',
                })
            }
            likes = foundAnimation.likes.totalLikes - foundAnimation.dislikes.totalDislikes;
            let data = {
                choice: choice,
                likes: likes
            }
            foundAnimation.save();
            return res.json({ data });
        } else {
            return res.json({
                type: 'error',
                message: 'could not find animation :/',
                redirectURL: 'keep',
            })
        }
    } catch (err) {
        return res.json({
            type: 'error',
            message: 'could not complete requested operation :/',
            redirectURL: 'back',
        })
    }
})

router.use(middleware.sessionLocals)

module.exports = router;