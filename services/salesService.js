const moment = require('moment');
const { Op } = require('sequelize');
const { Sale, SaleItem } = require('../models')

async function generateInvoiceNumber() {
    const today = moment().format('YYYYMMDD');
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();

    const count = await Sale.count({
        where: {
            createdAt: {
                [Op.between]: [todayStart, todayEnd]
            }
        }
    });

    const nextNumber = count + 1;
    const invoice = `INV-PENJ${today}-${String(nextNumber).padStart(3, '0')}`;
    return invoice;
}

module.exports = {
    generateInvoiceNumber
}