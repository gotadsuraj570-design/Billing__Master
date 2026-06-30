const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // Run dashboard aggregate queries concurrently using Promise.all
    const [
      productsCount,
      categoriesCount,
      customersCount,
      billsCount,
      revenueSum,
      lowStockProducts
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM products'),
      db.query('SELECT COUNT(*) FROM categories'),
      db.query('SELECT COUNT(*) FROM customers'),
      db.query('SELECT COUNT(*) FROM bills'),
      db.query('SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bills'),
      db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.quantity < 5 ORDER BY p.quantity ASC')
    ]);

    res.json({
      totalProducts: parseInt(productsCount.rows[0].count, 10),
      totalCategories: parseInt(categoriesCount.rows[0].count, 10),
      totalCustomers: parseInt(customersCount.rows[0].count, 10),
      totalBills: parseInt(billsCount.rows[0].count, 10),
      totalRevenue: parseFloat(revenueSum.rows[0].total_revenue),
      lowStockProducts: lowStockProducts.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
