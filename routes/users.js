var express = require('express');
const { isLoggedIn, generatePassword } = require('../helper/util');
var router = express.Router();

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const result = await db.query('SELECT * FROM users')

      console.log(result.rows)

      res.render('users/users', { user: req.session.user, data: result.rows });
    } catch (error) {
      console.log(error)
    }
  });


  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('users/users-add', { user: req.session.user });
  });

  router.post('/add', isLoggedIn, async function (req, res, next) {
    try {
      const { email, name, password, role } = req.body
      await db.query("INSERT INTO USERS (email, name, password, role) VALUES ($1, $2, $3, $4)", [email, name, generatePassword(password), role])
      res.redirect('/users')
    } catch (error) {
      console.log(error)
      res.send('Failed to insert data')
    }
  });

  return router;
}