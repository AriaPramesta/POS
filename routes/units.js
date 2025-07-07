var express = require('express');
const { isAdmin } = require('../helper/util');
var router = express.Router();
const { Unit } = require('../models')

module.exports = function (db) {
    router.get('/', isAdmin, async function (req, res, next) {
        try {
            const units = await Unit.findAll();

            res.render('units/list', {
                user: req.session.user,
                units,
            });
        } catch (error) {
            console.log(error)
        }
    });

    router.get('/add', isAdmin, async function (req, res, next) {
        res.render('units/form', { user: req.session.user, item: null });
    });

    router.post('/add', isAdmin, async function (req, res, next) {
        try {
            const { unit, name, note } = req.body

            await Unit.create({ unit, name, note })
            res.redirect('/units')

        } catch (error) {
            console.log(error)
            res.send('Failed to create data')
        }
    });

    router.get('/edit/:id', isAdmin, async function (req, res, next) {
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

    router.post('/edit/:id', isAdmin, async function (req, res, next) {
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


    router.post('/delete/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
        await Unit.destroy({ where: { unit: id } });
        res.redirect('/units');
    });


    return router;
}