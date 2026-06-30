const db = require('../config/db');

const Bill = {
  // Get all bills with customer details, ordered by date descending
  getAll: async () => {
    const queryText = `
      SELECT b.*, c.name AS customer_name, c.phone AS customer_phone
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
    `;
    const result = await db.query(queryText);
    return result.rows;
  },

  // Get a bill by ID, including customer information
  findById: async (id) => {
    const queryText = `
      SELECT b.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email, c.address AS customer_address
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.id = $1
    `;
    const result = await db.query(queryText, [id]);
    return result.rows[0];
  },

  // Get all items associated with a bill, including product name
  getItemsByBillId: async (billId) => {
    const queryText = `
      SELECT bi.*, p.name AS product_name 
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.id
      WHERE bi.bill_id = $1
      ORDER BY bi.id ASC
    `;
    const result = await db.query(queryText, [billId]);
    return result.rows;
  },

  // Create a bill record (supports transaction client parameter)
  create: async (customer_id, total_amount, discount, client = db) => {
    const queryText = `
      INSERT INTO bills (customer_id, total_amount, discount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await client.query(queryText, [customer_id, total_amount, discount || 0.00]);
    return result.rows[0];
  },

  // Create a bill item record (supports transaction client parameter)
  createItem: async (bill_id, product_id, quantity, price, client = db) => {
    const queryText = `
      INSERT INTO bill_items (bill_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await client.query(queryText, [bill_id, product_id, quantity, price]);
    return result.rows[0];
  }
};

module.exports = Bill;
