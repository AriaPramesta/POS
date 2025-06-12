var express = require('express');
const { isLoggedIn } = require('../helper/util');
const { Purchase, Supplier } = require('../models')
var router = express.Router();

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        res.render('purchases/list', { user: req.session.user })
    })

    router.get('/add', isLoggedIn, async function (req, res) {
        try {
            const supplier = await Supplier.findOne({})
            console.log(supplier)
            const purchase = await Purchase.create({ totalsum: 0, supplier: supplier.supplierid, operator: req.session.user.id })
            res.redirect(`/purchases/edit/${purchase.invoice}`)
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/edit/:invoice', isLoggedIn, async function (req, res) {
        try {
            const purchase = await Purchase.findByPk(req.params.invoice)
            console.log(purchase)
            res.render('purchases/form', { user: req.session.user, purchase })
        } catch (error) {
            console.log(error)
        }
    })

    return router
}