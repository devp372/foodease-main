const express = require('express');
const {validateString} = require("../helpers");
const {verifyUsernameAndPasswordOfRestaurant} = require("../data/restaurants");
const {verifyEmailPasswordOfUser} = require("../data/user");
const router = express.Router();

router.use((req, res, next) => {
    const user = req.session.user ? JSON.parse(req.session.user) : null;
    if (!user) return next();
    if (user.isUser) return res.redirect('/user');
    res.redirect('/restaurant');
})
router.route('/restaurant').get((req, res) => {
    res.render('restaurantLogin', {title: "Restaurant Login"});
}).post(async (req, res) => {
    const {id, password} = req.body;
    const title = "Restaurant Login";
    const error = "Either username or password invalid"
    try {
        validateString(id, "Restaurant Id", 1);
        validateString(password, "Password", 1)
    } catch (e) {
        return res.status(400).render('restaurantLogin', {title, error: "Please enter valid inputs"})
    }
    try {
        await verifyUsernameAndPasswordOfRestaurant(id, password);
        req.session.user = JSON.stringify({isUser: false, id});
        return res.redirect('/restaurant');
    } catch (e) {
        return res.status(400).render('restaurantLogin', {title, error})
    }
})

router.route('/user').get((req, res) => {
    res.render('userLogin', {title: "User Login"});
}).post(async (req, res) => {
    const {email, password} = req.body;
    const title = "User Login";
    const error = "Either email or password is invalid"
    try {
        validateString(email, "Restaurant Id", 1);
        validateString(password, "Password", 1)
    } catch (e) {
        return res.status(400).render('userLogin', {title, error: e})
    }
    try {
        await verifyEmailPasswordOfUser(email, password);
        req.session.user = JSON.stringify({isUser: true, id: email});
        return res.redirect('/user');
    } catch (e) {
        return res.status(400).render('userLogin', {title, error})
    }
})


module.exports = router;
