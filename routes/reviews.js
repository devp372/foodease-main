const express = require('express');
const {userAuthMiddleware} = require("../authMiddleware/userMiddleware");
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {getMenuItem} = require("../data/menuItem");
const {
    writeReviewMenuItem,
    getReviewMenuItemByMenuId,
    getReviewMenuItemByEmail,
    getMenuReviewById, updateMenuReview, deleteMenuReview
} = require("../data/menuReview");
const {findRestaurantByResId} = require("../data/restaurants");
const {
    writeReviewRestaurant,
    getReviewRestaurantByRestaurantId,
    getReviewRestaurantByEmail,
    getRestaurantReviewById,
    updateRestaurantReview, deleteRestaurantReview
} = require("../data/restaurantReview");
const {passXss} = require("../helpers");
const router = express.Router();
const userLayout = 'user';
const restLayout = 'restaurant';
router.use(authMiddleware);
router.route('/writeMenuItemReview/:menuId').get([userAuthMiddleware, async (req, res) => {
    try {
        const {menuId} = req.params;
        if (!menuId) throw "Menu id not found";
        const menuItem = await getMenuItem(menuId);
        if (menuItem.item.isDeleted) throw "Menu is deleted";
        res.render('reviews/writeMenuReview', {
            layout: userLayout, menuId, menuItem: menuItem.item, title: "Write menu review"
        });
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}]).post([userAuthMiddleware, async (req, res) => {
    try {
        const {menuId} = req.params;
        passXss(req.body);
        const {review} = req.body;
        if (!menuId) throw "Menu id not found";
        if (!review) throw "Review not found";
        const menuItem = await getMenuItem(menuId);
        if (menuItem.item.isDeleted) throw "Menu is deleted";
        await writeReviewMenuItem(menuId, req.user.email, review);
        res.redirect('/reviews/menuReview/' + menuId);
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])
router.route('/writeRestaurantReview/:restId').get([userAuthMiddleware, async (req, res) => {
    try {
        const {restId} = req.params;
        if (!restId) throw "Menu id not found";
        const restaurant = await findRestaurantByResId(restId);
        res.render('reviews/writeRestaurantReview', {
            layout: userLayout, restId, restaurant, title: "Write restaurant review"
        });
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}]).post([userAuthMiddleware, async (req, res) => {
    try {
        const {restId} = req.params;
        passXss(req.body)
        const {review} = req.body;
        if (!restId) throw "Menu id not found";
        if (!review) throw "Review not found";
        await findRestaurantByResId(restId);
        await writeReviewRestaurant(restId, req.user.email, review);
        res.redirect('/reviews/restaurantReviews/' + restId);
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])
router.route('/getMenuItemReviewOfUser').get([userAuthMiddleware, async (req, res) => {
    try {
        const reviews = await getReviewMenuItemByEmail(req.user.email)
        reviews.forEach(v => {
            v.title = v._item.name;
            v.editUrl = '/reviews/editMenuReview/' + v._id
        })
        res.render('reviews/userGivenReview', {
            layout: userLayout, reviews, title: "Menu review by user", menuReview: true, name: "Menu Reviews"
        })
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])
router.route('/getRestaurantReviewOfUser').get([userAuthMiddleware, async (req, res) => {
    try {
        const reviews = await getReviewRestaurantByEmail(req.user.email);
        reviews.forEach(v => {
            v.title = v._restaurant.name;
            v.editUrl = '/reviews/editRestaurantReview/' + v._id
        })
        res.render('reviews/userGivenReview', {
            layout: userLayout, reviews, title: "Restaurant review by user", name: "Restaurant Reviews"
        })
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])

router.route('/editRestaurantReview/:reviewId').get([userAuthMiddleware, async (req, res) => {
    try {
        const {reviewId} = req.params;
        if (!reviewId) throw "Review id not found";
        const review = await getRestaurantReviewById(reviewId);
        if (review.email !== req.user.email) throw "This review not given by you so you cannot edit it";
        review.name = review._restaurant.name;
        res.render('reviews/editReview', {
            layout: userLayout, review,
        });
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}]).post([userAuthMiddleware, async (req, res) => {
    try {
        const {reviewId} = req.params;
        passXss(req.body);
        const {review: reviewStr, edit} = req.body;
        if (!reviewId) throw "Review id not found";
        if (!reviewStr) throw "Review is empty";
        if (!["EDIT", "DELETE"].includes(edit)) throw "Invalid operation";
        const review = await getRestaurantReviewById(reviewId);
        if (review.email !== req.user.email) throw "This review not given by you so you cannot edit it";
        if (edit === "EDIT") {
            await updateRestaurantReview(reviewId, reviewStr);
        } else {
            await deleteRestaurantReview(reviewId);
        }
        res.redirect('/reviews/getRestaurantReviewOfUser');
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])


router.route('/editMenuReview/:reviewId').get([userAuthMiddleware, async (req, res) => {
    try {
        const {reviewId} = req.params;
        if (!reviewId) throw "Review id not found";
        const review = await getMenuReviewById(reviewId);
        if (review.email !== req.user.email) throw "This review not given by you so you cannot edit it";
        review.name = review._item.name;
        res.render('reviews/editReview', {
            layout: userLayout, review,
        });
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}]).post([userAuthMiddleware, async (req, res) => {
    try {
        const {reviewId} = req.params;
        passXss(req.body);
        const {review: reviewStr, edit} = req.body;
        if (!reviewId) throw "Review id not found";
        if (!reviewStr) throw "Review is empty";
        if (!["EDIT", "DELETE"].includes(edit)) throw "Invalid operation";
        const review = await getMenuReviewById(reviewId);
        if (review.email !== req.user.email) throw "This review not given by you so you cannot edit it";
        if (edit === "EDIT") {
            await updateMenuReview(reviewId, reviewStr);
        } else {
            await deleteMenuReview(reviewId);
        }
        res.redirect('/reviews/getMenuItemReviewOfUser');
    } catch (e) {
        res.status(400).render("error", {layout: userLayout, error: e, title: "Error"})
    }
}])


router.route('/restaurantReviews/:restaurantId').get([async (req, res) => {
    const {restaurantId} = req.params;
    try {
        if (!restaurantId) throw "restaurantId not found";
        const restaurant = await findRestaurantByResId(restaurantId);
        const reviews = await getReviewRestaurantByRestaurantId(restaurantId);
        if (!req._user.isUser && req._user.id !== restaurantId) throw "You do not have access to see review of restaurant";
        reviews.forEach(v => {
            v.title = v._user.first_name + " " + v._user.last_name;
        })
        res.render('reviews/viewReviews', {
            layout: req._user.isUser ? userLayout : restLayout,
            title: "Restaurant Reviews",
            reviews,
            name: restaurant.name,
            rest: restaurant
        })
    } catch (e) {
        let rest = await findRestaurantByResId(req._user.id)
        if (!req._user.isUser) {
            rest = await findRestaurantByResId(req._user.id)
        }
        res.status(400).render("error", {
            layout: req._user.isUser ? userLayout : restLayout, rest, error: e, title: "Error"
        })
    }
}]);
router.route('/menuReview/:menuId').get([async (req, res) => {
    const {menuId} = req.params;
    try {
        if (!menuId) throw "restaurantId not found";
        let rest = null;
        const menu = await getMenuItem(menuId);
        if (menu.item.isDeleted) throw "Menu is deleted";
        const reviews = await getReviewMenuItemByMenuId(menuId);
        if (!req._user.isUser) {
            if (menu.restId !== req._user.id) throw "You do not have access to see review"
            for (const review of reviews) {
                if (review._restaurantId !== req._user.id) throw "You do not have access to see review";
            }
            rest = await findRestaurantByResId(req._user.id)
        }
        reviews.forEach(v => {
            v.title = v._user.first_name + " " + v._user.last_name;
        })
        res.render('reviews/viewReviews', {
            layout: req._user.isUser ? userLayout : restLayout,
            title: "Menu Reviews",
            reviews: reviews.length === 0 ? null : reviews,
            name: menu.item.name,
            rest
        })
    } catch (e) {
        let rest = await findRestaurantByResId(req._user.id)
        if (!req._user.isUser) {
            rest = await findRestaurantByResId(req._user.id)
        }
        res.status(400).render("error", {
            layout: req._user.isUser ? userLayout : restLayout,
            rest,
            error: e,
            title: "Error"
        })
    }
}]);
module.exports = router;
