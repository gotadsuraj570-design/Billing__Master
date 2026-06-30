const db = require('../config/db');

const Category = {
  // Get all categories ordered alphabetically
  getAll: async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  },

  // Find a category by ID
  findById: async (id) => {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create a new category
  create: async (name) => {
    const result = await db.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  },

  // Update a category name
  update: async (id, name) => {
    const result = await db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  },

  // Delete a category
  delete: async (id) => {
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Category;
