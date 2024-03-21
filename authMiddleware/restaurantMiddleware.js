const {findRestaurantByResId} = require("../data/restaurants");
const restaurantMiddleware = async (req, res, next) => {
    let user = req.session.user;
    user = JSON.parse(user);
    if (user.isUser) {
        return res.status(403).render('forbiddenAccess', {
            title: "Forbidden Access", message: "User does not have this route access"
        })
    }
    req.user = user;
    try {
        req.rest = await findRestaurantByResId(req.user.id);
    } catch (e) {
        return res.status(400).render('error', {error: e})
    }
    next();
}
module.exports = {
    restaurantMiddleware
}
