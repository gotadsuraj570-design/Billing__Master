const Product = require('../models/productModel');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createProduct = async (req, res) => {
  const { category_id, name, description, purchase_price, selling_price, quantity } = req.body;

  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Product name is required.' });
  }
  if (purchase_price === undefined || purchase_price < 0) {
    return res.status(400).json({ message: 'Purchase price must be a non-negative number.' });
  }
  if (selling_price === undefined || selling_price < 0) {
    return res.status(400).json({ message: 'Selling price must be a non-negative number.' });
  }
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
  }

  try {
    const newProduct = await Product.create(
      category_id,
      name.trim(),
      description,
      purchase_price,
      selling_price,
      quantity
    );
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, purchase_price, selling_price, quantity } = req.body;

  // Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Product name is required.' });
  }
  if (purchase_price === undefined || purchase_price < 0) {
    return res.status(400).json({ message: 'Purchase price must be a non-negative number.' });
  }
  if (selling_price === undefined || selling_price < 0) {
    return res.status(400).json({ message: 'Selling price must be a non-negative number.' });
  }
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
  }

  try {
    const updatedProduct = await Product.update(
      id,
      category_id,
      name.trim(),
      description,
      purchase_price,
      selling_price,
      quantity
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.delete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
