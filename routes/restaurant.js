const express = require('express');
const {updateRestaurant, updateRestaurantStatus} = require("../data/restaurants");
const {passXss, validateString} = require("../helpers");
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {restaurantMiddleware} = require("../authMiddleware/restaurantMiddleware");
const router = express.Router();
const layout = 'restaurant';
router.use(authMiddleware)
router.use(restaurantMiddleware);
router.route('/').get(async (req, res) => {
    res.render('restaurantProfile', {layout, title: "Restaurant Profile", rest: req.rest})
});
router.route('/edit').get((req, res) => {
    res.render('editRestaurant', {layout, title: "Edit Restaurant", rest: req.rest});
}).post(async (req, res, next) => {
    req.body = req.body || {};
    try {
        passXss(req.body);
        const {name, address, contact} = req.body;
        await updateRestaurant(req.rest.restaurantId, name, address, contact);
        res.redirect('/restaurant/');
    } catch (e) {
        return res.status(400).render('editRestaurant', {layout, error: e, rest: req.rest});
    }
});
router.route('/changeStatus/:status').get(async (req, res) => {
    try {
        const {status} = req.params;
        validateString(status, "Status", 4);
        if (!["open", "close"].includes(status.toLowerCase())) throw "Invalid status";
        await updateRestaurantStatus(req.rest.restaurantId, status === 'open');
        req.rest.isOpen = status === 'open';
        res.render('message', {layout, message: `Restaurant is ${status} now`, rest: req.rest});
    } catch (e) {
        res.status(400).render('error', {layout, error: e, title: "Error", rest: req.rest});
    }
})

module.exports = router;
