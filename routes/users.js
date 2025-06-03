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

  router.get('/edit/:id', isLoggedIn, async function (req, res, next) {
    try {
      const userId = req.params.id;

      const result = await db.query('SELECT * FROM users WHERE "userId" = $1', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).send('Data not found');
      }

      const item = result.rows[0];
      res.render('users/users-edit', { item });
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
        'UPDATE users SET email = $1, name = $2, role = $3 WHERE "userId" = $4',
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

      await db.query('DELETE FROM users WHERE "userId" = $1', [userId]);

      res.redirect('/users');
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).send('Internal Server Error');
    }
  });


  return router;
}