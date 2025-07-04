var express = require('express');
const { isLoggedIn } = require('../helper/util');
const { Purchase, Sale, Customer } = require('../models')
const { Op } = require('sequelize')
var router = express.Router();
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

module.exports = function (db) {
  router.get('/', isLoggedIn, async function (req, res, next) {
    try {
      const report = await sequelize.query(`
        SELECT
          TO_CHAR(COALESCE(sales.month, purchases.month), 'Mon YY') AS label,
          COALESCE(sales.total_revenue, 0) AS revenue,
          COALESCE(purchases.total_expense, 0) AS expense,
          COALESCE(sales.total_revenue, 0) - COALESCE(purchases.total_expense, 0) AS earning
        FROM
          (
            SELECT DATE_TRUNC('month', time) AS month, SUM(totalsum) AS total_revenue
            FROM "Sales"
            GROUP BY month
          ) sales
        FULL OUTER JOIN
          (
            SELECT DATE_TRUNC('month', time) AS month, SUM(totalsum) AS total_expense
            FROM "Purchases"
            GROUP BY month
          ) purchases
        ON sales.month = purchases.month
        ORDER BY COALESCE(sales.month, purchases.month)
      `, { type: QueryTypes.SELECT });

      const totalPurchase = report.reduce((sum, r) => sum + Number(r.expense), 0);
      const totalSales = report.reduce((sum, r) => sum + Number(r.revenue), 0);
      const earnings = report.reduce((sum, r) => sum + Number(r.earning), 0);

      const countSales = await Sale.count();

      const directCount = await Sale.count({
        include: {
          model: Customer,
          where: { name: 'Umum' }
        }
      });

      const customerCount = await Sale.count({
        include: {
          model: Customer,
          where: { name: { [Op.ne]: 'Umum' } }
        }
      });

      const labels = report.map(r => r.label);
      const earningsData = report.map(r => Number(r.earning));

      console.log({ totalPurchase, totalSales, earnings });
      console.table(report);

      res.render('dashboard/view', {
        user: req.session.user,
        totalPurchase,
        totalSales,
        earnings,
        countSales,
        data: JSON.stringify([directCount, customerCount]),
        labels: JSON.stringify(labels),
        earningsData: JSON.stringify(earningsData),
        dataTable: report
      });

    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching dashboard data');
    }
  });

  return router;
}
