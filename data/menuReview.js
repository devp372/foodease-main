const {validateObjectId, validateEmail, validateString} = require("../helpers");
const {reviewMenuItem, reviewRestaurant} = require("../config/mongoCollections");
const {getAllOrdersForUser} = require("./order");
const {findUserByEmail} = require("./user");
const {getMenuItem} = require("./menuItem");
const writeReviewMenuItem = async (menuId, email, review) => {
    validateObjectId(menuId, "Menu id");
    validateEmail(email);
    validateString(review, "Review", 1);


    const order = await getAllOrdersForUser(email);
    const flag = order.find(v => {
        if (v.status !== 'pending' && v.status !== 'rejected') {
            return !!v.menu.find(x => {
                return x.id === menuId;
            })
        }
        return false;
    })
    if (!flag) throw "You can not give review for which you have not order";
    const reviewCol = await reviewMenuItem();
    await reviewCol.insertOne({menuId, email, review});
    return {inserted: true};
}

const patch = async (reviews) => {
    reviews = await reviews;
    if (!Array.isArray(reviews)) return [];
    for (const review of reviews) {
        review._user = await findUserByEmail(review.email);
        review._item = await getMenuItem(review.menuId);
        review._restaurantId = review._item.restId;
        review._item = review._item.item;
    }
    return reviews;
}


const getMenuReviewById = async (id) => {
    id = validateObjectId(id, 'Review Id');
    const reviewCol = await reviewMenuItem();
    const review = await reviewCol.findOne({_id: id})
    if (!review) throw "Review not found with id " + id;
    return (await patch([review]))[0];
}
const updateMenuReview = async (id, review) => {
    id = validateObjectId(id, "Review Id");
    validateString(review, "Review", 1)
    const reviewCol = await reviewMenuItem();
    const info = await reviewCol.updateOne({_id: id}, {$set: {review}})
    if (info.matchedCount === 0) throw `Review not found for id ` + id;
    return {updated: true};
}


const deleteMenuReview = async (id) => {
    id = validateObjectId(id, "Review Id");
    await getMenuReviewById(id)
    const reviewCol = await reviewMenuItem();
    const info = await reviewCol.deleteOne({_id: id})
    console.log(info);
    return {deleted: true};
}

const getReviewMenuItemByEmail = async (email) => {
    validateEmail(email);
    const reviewCol = await reviewMenuItem();
    return patch(await reviewCol.find({email}).toArray());
}

const getReviewMenuItemByMenuId = async (menuId) => {
    validateObjectId(menuId, "Menu Id");
    const reviewCol = await reviewMenuItem();
    return patch(await reviewCol.find({menuId}).toArray());
}

module.exports = {
    writeReviewMenuItem,
    getReviewMenuItemByEmail,
    getReviewMenuItemByMenuId,
    getMenuReviewById,
    updateMenuReview,
    deleteMenuReview
}
