const express = require('express');
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const {userAuthMiddleware} = require("../authMiddleware/userMiddleware");
const {
    placeOrder,
    getAllOrdersForUser,
    getOrderById,
    updateStatusOfOrder,
    getAllOrdersOfRestaurant
} = require("../data/order");
const {restaurantMiddleware} = require("../authMiddleware/restaurantMiddleware");
const {validateObjectId, passXss, validateString} = require("../helpers");
const router = express.Router();
router.use(authMiddleware);
const userLayout = 'user';
const restaurantLayout = 'restaurant';
router.route('/placeOrder').post([userAuthMiddleware, async (req, res) => {
    try {
        const {restId, arr} = req.body;
        if (!restId) throw "Restaurant id not found";
        if (!arr) throw "Order not found";
        await placeOrder(restId, arr, req.user.email);
        res.json({message: "Order Successfully placed"});
    } catch (e) {
        return res.status(400).json({
            message: e
        })
    }
}])
router.route('/userOrders/').get([userAuthMiddleware, async (req, res) => {

    try {
        const orders = await getAllOrdersForUser(req.user.email)
        res.render('order/userOrders', {layout: userLayout, title: "Orders", orders})
    } catch (e) {
        res.status(400).render('order/userOrders', {layout: userLayout, title: "Orders", orders: []})
    }
}])
router.route('/restaurantOrders/:status').get([restaurantMiddleware, async (req, res) => {
    try {
        let {status} = req.params;
        if (!status) throw "Status not found";
        validateString(status, "Status");
        status = status.toLowerCase();
        let orders = await getAllOrdersOfRestaurant(req.rest.restaurantId);
        if (status !== 'all') {
            orders = orders.filter(v => {
                return v.status.toLowerCase() === status;
            })
        }
        if (!["all", 'pending', 'accepted', 'ready', 'delivered','cancel'].includes(status)) throw "Invalid order status requested";
        res.render('order/restaurantOrders', {
            layout: restaurantLayout, title: "Orders",
            orders,
            rest: req.rest,
            status,
            isAll: status === 'all',
            isPending: status === 'pending',
            isAccepted: status === 'accepted',
            isReady: status === 'ready',
            isDelivered: status === 'delivered',
            isCancel: status === 'cancel'
        })
    } catch (e) {
        res.status(400).render('error', {layout: restaurantLayout, title: "Orders", error: e})
    }
}])
router.route('/viewUserOrder/:id').get([userAuthMiddleware, async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        validateObjectId(req.params.id, "Order id");
        const order = await getOrderById(req.params.id)
        if (!req.user || order.email !== req.user.email) throw "Invalid order selection";
        order.isPending = order.status === 'pending';
        res.render('order/viewUserOrder', {layout: userLayout, title: "Orders", order})
    } catch (e) {
        res.status(400).render('order/viewUserOrder', {layout: userLayout, title: "Orders", order: null, error: e})
    }
}])

router.route('/viewRestaurantOrder/:id').get([restaurantMiddleware, async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        validateObjectId(req.params.id);
        const order = await getOrderById(req.params.id, "Order id")
        if (!req.rest || order.restaurantId !== req.rest.restaurantId) throw "Invalid order selection";
        res.render('order/viewRestaurantOrder', {layout: restaurantLayout, title: "Orders", order, rest: req.rest})
    } catch (e) {
        res.status(400).render('order/viewUserOrder', {
            layout: restaurantLayout,
            title: "Orders",
            order: null,
            error: e,
            rest: req.rest
        })
    }
}])


router.route('/cancelOrder/:id').put([async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        const order = await getOrderById(req.params.id)
        if (req.user && order.email !== req.user.email) throw "This order for not email " + order.email;
        if (req.rest && order.restaurantId !== req.rest.restaurantId) throw "This order for not restaurant " + order.restaurantId;
        if (order.status !== 'pending') throw "Order is not pending so now you are not able to cancel the order";
        await updateStatusOfOrder(req.params.id, "cancel");
        res.send({message: "Order successfully Cancel"})
    } catch (e) {
        res.status(400).json({message: e})
    }
}])

router.route('/acceptOrder/:id').put([restaurantMiddleware, async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        const order = await getOrderById(req.params.id)
        if (order.restaurantId !== req.rest.restaurantId) throw "Order not found";
        if (order.status !== 'pending') throw "Unable to change order status to accepted";
        await updateStatusOfOrder(req.params.id, "accepted");
        res.send({message: "Order successfully accepted"})
    } catch (e) {
        res.status(400).json({message: e})
    }
}])

router.route('/readyOrder/:id').put([restaurantMiddleware, async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        const order = await getOrderById(req.params.id)
        if (order.restaurantId !== req.rest.restaurantId) throw "Order not found";
        if (order.status !== 'accepted') throw "Unable to change order status to ready";
        await updateStatusOfOrder(req.params.id, "ready");
        res.send({message: "Order status successfully updated"})
    } catch (e) {
        res.status(400).json({message: e})
    }
}])
router.route('/deliveredOrder/:id').put([restaurantMiddleware, async (req, res) => {
    try {
        if (!req.params.id) throw "Id not found";
        const order = await getOrderById(req.params.id)
        if (order.restaurantId !== req.rest.restaurantId) throw "Order not found";
        if (order.status !== 'ready') throw "Unable to change order status to delivered";
        await updateStatusOfOrder(req.params.id, "delivered");
        res.send({message: "Order status successfully updated"})
    } catch (e) {
        res.status(400).json({message: e})
    }
}])


module.exports = router;
