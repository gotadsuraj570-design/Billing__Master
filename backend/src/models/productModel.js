const db = require('../config/db');

const Product = {
  // Get all products, joining with categories to display the category name
  getAll: async () => {
    const queryText = `
      SELECT p.*, c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `;
    const result = await db.query(queryText);
    return result.rows;
  },

  // Find a specific product by ID
  findById: async (id) => {
    const queryText = `
      SELECT p.*, c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await db.query(queryText, [id]);
    return result.rows[0];
  },

  // Create a new product
  create: async (category_id, name, description, purchase_price, selling_price, quantity) => {
    const queryText = `
      INSERT INTO products (category_id, name, description, purchase_price, selling_price, quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(queryText, [
      category_id || null,
      name,
      description || '',
      purchase_price,
      selling_price,
      quantity || 0
    ]);
    return result.rows[0];
  },

  // Update product details
  update: async (id, category_id, name, description, purchase_price, selling_price, quantity) => {
    const queryText = `
      UPDATE products 
      SET category_id = $1, name = $2, description = $3, purchase_price = $4, selling_price = $5, quantity = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await db.query(queryText, [
      category_id || null,
      name,
      description || '',
      purchase_price,
      selling_price,
      quantity,
      id
    ]);
    return result.rows[0];
  },

  // Delete product
  delete: async (id) => {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Update quantity (used inside a billing transaction to decrease stock)
  // Client parameter allows executing within an existing transaction pool client
  updateStock: async (id, quantityChange, client = db) => {
    const queryText = `
      UPDATE products 
      SET quantity = quantity + $1 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await client.query(queryText, [quantityChange, id]);
    return result.rows[0];
  }
};

module.exports = Product;
