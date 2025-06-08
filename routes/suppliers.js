var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();
const path = require('path');
const { Supplier } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        try {
            const suppliers = await Supplier.findAll()

            res.render('suppliers/list', { user: req.session.user, suppliers })
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/add', isLoggedIn, async function (req, res) {
        try {
            res.render('suppliers/form', { user: req.session.user, supplier: null })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/add', isLoggedIn, async function (req, res) {
        try {
            const { name, address, phone } = req.body

            const stringPhone = String(phone)

            await Supplier.create({ name, address, phone: stringPhone })

            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/edit/:id', isLoggedIn, async function (req, res, next) {
        try {
            const supplierid = req.params.id;

            const supplier = await Supplier.findOne({ where: { supplierid } });

            if (!supplier) {
                return res.status(404).send('Data not found');
            }

            res.render('suppliers/form', { user: req.session.user, supplier });
        } catch (error) {
            console.error(error);
            res.send('Error while trying to get data');
        }
    });

    router.post('/edit/:id', isLoggedIn, async function (req, res, next) {
        try {
            const supplierid = req.params.id;
            const { name, address, phone } = req.body;
            const stringPhone = String(phone)

            await Supplier.update(
                { name, address, phone: stringPhone },
                { where: { supplierid } }
            );

            res.redirect('/suppliers');
        } catch (error) {
            console.error(error);
            res.send('Update data error');
        }
    });

    return router;
}
