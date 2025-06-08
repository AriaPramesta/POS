var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();
const { Supplier } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res) {
        const { limit, sortBy, sortMode, search } = req.query;

        if (!limit || !sortBy || !sortMode || search === undefined) {
            const query = {
                limit: limit || 3,
                sortBy: sortBy || 'supplierid',
                sortMode: sortMode || 'DESC',
                search: search !== undefined ? search : ''
            };

            const queryString = new URLSearchParams(query).toString();
            return res.redirect(`/suppliers?${queryString}`);
        }

        try {
            const { page = 1 } = req.query
            const keyword = req.query.search
            const limit = +req.query.limit || 3
            const offset = limit * (page - 1)

            const sortBy = req.query.sortBy || 'supplierid';
            const sortMode = req.query.sortMode?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            whereClause = {}

            if (keyword) {
                {
                    whereClause = {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${keyword}%` } },
                            { address: { [Op.iLike]: `%${keyword}%` } },
                            { phone: { [Op.iLike]: `%${keyword}%` } }
                        ]
                    }
                }
            }

            const { count: totalSuppliers, rows: suppliers } = await Supplier.findAndCountAll({
                where: whereClause,
                order: [[sortBy, sortMode]],
                limit,
                offset
            });

            const pages = Math.ceil(totalSuppliers / limit)

            const query = { ...req.query };
            delete query.page;
            const queryString = new URLSearchParams(query).toString();
            const baseUrl = `/suppliers?${queryString}`;

            res.render('suppliers/list', {
                user: req.session.user,
                suppliers,
                search: keyword,
                currentPage: +page,
                pages,
                sortBy,
                sortMode,
                limit,
                offset,
                baseUrl,
                totalSuppliers
            })
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

    router.post('/delete/:id', async function (req, res) {
        try {
            const supplierid = parseInt(req.params.id)
            await Supplier.destroy({ where: { supplierid } })
            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
        }
    })

    return router;
}
