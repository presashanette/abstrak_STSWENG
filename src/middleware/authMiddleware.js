function isAuthenticated(req, res, next) {
    res.locals.loggedIn = req.session.userId ? true : false;
    res.locals.loggedUsername = req.session.username;
    res.locals.userId = req.session.userId;

    console.log(`User is logged in: ${res.locals.loggedIn}`);

    if (!res.locals.loggedIn) {
        res.redirect('/login');
    } else {
        next();
    }
}

module.exports = { isAuthenticated };
