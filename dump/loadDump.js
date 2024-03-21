const fs = require("fs");
const {validateObjectId} = require("../helpers");
const {
    userCollection, restaurantsCollection, orderCollection, reviewMenuItem, reviewRestaurant
} = require("../config/mongoCollections");
const path = require("path");

const loadUserCollection = async () => {
    let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json')) + "");
    users.forEach(v => {
        v._id = validateObjectId(v._id);
    })
    const userCol = await userCollection()
    await userCol.deleteMany({});
    await userCol.insertMany(users);
}
const loadRestaurantCollection = async () => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'restaurants.json')) + "");
    data.forEach(v => {
        v._id = validateObjectId(v._id);
        v.menu.forEach(m => {
            m._id = validateObjectId(m._id);
        })
    })
    const col = await restaurantsCollection()
    await col.deleteMany({})
    await col.insertMany(data);
}
const loadOrdersCollection = async () => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'orders.json')) + "");
    const col = await orderCollection()
    await col.deleteMany({})

    await col.insertMany(data);
}


const loadReviewMenuItemCollection = async () => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviewMenuItem.json')) + "");
    data.forEach(v => {
        v._id = validateObjectId(v._id);
    })
    const col = await reviewMenuItem()
    await col.deleteMany({})

    await col.insertMany(data);
}
const loadReviewRestaurantCollection = async () => {
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, 'reviewRestaurant.json')) + "");
    data.forEach(v => {
        v._id = validateObjectId(v._id);
    })
    const col = await reviewRestaurant()
    await col.deleteMany({})

    await col.insertMany(data);
}

const loadDump = async () => {
    await loadUserCollection();
    await loadRestaurantCollection();
    await loadOrdersCollection();
    await loadReviewMenuItemCollection();
    await loadReviewRestaurantCollection();
    console.log("Done")
    process.exit();
}

loadDump();

