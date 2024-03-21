const {
    validateString,
    validateUsername,
    validateOnlyNumber,
    validatePassword,
    getPasswordIntoHash,
    comparePassword, validateAlphabetsSpaceAndDash
} = require("../helpers");
const {restaurantsCollection} = require("../config/mongoCollections");
const registerRestaurant = async (name, restaurantId, address, contact, password) => {
    validateAlphabetsSpaceAndDash(name, 'Name', 1);
    validateUsername(restaurantId, 'Restaurant Id')
    validateString(address, "Address", 1)
    validateOnlyNumber(contact || "", 'Contact', 1);
    validatePassword(password)
    password = await getPasswordIntoHash(password);
    restaurantId = restaurantId.toLowerCase();
    try {
        await findRestaurantByResId(restaurantId);
    } catch (e) {
        const resCollection = await restaurantsCollection()
        resCollection.insertOne({
            name, restaurantId, address, contact, password, menu: [], isOpen: false
        })
        return {operation: true}
    }
    throw "Restaurant Id already exist";
}

const findRestaurantByResId = async (id, notDeletePassword) => {
    validateUsername(id, "Restaurant id");
    id = id.toLowerCase();
    const resCollection = await restaurantsCollection()
    const restaurant = await resCollection.findOne({restaurantId: id});
    if (!restaurant) throw "Restaurant not found for id " + id;
    if (!notDeletePassword) {
        delete restaurant.password;
    }
    return restaurant;
}

const verifyUsernameAndPasswordOfRestaurant = async (username, password) => {
    const restaurant = await findRestaurantByResId(username, true);
    if (!await comparePassword(password, restaurant.password)) throw "Either username or password is invalid";
    return {authenticated: true};
}

const updateRestaurant = async (restaurantId, name, address, contact) => {
    validateString(name, 'Name', 1);
    validateUsername(restaurantId, 'Restaurant Id')
    validateString(address, 'Address', 1)
    validateOnlyNumber(contact || "", 'Contact', 1);
    const restCollection = await restaurantsCollection();
    const info = await restCollection.updateOne({restaurantId}, {$set: {name, address, contact}})
    if (info.matchedCount === 0) throw `Restaurant not found for id ${restaurantId}`
}

const updateRestaurantStatus = async (restaurantId, isOpen) => {
    isOpen = !!isOpen;
    const restaurant = await findRestaurantByResId(restaurantId);
    if (restaurant.isOpen === isOpen) throw `Restaurant is already ${isOpen ? 'open' : 'close'}`
    const restCollection = await restaurantsCollection();
    const info = await restCollection.updateOne({restaurantId}, {$set: {isOpen}})
    if (info.matchedCount === 0) throw `Restaurant not found for id ${restaurantId}`
}

const getAllRestaurants = async () => {
    const resCol = await restaurantsCollection();
    const res = await resCol.find({}).toArray();
    return res.map(v => {
        v._id = v._id.toString();
        return v;
    });
}

const getRestaurantsFromArray = async (arr) => {
    if (!Array.isArray(arr)) return [];
    const newArr = []
    for (const arrElement of arr) {
        newArr.push(await findRestaurantByResId(arrElement));
    }
    return newArr;
}

module.exports = {
    registerRestaurant,
    findRestaurantByResId,
    verifyUsernameAndPasswordOfRestaurant,
    updateRestaurant,
    getAllRestaurants,
    getRestaurantsFromArray,
    updateRestaurantStatus
}
