const db = require('../config/db');

const User = {
  // Find a user by email (used during login)
  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Find a user by ID (used for retrieving profile)
  findById: async (id) => {
    const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Update user profile details
  update: async (id, name, password) => {
    if (password) {
      const result = await db.query(
        'UPDATE users SET name = $1, password = $2 WHERE id = $3 RETURNING id, name, email',
        [name, password, id]
      );
      return result.rows[0];
    } else {
      const result = await db.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
        [name, id]
      );
      return result.rows[0];
    }
  },

  // Create a new user (used during registration/signup)
  create: async (name, email, hashedPassword) => {
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }
};

module.exports = User;
