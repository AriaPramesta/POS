'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Buat sequence (sekali saja)
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS purchase_invoice_seq;
    `);

    // Buat function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION purchase_invoice()
      RETURNS VARCHAR AS $$
      DECLARE
          today TEXT := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
          prefix TEXT := 'INV-' || today || '-';
          last_invoice TEXT;
          last_date TEXT;
          seq_val INT;
      BEGIN
          SELECT invoice INTO last_invoice
          FROM public."Purchases"
          WHERE invoice LIKE 'INV-%'
          ORDER BY invoice DESC
          LIMIT 1;

          IF last_invoice IS NOT NULL THEN
              last_date := SUBSTRING(last_invoice FROM 5 FOR 8);

              IF last_date <> today THEN
                  PERFORM setval('purchase_invoice_seq', 1, false);
              END IF;
          ELSE
              PERFORM setval('purchase_invoice_seq', 1, false);
          END IF;

          seq_val := nextval('purchase_invoice_seq');
          RETURN prefix || LPAD(seq_val::TEXT, 3, '0');
      END;
      $$ LANGUAGE plpgsql;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS purchase_invoice();
    `);
    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS purchase_invoice_seq;
    `);
  }
};
