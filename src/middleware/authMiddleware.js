function isAuthenticated(req, res, next) {
    res.locals.loggedIn = req.session.userId ? true : false;
    // res.locals.profilePicture = req.session.profilePicture || 'defaultProfilePic.png'; // Adjust default profile picture as necessary
    res.locals.loggedUsername = req.session.username;
    res.locals.userId = req.session.userId;

    if (res.locals.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = { isAuthenticated };
