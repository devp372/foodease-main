const express = require('express');
const configRoutes = require('./routes');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require("path");
const app = express();
app.use(session({
    name: 'AuthCookie', secret: "Jigar Secret Cookie", resave: true, saveUninitialized: true
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use((req, res, next) => {
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.user ? 'Authenticated' : "Non-Authenticated"})`)
    next();
})

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'static')));
app.use('/menu/photos', express.static(path.join(__dirname, 'menuPhoto')))
configRoutes(app);
const PORT = 3000
app.listen(PORT, () => {
    console.log('Server stated on http://localhost:' + PORT);
});
