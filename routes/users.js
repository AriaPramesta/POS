var express = require('express');
const { isLoggedIn, generatePassword } = require('../helper/util');
var router = express.Router();
const { User } = require('../models')

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const users = await User.findAll()

      console.log(users)

      res.render('users/list', { user: req.session.user, data: users });
    } catch (error) {
      console.log(error)
    }
  });

  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('users/form', { user: req.session.user });
  });

  router.post('/add', isLoggedIn, async function (req, res, next) {
    try {
      const { email, name, password, role } = req.body
      await User.create({ email, name, password, role })
      res.redirect('/users')
    } catch (error) {
      console.log(error)
      res.send('Failed to insert data')
    }
  });

  router.get('/edit/:id', isLoggedIn, async function (req, res, next) {
    try {
      const userId = req.params.id;

      const result = await db.query('SELECT * FROM Users WHERE userid = $1', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).send('Data not found');
      }

      const item = result.rows[0];
      res.render('users/form', { item });
    } catch (error) {
      console.error(error);
      res.send('Error while trying to get data');
    }
  });

  router.post('/edit/:id', isLoggedIn, async function (req, res, next) {
    try {
      const userId = req.params.id;
      const { email, name, role } = req.body;

      await db.query(
        'UPDATE Users SET email = $1, name = $2, role = $3 WHERE userid = $4',
        [email, name, role, userId]
      );

      res.redirect('/users');
    } catch (error) {
      console.error(error);
      res.send('Update data error');
    }
  });

  router.post('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
      if (!userId) return res.status(400).send('Invalid user ID');

      await db.query('DELETE FROM Users WHERE userid = $1', [userId]);

      res.redirect('/users');
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).send('Internal Server Error');
    }
  });


  return router;
}