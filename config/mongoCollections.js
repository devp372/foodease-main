const dbConnection = require('./mongoConnection');
const getCollectionFn = (collection) => {
    let _col = undefined;
    return async () => {
        if (!_col) {
            const db = await dbConnection.dbConnection();
            _col = await db.collection(collection);
        }
        return _col;
    };
};
module.exports = {
    restaurantsCollection: getCollectionFn('restaurants'),
    userCollection: getCollectionFn('users'),
    orderCollection: getCollectionFn('orders'),
    reviewMenuItem: getCollectionFn('reviewMenuItem'),
    reviewRestaurant: getCollectionFn('reviewRestaurant')
};
