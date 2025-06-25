var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helper/util');
const { Sale, Customer, SaleItem, Good, User, sequelize } = require('../models')
const { Op } = require('sequelize');
const moment = require('moment');
const { generateInvoiceNumber } = require('../services/salesService');

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
            return res.redirect(`/sales?${queryString}`);
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

            const { count: totalSales, rows: sales } = await Sale.findAndCountAll({
                where: whereClause,
                order: [[sortBy, sortMode]],
                limit,
                offset,
                include: [
                    {
                        model: Customer
                    }
                ]
            })
            const pages = Math.ceil(totalSales / limit)

            const query = { ...req.query };
            delete query.page;
            const queryString = new URLSearchParams(query).toString();
            const baseUrl = `/sales?${queryString}`;

            res.render('sales/list', {
                user: req.session.user,
                sales,
                moment,
                search: keyword,
                currentPage: +page,
                pages,
                sortBy,
                sortMode,
                limit,
                offset,
                baseUrl,
                totalSales
            })
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/add', isLoggedIn, async function (req, res) {
        try {
            const invoice = await generateInvoiceNumber()
            const customer = await Customer.findOne({})

            const sale = await Sale.create({ invoice, totalsum: 0, pay: 0, change: 0, customer: customer.customerid, operator: req.session.user.id })
            res.redirect(`/sales/edit/${sale.invoice}`)
        } catch (error) {
            console.log(error)
        }
    })

    router.get('/edit/:invoice', isLoggedIn, async function (req, res) {
        try {
            const sale = await Sale.findOne({
                where: { invoice: req.params.invoice },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Customer,
                    },
                    {
                        model: SaleItem,
                        include: [
                            {
                                model: Good,
                            }
                        ]
                    }
                ]
            })

            const customers = await Customer.findAll()

            const goods = await Good.findAll()

            const now = moment();;
            const currentDateTime = now.format('DD MMM YYYY HH:mm:ss');

            res.render('sales/form', { user: req.session.user, sale, currentDateTime, goods, customers })
        } catch (error) {
            console.log(error)
        }
    })

    router.post('/edit/:invoice/item', isLoggedIn, async function (req, res) {
        const invoice = req.params.invoice;
        const { itemcode, quantity } = req.body;

        const t = await sequelize.transaction();

        try {
            if (!itemcode || !quantity || isNaN(quantity)) {
                throw new Error('Itemcode atau quantity tidak valid');
            }

            const sale = await Sale.findOne({ where: { invoice }, transaction: t });
            if (!sale) throw new Error("Sale Not Found!");

            const good = await Good.findByPk(itemcode, { transaction: t });
            if (!good) throw new Error("Good Not Found!");

            if (good.stock < quantity) {
                throw new Error(`Stock barang tidak mencukupi. Tersedia: ${good.stock}`);
            }

            const selling = parseFloat(good.sellingprice);
            if (isNaN(selling)) throw new Error("Harga jual tidak valid");

            const totalprice = quantity * selling;
            if (isNaN(totalprice)) throw new Error("Total price tidak valid");

            const saleItems = await SaleItem.create({
                invoice,
                itemcode,
                quantity,
                sellingprice: selling,
                totalprice
            }, { transaction: t });

            const newStock = good.stock - quantity;
            await good.update({ stock: newStock }, { transaction: t });

            const items = await SaleItem.findAll({
                where: { invoice },
                include: [{ model: Good }],
                transaction: t
            });

            console.log('items:', items)

            const totalsum = items.reduce((sum, item) => sum + parseFloat(item.totalprice), 0);
            await Sale.update({ totalsum }, { where: { invoice }, transaction: t });

            await t.commit();

            const item = await SaleItem.findOne({
                where: { id: saleItems.id },
                include: [{ model: Good }]
            });

            res.status(201).json({ item, totalsum, good });
        } catch (error) {
            await t.rollback();
            console.error("Gagal tambah item:", error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/edit/:invoice', isLoggedIn, async (req, res) => {
        const invoice = req.params.invoice
        const { pay } = req.body

        const t = await sequelize.transaction();
        try {
            const item = await Sale.findOne({ where: { invoice } }, { transaction: t })

            const change = pay - item.totalsum

            await Sale.update({ pay, change }, { where: { invoice }, transaction: t })

            await t.commit();

            res.json(change)
        } catch (error) {
            await t.rollback();
            console.log(error)
        }
    });

    router.post('/delete/:invoice', isLoggedIn, async (req, res) => {
        const invoice = req.params.invoice;
        const t = await sequelize.transaction();

        try {
            const sale = await Sale.findOne({
                where: { invoice },
                include: [{
                    model: SaleItem,
                    include: [Good]
                }],
                transaction: t
            });

            if (!sale || !sale.SaleItems || sale.SaleItems.length === 0) {
                await t.rollback();
                return res.status(404).send('Transaksi tidak ditemukan atau kosong');
            }

            for (const item of sale.SaleItems) {
                if (item.Good) {
                    const updatedStock = item.Good.stock + item.quantity;

                    await item.Good.update(
                        { stock: updatedStock },
                        { transaction: t }
                    );
                }

                await SaleItem.destroy({
                    where: { id: item.id },
                    transaction: t
                });
            }

            await Sale.destroy({
                where: { invoice },
                transaction: t
            });

            await t.commit();
            res.redirect('/sales');
        } catch (err) {
            if (!t.finished) await t.rollback();
            console.error(err);
            res.status(500).send('Terjadi kesalahan saat menghapus data');
        }
    });


    router.post('/delete/:id/item', isLoggedIn, async (req, res) => {
        const { id } = req.params;

        const t = await sequelize.transaction();

        try {
            const item = await SaleItem.findOne({
                where: { id },
                include: [{ model: Good }],
                transaction: t
            });

            if (!item) throw new Error('Item tidak ditemukan');

            const invoice = item.invoice;
            const quantity = item.quantity;

            const good = item.Good;
            await good.update(
                { stock: good.stock + quantity },
                { transaction: t }
            );

            await SaleItem.destroy({ where: { id }, transaction: t });

            const items = await SaleItem.findAll({
                where: { invoice },
                transaction: t
            });

            const totalsum = items.reduce((sum, item) => sum + parseFloat(item.totalprice), 0);

            await Sale.update({ totalsum }, { where: { invoice }, transaction: t });

            await t.commit();
            res.redirect('back');
        } catch (err) {
            await t.rollback();
            console.error(err);
            res.status(500).send('Gagal menghapus item');
        }
    });


    return router;
}