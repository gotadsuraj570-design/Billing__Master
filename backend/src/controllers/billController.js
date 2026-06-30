const { pool } = require('../config/db');
const Bill = require('../models/billModel');
const Product = require('../models/productModel');

// Fetch all bills with customer name
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.getAll();
    res.json(bills);
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch specific bill header and details (products sold)
exports.getBillById = async (req, res) => {
  const { id } = req.params;

  try {
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    const items = await Bill.getItemsByBillId(id);
    res.json({
      ...bill,
      items
    });
  } catch (err) {
    console.error('Error fetching bill details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new bill (Transaction-based stock adjustment)
exports.createBill = async (req, res) => {
  const { customer_id, items, discount } = req.body;

  // Validation
  if (!customer_id) {
    return res.status(400).json({ message: 'Customer selection is required.' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'At least one product item is required.' });
  }

  // Verify all items have valid inputs
  for (const item of items) {
    if (!item.product_id) {
      return res.status(400).json({ message: 'Invalid product selected.' });
    }
    if (!item.quantity || item.quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }
    if (item.price === undefined || item.price < 0) {
      return res.status(400).json({ message: 'Product price is invalid.' });
    }
  }

  const client = await pool.connect();

  try {
    // 1. Begin transaction
    await client.query('BEGIN');

    let totalAmountBeforeDiscount = 0;

    // 2. Validate product availability and quantities first
    for (const item of items) {
      // Fetch product current info using the active transaction client
      const productQuery = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      const product = productQuery.rows[0];

      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found.`);
      }

      if (product.quantity < item.quantity) {
        // Not enough stock
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
      }

      totalAmountBeforeDiscount += Number(product.selling_price) * item.quantity;
    }

    // Calculate final billing amount
    const parsedDiscount = Number(discount) || 0;
    const finalAmount = Math.max(0, totalAmountBeforeDiscount - parsedDiscount);

    // 3. Create the Bill Header record
    const newBill = await Bill.create(customer_id, finalAmount, parsedDiscount, client);
    const billId = newBill.id;

    // 4. Create Bill Items and Decrement Product Stock
    for (const item of items) {
      // Get selling price from DB to ensure billing integrity
      const productQuery = await client.query('SELECT selling_price FROM products WHERE id = $1', [item.product_id]);
      const price = productQuery.rows[0].selling_price;

      // Add to Bill Items table
      await Bill.createItem(billId, item.product_id, item.quantity, price, client);

      // Decrement stock: quantityChange is negative
      await Product.updateStock(item.product_id, -item.quantity, client);
    }

    // 5. Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Bill generated and stock updated successfully',
      billId
    });
  } catch (err) {
    // Rollback transaction in case of any database errors or stock checks failing
    await client.query('ROLLBACK');
    console.error('Error creating bill (rolled back):', err.message);
    res.status(400).json({ message: err.message || 'Error processing bill transaction.' });
  } finally {
    // Release pool client
    client.release();
  }
};
