const attachRouts = (app) => {
    app.use('/register', require('./register'))
    app.use('/login', require('./login'))
    app.use('/restaurant', require('./restaurant'))
    app.use('/user', require('./user'))
    app.use('/logout', require('./logout'))
    app.use('/menu', require('./menu'))
    app.use('/order', require('./order'))
    app.use('/reviews', require('./reviews'))
    app.use('/changePassword', require('./changePassword'))
    app.use('*', (req, res) => {
        res.status(404).render('pageNotFound', {title: "Page not found"});
    });
};

module.exports = attachRouts;
