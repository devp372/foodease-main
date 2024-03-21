const {
    validateOnlyAlphabets,
    validateString,
    validateDate,
    validatePassword,
    validateEmail,
    getPasswordIntoHash,
    validateOnlyNumber,
    comparePassword
} = require("../helpers");
const {userCollection} = require("../config/mongoCollections");

const createUser = async (first_name, last_name, email, phone, address, birth_date, password) => {
    first_name = validateOnlyAlphabets(first_name, "first_name")
    last_name = validateOnlyAlphabets(last_name, "last_name")
    email = validateEmail(email);
    phone = validateOnlyNumber(phone || "", 'Phone', 1)
    address = validateString(address, 'Address', 1);

    validateDate(birth_date, "birth_date");
    validatePassword(password);
    try {
        await findUserByEmail(email);
    } catch (e) {
        password = await getPasswordIntoHash(password)

        const userColl = await userCollection()
        await userColl.insertOne({
            first_name,
            last_name,
            email,
            phone,
            address,

            birth_date,
            password,
            favMenus: [],
            favRestaurants: []
        })
        return {insert: true}
    }
    throw "User already exist with email";
}


const findUserByEmail = async (email, notDeletePassword) => {
    validateEmail(email)
    email = email.toLowerCase();
    const userColl = await userCollection()
    const data = await userColl.find({}).toArray();
    const user = data.find(v => v.email.toLowerCase() === email);
    if (!user) throw "User not found for email " + email;
    if (!notDeletePassword) {
        delete user.password;
    }
    return user;
}

const verifyEmailPasswordOfUser = async (email, password) => {
    const user = await findUserByEmail(email, true);
    if (!await comparePassword(password, user.password)) throw "Either username or password is invalid";
    return {authenticated: true};
}

const updateUser = async (email, first_name, last_name, phone, address, birth_date) => {

    first_name = validateOnlyAlphabets(first_name, "first_name")
    last_name = validateOnlyAlphabets(last_name, "last_name")
    email = validateEmail(email);
    phone = validateOnlyNumber(phone || "", 'Phone', 1)
    address = validateString(address, 'Address', 1);
    validateDate(birth_date, "birth_date");
    const userCol = await userCollection();
    const info = await userCol.updateOne({email}, {
        $set: {
            first_name, last_name, phone, address, birth_date
        }
    })
    if (info.matchedCount === 0) throw `User not found for email ${email}`;
}


const markFavRestaurantsForUser = async (restId, email) => {
    const userCol = await userCollection();
    const user = await findUserByEmail(email);
    if (user.favRestaurants.includes(restId)) throw "Already mark as favourite";
    await userCol.updateOne({email}, {
        $push: {
            favRestaurants: restId
        }
    });
    return {updated: true}
}

const removeRestaurantsFromFavouriteUser = async (restId, email) => {
    const userCol = await userCollection();
    const user = await findUserByEmail(email);
    if (!user.favRestaurants.includes(restId)) throw "Restaurant not exist in favourite list";
    await userCol.updateOne({email}, {
        $pull: {
            favRestaurants: restId
        }
    });
    return {updated: true}
}


const markFavItemForUser = async (menuId, email) => {
    const userCol = await userCollection();
    const user = await findUserByEmail(email);
    if (user.favMenus.includes(menuId)) throw "Already mark as favourite";
    await userCol.updateOne({email}, {
        $push: {
            favMenus: menuId
        }
    });
    return {updated: true}
}

const removeItemFromFavouriteUser = async (menuId, email) => {
    const userCol = await userCollection();
    const user = await findUserByEmail(email);
    if (!user.favMenus.includes(menuId)) throw "Menu item not exist in favourite list";
    await userCol.updateOne({email}, {
        $pull: {
            favMenus: menuId
        }
    });
    return {updated: true}
}


module.exports = {
    createUser,
    verifyEmailPasswordOfUser,
    findUserByEmail,
    updateUser,
    markFavRestaurantsForUser,
    removeRestaurantsFromFavouriteUser,
    markFavItemForUser,
    removeItemFromFavouriteUser
}
