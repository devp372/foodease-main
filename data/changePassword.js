const {findUserByEmail, verifyEmailPasswordOfUser} = require("./user");
const {userCollection, restaurantsCollection} = require("../config/mongoCollections");
const {getPasswordIntoHash, validatePassword} = require("../helpers");
const {findRestaurantByResId, verifyUsernameAndPasswordOfRestaurant} = require("./restaurants");
const changeUserPassword = async (email, prevPassword, password) => {
    await findUserByEmail(email, true);
    validatePassword(prevPassword)
    validatePassword(password)
    try {
        await verifyEmailPasswordOfUser(email, prevPassword);
    } catch (e) {
        throw "Invalid previous password";
    }
    password = await getPasswordIntoHash(password)
    const userCol = await userCollection();
    const info = await userCol.updateOne({email}, {
        $set: {
            password
        }
    })
    if (info.matchedCount === 0) throw `User not found for email ${email}`;
}

const changeRestaurantPassword = async (restaurantId, prevPassword, password) => {
    await findRestaurantByResId(restaurantId);
    validatePassword(prevPassword);
    validatePassword(password)
    try {
        await verifyUsernameAndPasswordOfRestaurant(restaurantId, prevPassword);
    } catch (e) {
        throw "Invalid previous password";
    }
    password = await getPasswordIntoHash(password)
    const resCol = await restaurantsCollection()
    const info = await resCol.updateOne({restaurantId}, {
        $set: {
            password
        }
    })

    if (info.matchedCount === 0) throw `Restaurant not found for username ${restaurantId}`;
}

module.exports = {
    changeUserPassword,
    changeRestaurantPassword
}
