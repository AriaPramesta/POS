var express = require('express');
const { isLoggedIn, generatePassword } = require('../helper/util');
var router = express.Router();
const { User } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    const { limit, sortBy, sortMode, search } = req.query;

    if (!limit || !sortBy || !sortMode || search === undefined) {
      const query = {
        limit: limit || 3,
        sortBy: sortBy || 'id',
        sortMode: sortMode || 'DESC',
        search: search !== undefined ? search : ''
      };

      const queryString = new URLSearchParams(query).toString();
      return res.redirect(`/users?${queryString}`);
    }

    try {
      const { page = 1 } = req.query
      const keyword = req.query.search
      const limit = +req.query.limit || 3
      const offset = limit * (page - 1)

      const sortBy = req.query.sortBy || 'id';
      const sortMode = req.query.sortMode?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';


      whereClause = {}

      if (keyword) {
        {
          whereClause = {
            [Op.or]: [
              { email: { [Op.iLike]: `%${keyword}%` } },
              { name: { [Op.iLike]: `%${keyword}%` } }
            ]
          }
        }
      }

      const { count: totalUsers, rows: users } = await User.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortMode]],
        limit,
        offset
      });

      const pages = Math.ceil(totalUsers / limit)

      const query = { ...req.query };
      delete query.page;
      const queryString = new URLSearchParams(query).toString();
      const baseUrl = `/users?${queryString}`;
      console.log('base url: ', baseUrl)

      res.render('users/list', {
        user: req.session.user,
        data: users,
        search: keyword,
        currentPage: +page,
        pages,
        sortBy,
        sortMode,
        limit,
        offset,
        baseUrl,
        totalUsers
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

  router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await User.destroy({ where: { id } });
    res.redirect('/users');
  });


  return router;
}