const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    generatePassword: function (password) {
        return bcrypt.hashSync(password, saltRounds)
    },
    comparePassword: function (password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword)
    },
    isLoggedIn: function (req, res, next) {
        if (req.session.user) {
            return next();
        } else {
            res.redirect('/');
        }
    },
    isAdmin: function (req, res, next) {
        if (req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        res.redirect('/sales');
    }
}