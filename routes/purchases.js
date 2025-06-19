var express = require('express');
const { isLoggedIn } = require('../helper/util');
const { Purchase, Supplier, User, Good, PurchaseItem } = require('../models')
const moment = require('moment');
const { Op } = require('sequelize');
var router = express.Router();

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        const { limit, sortBy, sortMode, search } = req.query;

        if (!limit || !sortBy || !sortMode || search === undefined) {
            const query = {
                limit: limit || 3,
                sortBy: sortBy || 'invoice',
                sortMode: sortMode || 'DESC',
                search: search !== undefined ? search : ''
            };

            const queryString = new URLSearchParams(query).toString();
            return res.redirect(`/purchases?${queryString}`);
        }

        try {
            const { page = 1 } = req.query
            const keyword = req.query.search
            const limit = +req.query.limit || 3
            const offset = limit * (page - 1)

            const sortBy = req.query.sortBy || 'invoice';
            const sortMode = req.query.sortMode?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            whereClause = {}

            if (keyword) {
                {
                    whereClause = {
                        [Op.or]: [
                            { invoice: { [Op.iLike]: `%${keyword}%` } }
                        ]
                    }
                }
            }

            const { count: totalPurchases, rows: purchases } = await Purchase.findAndCountAll({
                where: whereClause,
                order: [[sortBy, sortMode]],
                limit,
                offset,
                include: [
                    {
                        model: Supplier
                    }
                ]
            })
            const pages = Math.ceil(totalPurchases / limit)

            const query = { ...req.query };
            delete query.page;
            const queryString = new URLSearchParams(query).toString();
            const baseUrl = `/purchases?${queryString}`;

            res.render('purchases/list', {
                user: req.session.user,
                purchases,
                moment,
                search: keyword,
                currentPage: +page,
                pages,
                sortBy,
                sortMode,
                limit,
                offset,
                baseUrl,
                totalPurchases
            })
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
            console.log('Purchase', JSON.stringify(purchase))

            const suppliers = await Supplier.findAll()

            const goods = await Good.findAll()

            const now = moment();;
            const currentDateTime = now.format('DD MMM YYYY HH:mm:ss');

            res.render('purchases/form', { user: req.session.user, purchase, currentDateTime, goods, suppliers })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/edit/:invoice/item', isLoggedIn, async function (req, res) {
        const { invoice } = req.params
        const { itemcode, quantity, purchaseprice, totalprice } = req.body

        try {
            const purchaseItem = await PurchaseItem.create({ invoice, itemcode, quantity, purchaseprice, totalprice })
            const item = await PurchaseItem.findOne({
                where: { id: purchaseItem.id },
                include: [{
                    model: Good,
                    attributes: ['stock']
                }]
            })
            const purchase = await Purchase.findByPk(item.invoice)
            res.status(201).json({ purchase, item })
        } catch (error) {
            console.log(err)
            res.status(400).json({ error: err.message });

        }
    })

    router.post('/edit/:invoice', isLoggedIn, async function (req, res) {
        const { invoice } = req.params
        const { time, supplier, totalsum } = req.body

        try {
            const item = await Purchase.update(
                { time, supplier, totalsum },
                { where: { invoice } }

            )
            res.status(201).json(item)
        } catch (error) {
            console.log(err)
            res.status(400).json({ error: err.message });

        }
    })

    router.post('/delete/:invoice', isLoggedIn, async (req, res) => {
        const { invoice } = req.params;

        try {
            await Purchase.destroy({ where: { invoice } });
            res.redirect('/purchases')
        } catch (err) {
            console.error(err);
            res.status(500).send('Gagal menghapus item');
        }
    });

    router.post('/delete/:id/item', isLoggedIn, async (req, res) => {
        const { id } = req.params;

        try {
            await PurchaseItem.destroy({ where: { id } });
            res.redirect('back');
        } catch (err) {
            console.error(err);
            res.status(500).send('Gagal menghapus item');
        }
    });


    return router
}