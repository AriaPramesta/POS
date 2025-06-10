var express = require('express');
const { isLoggedIn, generatePassword } = require('../helper/util');
var router = express.Router();
const { Unit } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res, next) {
        const { limit, sortBy, sortMode, search } = req.query;

        if (!limit || !sortBy || !sortMode || search === undefined) {
            const query = {
                limit: limit || 3,
                sortBy: sortBy || 'unit',
                sortMode: sortMode || 'DESC',
                search: search !== undefined ? search : ''
            };

            const queryString = new URLSearchParams(query).toString();
            return res.redirect(`/units?${queryString}`);
        }

        try {
            const { page = 1 } = req.query
            const keyword = req.query.search
            const limit = +req.query.limit || 3
            const offset = limit * (page - 1)

            const sortBy = req.query.sortBy || 'unit';
            const sortMode = req.query.sortMode?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';


            whereClause = {}

            if (keyword) {
                {
                    whereClause = {
                        [Op.or]: [
                            { unit: { [Op.iLike]: `%${keyword}%` } },
                            { name: { [Op.iLike]: `%${keyword}%` } },
                            { note: { [Op.iLike]: `%${keyword}%` } }
                        ]
                    }
                }
            }

            const { count: totalUnits, rows: units } = await Unit.findAndCountAll({
                where: whereClause,
                order: [[sortBy, sortMode]],
                limit,
                offset
            });
            console.log(units)

            const pages = Math.ceil(totalUnits / limit)

            const query = { ...req.query };
            delete query.page;
            const queryString = new URLSearchParams(query).toString();
            const baseUrl = `/units?${queryString}`;
            console.log('base url: ', baseUrl)

            res.render('units/list', {
                user: req.session.user,
                data: units,
                search: keyword,
                currentPage: +page,
                pages,
                sortBy,
                sortMode,
                limit,
                offset,
                baseUrl,
                totalUnits
            });
        } catch (error) {
            console.log(error)
        }
    });

    router.get('/add', isLoggedIn, async function (req, res, next) {
        res.render('units/form', { user: req.session.user, item: null });
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

    router.get('/edit/:id', isLoggedIn, async function (req, res, next) {
        try {
            const id = req.params.id;

            const unit = await Unit.findOne({ where: { unit: id } });

            if (!unit) {
                return res.status(404).send('Data not found');
            }

            res.render('units/form', { user: req.session.user, item: unit });
        } catch (error) {
            console.error(error);
            res.send('Error while trying to get data');
        }
    });

    router.post('/edit/:id', isLoggedIn, async function (req, res, next) {
        try {
            const id = req.params.id;
            const { unit, name, note } = req.body;
            console.log(req.body)

            const unitData = await Unit.findByPk(id);
            if (!unitData) {
                return res.send('Data not found');
            }
            unitData.unit = unit;
            unitData.name = name;
            unitData.note = note;

            await unitData.save();

            res.redirect('/units');
        } catch (error) {
            console.error(error);
            res.send('Terjadi kesalahan saat memperbarui data');
        }
    });


    router.post('/delete/:id', async (req, res) => {
        const { id } = req.params;
        await Unit.destroy({ where: { unit: id } });
        res.redirect('/units');
    });


    return router;
}