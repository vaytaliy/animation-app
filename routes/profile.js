const express = require('express');
const router = express.Router();
const Category = require('../models/Category.js');
const Animation = require('../models/Animation.js');

router.get('/profile/:id', async (req, res) => {
    console.log(categories)
    let limit = 8;
    let page = parseInt(req.query.page);

    if (!req.query.page || req.query.page <= 0) {
        return res.redirect('/profile/' + req.params.id + '?page=1');
    }

    const startQuery = page * limit - limit;
    let pagination = {
        currentPage: page,
        nextPage: page + 1,
        secondToNextPage: page + 2,
        previousPage: page - 1
    }

    let user = null; // assuming there is no user logged in user is not owner of the profile page

    if (req.user) {
        if (req.user._id == req.params.id) {
            user = req.user
        }
    }
    try {
        const animations = await Animation.find({ 'creator.id': req.params.id }).sort({ draftDate: -1 }).skip(startQuery).limit(limit);
        let animationsData = [];
        for (let animation of animations) {
            const findCategory = async () => {
                let category = await Category.findById(animation.category);
                if (!category) {
                    category = new Category({
                        name: "Other",
                        bgColorHex: "#8ea8d1",
                        fontColorHex: "#000000",
                        emojiCode: "129335",
                    });
                }
                return category;
            };
            let animationData = {
                name: animation.name,
                animationId: animation._id,
                category: await findCategory(),
                isFileHeavy: animation.isFileHeavy,
                isDraft: animation.isDraft,
                draftDate: animation.draftDate
            }
            animationsData.push(animationData);
        }
        return res.render('./profile/profile.ejs', { animations: animationsData, user: user, pagination: pagination, pageId: req.params.id })
    } catch (err) {
        console.log(err.message);
        req.flash('error', 'Something screwed up :/');
        return res.redirect('/animations');
    }
})



module.exports = router;