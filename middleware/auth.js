// Authentication middleware
const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.isAdmin) {
        req.flash('error', 'Please login to access admin area');
        return res.redirect('/admin/login');
    }
    next();
};

module.exports = {
    isAdmin
};
