'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_totalsum_on_purchaseitems()
      RETURNS TRIGGER AS $$
      DECLARE
        currentinvoice TEXT;
        summary NUMERIC;
      BEGIN
        IF TG_OP = 'INSERT' THEN
          currentinvoice := NEW.invoice;
        ELSIF TG_OP = 'UPDATE' THEN
          currentinvoice := COALESCE(NEW.invoice, OLD.invoice);
        ELSIF TG_OP = 'DELETE' THEN
          currentinvoice := OLD.invoice;
        END IF;

        SELECT SUM(totalprice)
        INTO summary
        FROM "PurchaseItems"
        WHERE invoice = currentinvoice;

        UPDATE "Purchases"
        SET totalsum = COALESCE(summary, 0)
        WHERE invoice = currentinvoice;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_update_totalsum
      AFTER INSERT OR UPDATE OR DELETE ON "PurchaseItems"
      FOR EACH ROW
      EXECUTE FUNCTION update_totalsum_on_purchaseitems();
    `);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_update_totalsum ON "PurchaseItems";`);
    await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS update_totalsum_on_purchaseitems();`);

  }
};
