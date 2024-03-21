const {findUserByEmail} = require("../data/user");
const userAuthMiddleware = async (req, res, next) => {
    let user = req.session.user;
    user = JSON.parse(user);
    if (!user.isUser) {
        return res.status(403).render('forbiddenAccess', {
            title: "Forbidden Access", message: "User does not have this route access"
        })
    }
    try {
        user = await findUserByEmail(user.id);
    } catch (e) {
        return res.render('error', {error: e, title: "Error"})
    }

    req.user = user;
    next();
}

module.exports = {
    userAuthMiddleware
}
