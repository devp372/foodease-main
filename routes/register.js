const express = require('express');
const {passXss} = require("../helpers");
const {registerRestaurant} = require("../data/restaurants");
const {createUser} = require("../data/user");
const router = express.Router();
router.route('/restaurantRegistration').post(async (req, res) => {
    req.body = req.body || {};
    const title = "Restaurant Registration";
    try {
        passXss(req.body);
        const {name, id, address, contact, password} = req.body;
        await registerRestaurant(name, id, address, contact, password);
        res.render('restaurantRegistration', {title, success: "Restaurant successfully registered"})
    } catch (e) {
        res.status(400).render('restaurantRegistration', {title, error: e})
    }
}).get((req, res) => {
    res.render('restaurantRegistration', {title: "Restaurant Registration"});
})
router.route('/userRegistration').get((req, res) => {
    res.render('userRegistration', {title: "User Registration"})
}).post(async (req, res) => {
    const title = "User Registration";
    req.body = req.body || {};
    try {
        passXss(req.body);
    } catch (e) {
        return res.status(400).render('userRegistration', {error: "Invalid form parameters"});
    }
    const {first_name, last_name, email, phone, address, birth_date, password} = req.body;
    try {
        await createUser(first_name, last_name, email, phone, address, birth_date, password);
        res.render('userRegistration', {title, success: "User successfully registered"})
    } catch (e) {
        res.status(400).render('userRegistration', {title, error: e,})
    }
});
module.exports = router;
