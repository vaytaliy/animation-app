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
    try {
        await Animation.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                frames: req.body.frames,
                coverFrame: req.body.thumbnail,
                playSpeed: req.body.playSpeed,
                clipboard: req.body.clipboard,
                colorCollections: req.body.colorCollections
            }
        })
        return res.json({ message: 'Draft saved successfully', type: 'success' });
    } catch (err) {
        return res.json({ message: 'Failed saving draft, try again', type: 'error' });
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