var express = require('express');
const { isLoggedIn, comparePassword, generatePassword } = require('../helper/util');
var router = express.Router();
const { User } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {

      const users = await User.findAll();

      res.render('users/list', {
        user: req.session.user,
        data: users,
      });
    } catch (error) {
      console.log(error)
    }
  });

  router.get('/add', isLoggedIn, function (req, res, next) {
    res.render('users/form', { user: req.session.user, item: null });
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
      const id = req.params.id;

      const user = await User.findOne({ where: { id } });

      if (!user) {
        return res.status(404).send('Data not found');
      }

      res.render('users/form', { user: req.session.user, item: user });
    } catch (error) {
      console.error(error);
      res.send('Error while trying to get data');
    }
  });

  router.post('/edit/:id', isLoggedIn, async function (req, res, next) {
    try {
      const id = req.params.id;
      const { email, name, role } = req.body;

      await User.update(
        { email, name, role },
        { where: { id } }
      );

      res.redirect('/users');
    } catch (error) {
      console.error(error);
      res.send('Update data error');
    }
  });

  router.post('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.redirect('/users');
  });

  router.get('/profile', isLoggedIn, async function (req, res) {
    try {
      res.render('users/profile', {
        user: req.session.user,
        errorMessage: req.flash('errorMessage'),
        successMessage: req.flash('successMessage')
      })
    } catch (error) {
      console.log(error)
    }
  })

  router.post('/profile', isLoggedIn, async function (req, res) {
    try {
      const { email, name } = req.body;
      const userId = req.session.user.id;

      await User.update(
        { email, name },
        { where: { id: userId } }
      );

      const updatedUser = await User.findByPk(userId);
      req.session.user = updatedUser;

      req.flash('successMessage', 'Profile updated successfully!');
      res.redirect('/users/profile');
    } catch (error) {
      console.error(error);
      req.flash('errorMessage', 'Failed to update profile');
      res.redirect('/users/profile');
    }
  })

  router.get('/changepassword', isLoggedIn, async function (req, res) {
    try {
      res.render('users/changepw', {
        user: req.session.user,
        errorMessage: req.flash('errorMessage'),
        successMessage: req.flash('successMessage')
      })
    } catch (error) {
      console.log(error)
    }
  })

  router.post('/changepassword', isLoggedIn, async function (req, res) {
    try {
      const { oldpw, newpw, repw } = req.body;
      const userId = req.session.user.id;

      const user = await User.findByPk(userId);
      const isPasswordValid = comparePassword(oldpw, user.password);
      if (!isPasswordValid) {
        req.flash('errorMessage', 'Old password is incorrect');
        return res.redirect('/users/changepassword');
      }

      if (newpw !== repw) {
        req.flash('errorMessage', 'New password and confirmation do not match');
        return res.redirect('/users/changepassword');
      }

      const hashedPassword = generatePassword(newpw, 10);

      await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      req.flash('successMessage', 'Password updated successfully');
      res.redirect('/users/profile');
    } catch (error) {
      console.error(error);
      req.flash('errorMessage', 'Failed to update password');
      res.redirect('/users/changepassword');
    }
  })

  return router;
}