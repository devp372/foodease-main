const authMiddleware = async (req, res, next) => {
    let user = req.session.user;
    if (!user) {
        return res.status(403).render('forbiddenAccess', {title: "Forbidden Access", message: "User is not logged in"})
    }
    req._user = JSON.parse(user);
    next()
}

module.exports = {
    authMiddleware
}
