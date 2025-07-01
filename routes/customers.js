var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();
const { Customer } = require('../models')
const { Op } = require('sequelize');

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        try {
            const customers = await Customer.findAll();

            res.render('customers/list', {
                user: req.session.user,
                customers,
            })
        } catch (error) {
            console.log(error)
        }
    })


    router.get('/add', isLoggedIn, async function (req, res) {
        try {
            res.render('customers/form', { user: req.session.user, customer: null })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/add', isLoggedIn, async function (req, res) {
        try {
            const { name, address } = req.body
            const phone = '+62' + req.body.phone

            await Customer.create({ name, address, phone })

            res.redirect('/customers')
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/edit/:id', isLoggedIn, async function (req, res) {
        try {
            const customerid = req.params.id

            const customer = await Customer.findOne({ where: { customerid } })

            res.render('customers/form', { user: req.session.user, customer })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/edit/:id', isLoggedIn, async function (req, res) {
        try {
            const customerid = req.params.id
            const { name, address } = req.body
            const phone = '+62' + req.body.phone

            await Customer.update({ name, address, phone }, { where: { customerid } })

            res.redirect('/customers')
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/delete/:id', async function (req, res) {
        try {
            const customerid = req.params.id
            await Customer.destroy({ where: { customerid } })
            res.redirect('/customers')
        } catch (error) {
            console.log(error)
        }
    })


    return router;
}
