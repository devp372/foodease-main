const {getRestaurantMenu, getMenuItem} = require("./menuItem");
const {orderCollection} = require("../config/mongoCollections");
const {ObjectId} = require("mongodb");
const {findUserByEmail} = require("./user");
const {findRestaurantByResId} = require("./restaurants");
const {validateEmail, validateObjectId, validateUsername} = require("../helpers");
const placeOrder = async (restaurantId, orders, email) => {
    const menus = await getRestaurantMenu(restaurantId);
    const restaurant = await findRestaurantByResId(restaurantId);
    if (!restaurant.isOpen) throw "Restaurant is close now";
    if (!Array.isArray(orders)) throw "Order should be array";
    if (orders.length === 0) throw "Order length should not be 0";
    await findUserByEmail(email);
    const menuIds = menus.map(v => {
        return v._id
    });
    for (const order of orders) {
        if (!menuIds.includes(order.id)) throw "Menu does not exist in restaurant menu list"
        order.count = Number(order.count);
        if (!order.count) throw "Invalid order count"
        if (order.count <= 0) throw "Item count should not be less than 0";
    }
    let total = 0;
    let totalItem = 0;
    const arr = [];
    orders.forEach(v => {
        const menu = menus.find(m => v.id === m._id);
        if (menu.isDeleted) throw `Menu item ${menu.name} is deleted so you can not place order`
        const price = (menu.price * v.count);
        totalItem += v.count;
        total += price;
        arr.push({id: v.id, count: v.count, totalPrice: price});
    })
    const orderCol = await orderCollection();
    const id = new ObjectId().toString();
    const obj = {
        _id: new ObjectId(id),
        menu: arr,
        price: total,
        email,
        restaurantId,
        time: new Date().getTime(),
        status: "pending",
        totalItem
    };
    orderCol.insertOne(obj);
    obj._id = id;
    return obj
}

const patchOrders = async (orders) => {
    const arr = []
    for (const order of orders) {
        arr.push(await getOrderById(order._id));
    }
    return arr;
}

const getAllOrdersForUser = async (email) => {
    validateEmail(email);
    const orderCol = await orderCollection();
    const orders = await orderCol.find({email}).toArray();
    return patchOrders(orders);
}

const getAllOrdersOfRestaurant = async (restId) => {
    validateUsername(restId, "Restaurant id")
    const orderCol = await orderCollection();
    const orders = await orderCol.find({restaurantId: restId}).toArray();
    return patchOrders(orders);
}

const getOrderById = async (id) => {
    validateObjectId(id, "Order Id")
    const orderCol = await orderCollection();
    const order = await orderCol.findOne({_id: id});
    if (!order) throw "Order not found for id " + id;
    for (const menuEle of order.menu) {
        const menuItem = await getMenuItem(menuEle.id);
        menuEle.item = menuItem.item;
    }
    order.isPending = order.status === 'pending';
    order.isAccepted = order.status === 'accepted';
    order.isReady = order.status === 'ready';
    const restaurant = await findRestaurantByResId(order.restaurantId);
    order._restaurant = restaurant.name;
    const user = await findUserByEmail(order.email);
    order._user = `${user.first_name} ${user.last_name}`;
    order._time = new Date(order.time).toUTCString()
    return order;
}

const updateStatusOfOrder = async (id, status) => {
    validateObjectId(id, "Order Id");
    const orderCol = await orderCollection();
    const info = await orderCol.updateOne({_id: id}, {
        $set: {
            status,
            updateTime: new Date().getTime()
        }
    }, {upsert: true})
    if (info.matchedCount === 0) throw `Menu Item not found for id ${id}`;
    return {updated: true}
}


module.exports = {
    placeOrder,
    getAllOrdersForUser,
    getAllOrdersOfRestaurant,
    getOrderById,
    updateStatusOfOrder
}
