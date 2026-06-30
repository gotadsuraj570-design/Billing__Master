const db = require('../config/db');

const Customer = {
  // Get all customers
  getAll: async () => {
    const result = await db.query('SELECT * FROM customers ORDER BY name ASC');
    return result.rows;
  },

  // Find a specific customer by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create a new customer record
  create: async (name, phone, email, address) => {
    const queryText = `
      INSERT INTO customers (name, phone, email, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(queryText, [
      name,
      phone || '',
      email || '',
      address || ''
    ]);
    return result.rows[0];
  },

  // Update customer details
  update: async (id, name, phone, email, address) => {
    const queryText = `
      UPDATE customers 
      SET name = $1, phone = $2, email = $3, address = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await db.query(queryText, [
      name,
      phone || '',
      email || '',
      address || '',
      id
    ]);
    return result.rows[0];
  },

  // Delete customer record
  delete: async (id) => {
    const result = await db.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Customer;
