var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const result = await db.query('SELECT * FROM users')

      console.log(result.rows)

      res.render('users/users', { user: req.session.user, data: result.rows });
    } catch (error) {

    }
  });



  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('users/users-add', { user: req.session.user });
  });

  return router;
}