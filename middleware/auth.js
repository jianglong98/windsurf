// Authentication middleware
const isAdmin = (req, res, next) => {
    // For testing purposes, we'll bypass authentication
    // In production, you would check req.session.isAdmin
    req.session.isAdmin = true;
    next();
};

module.exports = {
    isAdmin
};
