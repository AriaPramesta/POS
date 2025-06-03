var express = require('express');
const { comparePassword } = require('../helper/util');
var router = express.Router();

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
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email])

            if (result.rows.length === 0) {
                req.flash('errorMessage', "Email doesn't exist")
                return res.redirect('/');
            }

            const user = result.rows[0]
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