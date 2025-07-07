var express = require('express');
const { isAdmin } = require('../helper/util')
const { Purchase, Sale, Customer } = require('../models')
const { Op } = require('sequelize')
var router = express.Router();
const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { createObjectCsvWriter } = require('csv-writer');

module.exports = function (db) {
  router.get('/download', isAdmin, async function (req, res) {
    try {
      const { startdate, enddate } = req.query;

      // Filter tanggal yang sama seperti route '/'
      let dateFilterSales = '';
      let dateFilterPurchases = '';
      let replacements = {};

      if (startdate && enddate) {
        dateFilterSales = `WHERE time BETWEEN :startdate AND :enddate`;
        dateFilterPurchases = `WHERE time BETWEEN :startdate AND :enddate`;
        replacements = { startdate, enddate };
      } else if (startdate) {
        dateFilterSales = `WHERE time >= :startdate`;
        dateFilterPurchases = `WHERE time >= :startdate`;
        replacements = { startdate };
      } else if (enddate) {
        dateFilterSales = `WHERE time <= :enddate`;
        dateFilterPurchases = `WHERE time <= :enddate`;
        replacements = { enddate };
      }

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
          ${dateFilterSales}
          GROUP BY month
        ) sales
      FULL OUTER JOIN
        (
          SELECT DATE_TRUNC('month', time) AS month, SUM(totalsum) AS total_expense
          FROM "Purchases"
          ${dateFilterPurchases}
          GROUP BY month
        ) purchases
      ON sales.month = purchases.month
      ORDER BY COALESCE(sales.month, purchases.month)
    `, {
        type: QueryTypes.SELECT,
        replacements
      });

      const csvWriter = createObjectCsvWriter({
        path: 'report.csv',
        header: [
          { id: 'label', title: 'MONTH' },
          { id: 'expense', title: 'EXPENSE' },
          { id: 'revenue', title: 'REVENUE' },
          { id: 'earning', title: 'EARNING' }
        ]
      });

      await csvWriter.writeRecords(report);
      res.download('report.csv', 'report.csv');

    } catch (error) {
      console.error(error);
      res.status(500).send('Error generating report');
    }
  });


  router.get('/', isAdmin, async function (req, res, next) {
    try {
      const { startdate, enddate } = req.query;

      // Date filter clause
      let dateFilterSales = '';
      let dateFilterPurchases = '';
      let replacements = {};

      if (startdate && enddate) {
        dateFilterSales = `WHERE time BETWEEN :startdate AND :enddate`;
        dateFilterPurchases = `WHERE time BETWEEN :startdate AND :enddate`;
        replacements = { startdate, enddate };
      } else if (startdate) {
        dateFilterSales = `WHERE time >= :startdate`;
        dateFilterPurchases = `WHERE time >= :startdate`;
        replacements = { startdate };
      } else if (enddate) {
        dateFilterSales = `WHERE time <= :enddate`;
        dateFilterPurchases = `WHERE time <= :enddate`;
        replacements = { enddate };
      }

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
          ${dateFilterSales}
          GROUP BY month
        ) sales
      FULL OUTER JOIN
        (
          SELECT DATE_TRUNC('month', time) AS month, SUM(totalsum) AS total_expense
          FROM "Purchases"
          ${dateFilterPurchases}
          GROUP BY month
        ) purchases
      ON sales.month = purchases.month
      ORDER BY COALESCE(sales.month, purchases.month)
    `, {
        type: QueryTypes.SELECT,
        replacements
      });

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

      const totalRow = {
        label: 'Total',
        revenue: totalSales,
        expense: totalPurchase,
        earning: earnings
      };

      res.render('dashboard/view', {
        user: req.session.user,
        totalPurchase,
        totalSales,
        earnings,
        countSales,
        data: JSON.stringify([directCount, customerCount]),
        labels: JSON.stringify(labels),
        earningsData: JSON.stringify(earningsData),
        dataTable: report,
        totalDataTable: totalRow,
        startdate,
        enddate
      });

    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching dashboard data');
    }
  });


  return router;
}
