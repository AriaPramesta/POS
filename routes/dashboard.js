var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();

module.exports = function (db) {
  router.get('/', isLoggedIn, function (req, res, next) {
    res.render('dashboard', { user: req.session.user });
  });

  return router;
}
