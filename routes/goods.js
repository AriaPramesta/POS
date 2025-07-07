var express = require('express');
const { isAdmin } = require('../helper/util')
var router = express.Router();
const path = require('path');
const { Good, Unit } = require('../models')

module.exports = function (db) {
    router.get('/', isAdmin, async function (req, res, next) {
        try {
            const goods = await Good.findAll();

            res.render('goods/list', {
                user: req.session.user,
                goods
            });
        } catch (error) {
            console.log(error)
        }
    });

    router.get('/add', isAdmin, async function (req, res, next) {
        try {
            const units = await Unit.findAll()
            res.render('goods/form', { user: req.session.user, units, good: null });
        } catch (error) {
            console.log(error)
        }
    });

    router.post('/add', isAdmin, async function (req, res) {
        try {
            const { barcode, name, stock, purchaseprice, sellingprice, unit } = req.body;

            if (!req.files || !req.files.picture) {
                return res.status(400).send("No picture uploaded.");
            }

            console.log('req.files:', req.files);

            const pictureFile = req.files.picture;
            const fileName = `${Date.now()}-${pictureFile.name}`;
            const uploadPath = path.join(__dirname, '..', 'public', 'images', 'goods', fileName);

            pictureFile.mv(uploadPath, async function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Failed to upload picture.");
                }

                try {
                    await Good.create({
                        barcode,
                        name,
                        stock,
                        purchaseprice,
                        sellingprice,
                        unit,
                        picture: fileName
                    });

                    res.redirect('/goods');
                } catch (err) {
                    console.log(err);
                    res.status(500).send("error.");
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).send("Unexpected error.");
        }
    });

    router.get('/edit/:id', isAdmin, async function (req, res, next) {
        try {
            const id = req.params.id;

            const good = await Good.findOne({ where: { barcode: id } });
            const units = await Unit.findAll()

            if (!good) {
                return res.status(404).send('Data not found');
            }

            res.render('goods/form', { user: req.session.user, units, good });
        } catch (error) {
            console.error(error);
            res.send('Error while trying to get data');
        }
    });

    router.post('/edit/:id', isAdmin, async function (req, res, next) {
        try {
            const id = req.params.id;
            const { barcode, name, stock, unit, purchaseprice, sellingprice, picture } = req.body;

            const goodData = await Good.findByPk(id);
            if (!goodData) {
                return res.send('Data not found');
            }

            goodData.barcode = barcode;
            goodData.name = name;
            goodData.stock = stock;
            goodData.unit = unit;
            goodData.purchaseprice = purchaseprice;
            goodData.sellingprice = sellingprice;
            goodData.picture = picture;

            await goodData.save();

            res.redirect('/goods');
        } catch (error) {
            console.error(error);
            res.send('Terjadi kesalahan saat memperbarui data');
        }
    });

    router.post('/delete/:id', isAdmin, async (req, res) => {
        const { id } = req.params;
        await Good.destroy({ where: { barcode: id } });
        res.redirect('/goods');
    });

    return router;
}
