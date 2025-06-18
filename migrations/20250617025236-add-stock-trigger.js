'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_stock_on_purchaseitem()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE "Goods"
          SET stock = stock + NEW.quantity
          WHERE barcode = NEW.itemcode;

        ELSIF TG_OP = 'DELETE' THEN
          UPDATE "Goods"
          SET stock = stock - OLD.quantity
          WHERE barcode = OLD.itemcode;
        END IF;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_add_stock_after_insert
      AFTER INSERT ON "PurchaseItems"
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_purchaseitem();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_subtract_stock_after_delete
      AFTER DELETE ON "PurchaseItems"
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_purchaseitem();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_add_stock_after_insert ON "PurchaseItems";`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_subtract_stock_after_delete ON "PurchaseItems";`);
    await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS update_stock_on_purchaseitem();`);
  }
};
