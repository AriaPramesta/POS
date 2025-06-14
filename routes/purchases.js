var express = require('express');
const { isLoggedIn } = require('../helper/util');
const { Purchase, Supplier, User, Good, PurchaseItem } = require('../models')
const moment = require('moment');
var router = express.Router();

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        try {
            const purchases = await Purchase.findAll({
                include: [
                    {
                        model: Supplier
                    }
                ]
            })
            res.render('purchases/list', { user: req.session.user, purchases, moment })
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/add', isLoggedIn, async function (req, res) {
        try {
            const supplier = await Supplier.findOne({})
            // console.log(supplier)
            const purchase = await Purchase.create({ totalsum: 0, supplier: supplier.supplierid, operator: req.session.user.id })
            res.redirect(`/purchases/edit/${purchase.invoice}`)
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/edit/:invoice', isLoggedIn, async function (req, res) {
        try {
            const purchase = await Purchase.findOne({
                where: { invoice: req.params.invoice },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: PurchaseItem,
                        include: [
                            {
                                model: Good,
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            })
            console.log('Purchase', purchase)

            const suppliers = await Supplier.findAll()

            const goods = await Good.findAll()

            const totalsum = purchase.PurchaseItems?.reduce((sum, item) => sum + Number(item.totalprice), 0) || 0;

            const now = moment();;
            const currentDateTime = now.format('DD MMM YYYY HH:mm:ss');

            res.render('purchases/form', { user: req.session.user, purchase, currentDateTime, goods, suppliers, totalsum })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/edit/:invoice/item', isLoggedIn, async function (req, res) {
        const { invoice } = req.params
        const { itemcode, quantity, purchaseprice, totalprice } = req.body

        try {
            const item = await PurchaseItem.create({ invoice, itemcode, quantity, purchaseprice, totalprice })
            res.status(201).json(item)
        } catch (error) {
            console.log(err)
            res.status(400).json({ error: err.message });

        }
    })

    return router
}