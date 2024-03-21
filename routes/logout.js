const express = require('express');
const {authMiddleware} = require("../authMiddleware/authMiddleware");
const router = express.Router();
router.use(authMiddleware);
router.route('/').get((req, res) => {
    req.session.destroy();
    res.render('logout', {title: "Logout"})
})
module.exports = router;
