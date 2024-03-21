const express = require('express');
const {restaurantMiddleware} = require("../authMiddleware/restaurantMiddleware");
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {passXss} = require("../helpers");
const fileUpload = require('express-fileupload');
const {addMenu, getRestaurantMenu, getMenuItem, updateMenu, deleteMenu} = require("../data/menuItem");
const {getExtensions, saveMenuItemPhoto, deleteMenuPhoto} = require("../fileHelper");
const router = express.Router();
const resLayout = 'restaurant';

// img: {
//     name: 'grid-view-overview-large_png by Yuriy Balaka.png',
//         size: 519149,
//         encoding: '7bit',
//         tempFilePath: '',
//         truncated: false,
//         mimetype: 'image/png',
//         md5: '5b55c2c0e428be31983947a4a8fc5c15',
//         mv: [Function: mv]
// }

router.use(authMiddleware);
router.use(restaurantMiddleware);
router.use(fileUpload());

router.route('/addMenu').get(async (req, res) => {
    res.render('menu/addMenu', {layout: resLayout, title: "Add Menu", rest: req.rest});
}).post(async (req, res) => {
    req.body = req.body || {};
    try {
        passXss(req.body);
        const {name, description, price} = req.body;
        if (!req.files || !req.files.img) throw "Img is required"
        if (!req.files.img.mimetype || !req.files.img.mimetype.includes("image")) throw "Invalid file type. File type should be image"
        const ext = getExtensions(req.files.img.name);
        const {id} = await addMenu(req.rest.restaurantId, name, description, price, ext);
        saveMenuItemPhoto(req.files.img.data, `${id}.${ext}`);
        res.render('menu/addMenu', {
            layout: resLayout, title: "Add Menu", rest: req.rest, success: "Menu item successfully added"
        })
    } catch (e) {
        res.status(400).render('menu/addMenu', {layout: resLayout, title: "Add Menu", rest: req.rest, error: e})
    }
})

router.route('/viewMenu/:menuId').get(async (req, res) => {
    const {menuId} = req.params;
    try {
        const menu = await getMenuItem(menuId);
        if (menu.item.isDeleted) throw "Menu item is deleted";
        if (menu.restId !== req.rest.restaurantId) throw "This menu item does not belongs to your menu";
        res.render('menu/onlyMenu', {layout: resLayout, title: "View Menu", rest: req.rest, menu: menu.item});
    } catch (e) {
        res.status(400).render('error', {layout: resLayout, error: e, rest: req.rest});
    }
})


router.route('/restMenus').get(async (req, res) => {
    const id = req.rest.restaurantId;
    try {
        const menus = (await getRestaurantMenu(id)).filter(v => {
            return v.isNotDeleted;
        });
        res.render('menu/restMenuList', {layout: resLayout, menus, rest: req.rest, isZeroLength: menus.length === 0})
    } catch (e) {
        res.status(400).render('error', {layout: resLayout, error: e, rest: req.rest});
    }
})
router.route('/editMenu/:id').get(async (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).render('error', {layout: resLayout, error: "Invalid id"});
    try {
        const menu = await getMenuItem(id)
        if (menu.item.isDeleted) throw "Menu is deleted";
        if (menu.restId !== req.rest.restaurantId) throw "This menu does not belongs to your restaurant"
        res.render('menu/editMenu', {layout: resLayout, menu: menu.item, rest: req.rest})
    } catch (e) {
        res.status(400).render('error', {layout: resLayout, error: e, rest: req.rest})
    }
}).put(async (req, res) => {
    const id = req.params.id;
    try {
        req.body = req.body || {};
        passXss(req.body);
        if (!id) throw "Invalid id";
        const {item: menu, restId} = await getMenuItem(id)
        if (menu.isDeleted) throw "Menu is deleted";
        if (restId !== req.rest.restaurantId) throw "This menu does not belongs to your restaurant"
        if (req.files && req.files.img && (!req.files.img.mimetype || !req.files.img.mimetype.includes("image"))) throw "Invalid file type. File type should be image"
        const {name, description, price} = req.body;
        let ext;
        if (req.files && req.files.img) {
            ext = getExtensions(req.files.img.name);
            console.log(`${id}.${menu.extension}`)
            await deleteMenuPhoto(`${id}.${menu.extension}`);
            await saveMenuItemPhoto(req.files.img.data, `${id}.${ext}`);
        }
        await updateMenu(req.rest.restaurantId, id, name, description, price, ext || menu.extension);
        res.json({message: "successfully updated"})
    } catch (e) {
        res.status(400).json({message: e});
    }
}).delete(async (req, res) => {
    const {id} = req.params;
    try {
        if (!id) throw "Id not found"
        const menu = await getMenuItem(id);
        if (menu.item.isDeleted) throw "Menu is already deleted";
        if (menu.restId !== req.rest.restaurantId) throw "This menu does not belongs to your restaurants so you can not modify it";
        await deleteMenu(req.rest.restaurantId, id);
        res.json({message: "Menu successfully deleted"});
    } catch (e) {
        res.status(400).json({message: e});
    }
})


module.exports = router;
