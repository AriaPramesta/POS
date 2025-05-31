var express = require('express');
const { comparePassword } = require('../helper/util');
var router = express.Router();

module.exports = function (db) {
    router.get('/', function (req, res, next) {
        res.render('login', { title: 'Login' });
    });

    router.post('/', async (req, res) => {
        const { email, password } = req.body

        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email])

            if (result.rows.length === 0) {
                return res.render('login', { title: 'Login', error: "user not found" })
            }

            const user = result.rows[0]
            console.log(result)
            const checkPw = await comparePassword(password, user.password)

            if (checkPw) return res.redirect('/dashboard')
            else return res.render('login', { title: 'Login', error: 'Incorrect password' });

        } catch (error) {
            console.log(error)
        }
    })

    return router;
}