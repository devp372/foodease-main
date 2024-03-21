const express = require('express');
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {passXss} = require("../helpers");
const {changeUserPassword, changeRestaurantPassword} = require("../data/changePassword");
const {findRestaurantByResId} = require("../data/restaurants");
const router = express.Router();
router.use(authMiddleware);
router.route('/').get(async (req, res) => {
    let rest;
    if (!req._user.isUser) {
        rest = await findRestaurantByResId(req._user.id);
    }
    res.render('changePassword', {layout: req._user.isUser ? 'user' : 'restaurant', title: "Change Password", rest});
}).post(async (req, res) => {
    passXss(req.body);
    try {

        let rest;
        const {prevPassword, password} = req.body;
        if (req._user.isUser) {
            await changeUserPassword(req._user.id, prevPassword, password);
        } else {
            rest = await findRestaurantByResId(req._user.id);
            await changeRestaurantPassword(req._user.id, prevPassword, password);
        }
        res.render('changePassword', {
            layout: req._user.isUser ? 'user' : 'restaurant',
            title: "Change Password",
            success: "Password successfully changed",
            rest
        });
    } catch (e) {
        let rest;
        if (!req._user.isUser) {
            rest = await findRestaurantByResId(req._user.id);
        }
        res.status(400).render('changePassword', {
            layout: req._user.isUser ? 'user' : 'restaurant', title: "Change Password", error: e,
            rest
        });
    }
})
module.exports = router;
