/**
 * Middleware to protect admin routes
 * Checks if user is authenticated as admin via session
 */
module.exports = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};
