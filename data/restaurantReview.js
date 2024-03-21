const {validateEmail, validateString, validateUsername, validateObjectId} = require("../helpers");
const {reviewRestaurant, orderCollection} = require("../config/mongoCollections");
const {findRestaurantByResId} = require("./restaurants");
const {findUserByEmail} = require("./user");
const writeReviewRestaurant = async (restId, email, review) => {
    validateUsername(restId, "Restaurant Id");
    validateEmail(email);
    validateString(review, "Review", 1);
    const reviewCol = await reviewRestaurant();
    const orderCol = await orderCollection();
    const flag = await orderCol.find({email, restaurantId: restId}).toArray();
    if (!flag || flag.length === 0) throw "No order found by you for restaurantId " + restId + " so, You are unable to give review";
    await reviewCol.insertOne({restaurantId: restId, email, review});
    return {inserted: true};
}


const patch = async (reviews) => {
    if (!Array.isArray(reviews)) return [];
    for (const review of reviews) {
        review._restaurant = await findRestaurantByResId(review.restaurantId);
        review._user = await findUserByEmail(review.email);
    }
    return reviews;
}

const getReviewRestaurantByEmail = async (email) => {
    validateEmail(email);
    const reviewCol = await reviewRestaurant();
    const reviews = await reviewCol.find({email}).toArray()
    return patch(reviews);
}

const getRestaurantReviewById = async (id) => {
    id = validateObjectId(id, 'Review Id');
    const reviewCol = await reviewRestaurant();
    const review = await reviewCol.findOne({_id: id})
    if (!review) throw "Review not found with id " + id;
    return (await patch([review]))[0];
}

const getReviewRestaurantByRestaurantId = async (restaurantId) => {
    validateUsername(restaurantId);
    const reviewCol = await reviewRestaurant();
    const reviews = await reviewCol.find({restaurantId}).toArray()
    return patch(reviews);
}

const updateRestaurantReview = async (id, review) => {
    id = validateObjectId(id, "Review Id");
    validateString(review, "Review", 1)
    const reviewCol = await reviewRestaurant();
    const info = await reviewCol.updateOne({_id: id}, {$set: {review}})
    if (info.matchedCount === 0) throw `Review not found for id ` + id;
    return {updated: true};
}

const deleteRestaurantReview = async (id) => {
    id = validateObjectId(id, "Review Id");
    await getRestaurantReviewById(id)
    const reviewCol = await reviewRestaurant();
    const info = await reviewCol.deleteOne({_id: id})
    return {deleted: true};
}


module.exports = {
    writeReviewRestaurant, getReviewRestaurantByEmail, getReviewRestaurantByRestaurantId,
    getRestaurantReviewById, updateRestaurantReview,
    deleteRestaurantReview
}
