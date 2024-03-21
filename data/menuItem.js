const {restaurantsCollection} = require("../config/mongoCollections");
const {validateString, validateObjectId, validateUsername} = require("../helpers");
const {ObjectId} = require("mongodb");
const addMenu = async (resId, name, description, price, extension) => {
    name = validateString(name, 'Menu Name', 1);
    description = validateString(description, 'description', 1);
    if (isNaN(price)) throw "Price should be a number";
    price = Number(price);
    price = price.toFixed(2);
    price = Number(price);
    if (price <= 0) throw "Price should be greater than 0";
    extension = extension || "";
    resId = resId.toLowerCase();
    const resCol = await restaurantsCollection()
    const id = new ObjectId().toString();
    const info = await resCol.updateOne({restaurantId: resId}, {
        $push: {
            menu: {
                _id: new ObjectId(id), name, description, price, extension
            }
        }
    })
    if (info.matchedCount === 0) throw "Restaurant id does not exist";
    return {inserted: true, id}
}
const updateMenu = async (resId, menuId, name, description, price, extension) => {

    validateUsername(resId);
    resId = resId.toLowerCase();
    menuId = validateObjectId(menuId, "Menu Id");
    name = validateString(name, 'name', 1);
    description = validateString(description, 'description', 1);
    if (isNaN(price)) throw "Price should be a number";
    price = Number(price);
    price = Number(price.toFixed(2));
    if (price <= 0) throw "Price should be greater than 0";
    const resCol = await restaurantsCollection()
    const info = await resCol.updateOne({
        restaurantId: resId, "menu._id": new ObjectId(menuId)
    }, {
        $set: {
            "menu.$.name": name,
            "menu.$.description": description,
            "menu.$.price": price,
            "menu.$.extension": extension,
        }
    })
    if (info.matchedCount === 0) throw `Menu Item not found for id ${menuId}`;
    return {updated: true}
}

const deleteMenu = async (resId, id) => {
    validateUsername(resId);
    resId = resId.toLowerCase();
    id = validateObjectId(id, "Menu Id");
    const resCol = await restaurantsCollection();
    const info = await resCol.updateOne({restaurantId: resId, "menu._id": new ObjectId(id)}, {
        $set: {
            "menu.$.isDeleted": true,
        }
    });
    if (info.modifiedCount === 0) throw "Menu item not found for restaurant";
    return {deleted: true}
}


const getMenuItem = async (id) => {
    validateObjectId(id, "Menu id")
    const resCol = await restaurantsCollection()
    const rests = await resCol.findOne({"menu._id": new ObjectId(id)});
    if (!rests) throw "Item not found for id " + id
    const menu = rests.menu || [];
    const item = menu.find(v => {
        return v._id.toString() === id;
    })
    item.isNotDeleted = !item.isDeleted;
    item._id = id;
    item.img = `/menu/photos/${item._id}.${item.extension}`;
    return {item, restId: rests.restaurantId}
}

const getRestaurantMenu = async (resId) => {
    validateUsername(resId);
    resId = resId.toLowerCase();
    const resColl = await restaurantsCollection()
    const restaurant = await resColl.findOne({restaurantId: resId});
    if (!restaurant) throw "No restaurant found";
    const menu = restaurant.menu || [];
    return menu.map(v => {
        v._id = v._id.toString();
        v.isNotDeleted = !v.isDeleted;
        v.img = `/menu/photos/${v._id}.${v.extension}`;
        return v;
    })
}

const getMenuItemInArray = async (arr) => {
    if (!Array.isArray(arr)) return [];
    const newArr = [];
    for (const element of arr) {
        newArr.push(await getMenuItem(element));
    }
    return newArr;
}

module.exports = {
    addMenu, updateMenu,
    getMenuItem, getRestaurantMenu,
    getMenuItemInArray,
    deleteMenu
}



