const express = require('express');
const {
    updateUser,
    markFavRestaurantsForUser,
    removeRestaurantsFromFavouriteUser,
    markFavItemForUser,
    removeItemFromFavouriteUser
} = require("../data/user");
const {passXss} = require("../helpers");
const {userAuthMiddleware} = require("../authMiddleware/userMiddleware");
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {getAllRestaurants, findRestaurantByResId, getRestaurantsFromArray} = require("../data/restaurants");
const {getRestaurantMenu, getMenuItem, getMenuItemInArray} = require("../data/menuItem");
const router = express.Router();
const layout = 'user';
router.use(authMiddleware);
router.use(userAuthMiddleware)
router.route('/').get(async (req, res) => {
    res.render('userProfile', {layout, title: "User Profile", user: req.user})
});
router.route('/edit').get(async (req, res) => {
    res.render('editUser', {layout, title: "Edit User", user: req.user})
}).post(async (req, res) => {
    req.body = req.body || {};
    try {
        passXss(req.body);
    } catch (e) {
        return res.status(400).render('editUser', {layout, error: "Invalid form parameters", user: req.user});
    }
    const {first_name, last_name, phone, address, birth_date} = req.body;
    try {
        await updateUser(req.user.email, first_name, last_name, phone, address, birth_date);
        res.redirect('/user/');
    } catch (e) {
        return res.status(400).render('editUser', {layout, error: e, user: req.user, title: "Edit User"});
    }
})

router.route('/restaurants').get(async (req, res) => {
    const favRes = req.user.favRestaurants || [];
    const restaurants = await getAllRestaurants();
    restaurants.forEach(v => {
        v.isFav = favRes.includes(v.restaurantId);
    })
    res.render('user/restaurants', {layout, restaurants, title: "Restaurants"})
})

router.route('/menuList/:restaurantId').get(async (req, res) => {
    try {
        const {restaurantId} = req.params;
        if (!restaurantId) throw "restaurantId Not found";
        const rest = await findRestaurantByResId(restaurantId)
        await getRestaurantMenu(restaurantId);
        res.render('user/menuList', {layout, restId: restaurantId, title: "Menu List", rest})
    } catch (e) {
        return res.status(400).render('error', {layout, error: e, title: "Error"});
    }
})
router.route('/viewMenu/:menuId').get(async (req, res) => {
    try {
        passXss(req.params);
        const {menuId} = req.params;
        if (!menuId) throw "Menu id not found";
        const menu = await getMenuItem(menuId);
        if (menu.item.isDeleted) throw "Menu item is deleted";
        res.render('user/onlyMenu', {layout, menu: menu.item, restaurantId: menu.restId});
    } catch (e) {
        return res.status(400).render('error', {layout, error: e, title: "Error"});
    }
})

router.route('/menuList/api/:restaurantId').get(async (req, res) => {
    try {
        const {restaurantId} = req.params;
        if (!restaurantId) throw "restaurantId Not found";
        const favMenus = req.user.favMenus;
        const restaurant = await findRestaurantByResId(restaurantId);
        if (!restaurant.isOpen) throw "Restaurant is not open";
        const menus = (await getRestaurantMenu(restaurantId)).filter(v => {
            return !v.isDeleted
        });
        menus.forEach(v => {
            v.isFav = favMenus.includes(v._id);
        })
        res.json(menus);
    } catch (e) {
        return res.status(400).json({message: e});
    }
})

router.route('/markFavouriteRestaurant/:restId').put(async (req, res) => {
    req.params = req.params || {}
    passXss(req.params);
    try {
        const {restId} = req.params;
        if (!restId) throw "RestaurantId not found";
        await findRestaurantByResId(restId);
        await markFavRestaurantsForUser(restId, req.user.email);
        res.json({message: "Successfully marked as favourite"})
    } catch (e) {
        res.status(400).json({message: e})
    }
})


router.route('/removeFavouriteRestaurant/:restId').put(async (req, res) => {
    const {restId} = req.params;
    try {
        if (!restId) throw "RestaurantId not found";
        await findRestaurantByResId(restId);
        await removeRestaurantsFromFavouriteUser(restId, req.user.email);
        res.json({message: "Successfully remove from favourite"})
    } catch (e) {
        res.status(400).json({message: e})
    }
})


router.route('/markFavouriteItem/:id').put(async (req, res) => {
    const {id} = req.params;
    try {
        if (!id) throw "Menu id not found";
        const menu = await getMenuItem(id);
        if (menu.item.isDeleted) throw "Menu is deleted";
        await markFavItemForUser(id, req.user.email);
        res.json({message: "Successfully marked as favourite"})
    } catch (e) {
        res.status(400).json({message: e})
    }
})


router.route('/removeFavouriteItem/:id').put(async (req, res) => {
    const {id} = req.params;
    try {
        if (!id) throw "Menu id not found";
        await getMenuItem(id);
        await removeItemFromFavouriteUser(id, req.user.email);
        res.json({message: "Successfully remove from favourite"})
    } catch (e) {
        res.status(400).json({message: e})
    }
})

router.route('/getUserFavouriteItems').get(async (req, res) => {
    try {
        const items = await getMenuItemInArray(req.user.favMenus);
        res.render('user/favouriteMenu', {layout, items});
    } catch (e) {
        res.status(400).render('error', {layout, error: e, title: "Error"})
    }
})

router.route('/getUserFavouriteRestaurants').get(async (req, res) => {
    try {
        const restaurants = await getRestaurantsFromArray(req.user.favRestaurants);
        restaurants.forEach(v => {
            v.isFav = true;
        })
        res.render('user/restaurants', {layout, restaurants, title: "Favourite Restaurants", fav: true});
    } catch (e) {
        res.status(400).render('error', {layout, error: e, title: "Error"})
    }
})


module.exports = router;
