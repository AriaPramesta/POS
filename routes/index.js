var express = require('express');
const { comparePassword } = require('../helper/util');
var router = express.Router();
const { User } = require('../models')

module.exports = function (db) {
    router.get('/', function (req, res, next) {
        res.render('login', {
            errorMessage: req.flash('errorMessage'),
            successMessage: req.flash('successMessage')
        });
    });

    router.post('/', async (req, res) => {
        const { email, password } = req.body

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                req.flash('errorMessage', "Email doesn't exist")
                return res.redirect('/');
            }

            const checkPw = comparePassword(password, user.password)

            if (checkPw) {
                req.session.user = user
                return res.redirect('/dashboard')
            } else {
                req.flash('errorMessage', 'Wrong Email or Password!')
                return res.redirect('/');
            }

        } catch (error) {
            console.log(error)
        }
    })

    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        });
    });

    return router;
}