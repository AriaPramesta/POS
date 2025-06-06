var express = require('express');
const { isLoggedIn } = require('../helper/util');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const { Good, Unit } = require('../models')
const { Op } = require('sequelize')

module.exports = function (db) {
    router.get('/', isLoggedIn, async function (req, res, next) {
        res.render('goods/list', { user: req.session.user });
    });

    router.get('/add', isLoggedIn, async function (req, res, next) {
        try {
            const units = await Unit.findAll()
            res.render('goods/form', { user: req.session.user, units });
        } catch (error) {
            console.log(error)
        }
    });

    router.post('/add', isLoggedIn, async function (req, res) {
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

    return router;
}
