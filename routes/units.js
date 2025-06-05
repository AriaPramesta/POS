var express = require('express');
const { isLoggedIn, generatePassword } = require('../helper/util');
var router = express.Router();
const { Unit } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res, next) {
        try {
            const units = await Unit.findAll()
            console.log(units)

            res.render('units/list', { user: req.session.user, data: units });
        } catch (error) {
            console.log(error)
        }
    });

    router.get('/add', isLoggedIn, async function (req, res, next) {
        res.render('units/form', { user: req.session.user, });
    });

    router.post('/add', isLoggedIn, async function (req, res, next) {
        try {
            const { unit, name, note } = req.body

            await Unit.create({ unit, name, note })
            res.redirect('/units')

        } catch (error) {
            console.log(error)
            res.send('Failed to create data')
        }
    });


    return router;
}