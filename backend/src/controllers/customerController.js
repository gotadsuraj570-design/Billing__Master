const Customer = require('../models/customerModel');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCustomer = async (req, res) => {
  const { name, phone, email, address } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Customer name is required.' });
  }

  try {
    const newCustomer = await Customer.create(
      name.trim(),
      phone,
      email,
      address
    );
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Customer name is required.' });
  }

  try {
    const updatedCustomer = await Customer.update(
      id,
      name.trim(),
      phone,
      email,
      address
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.json(updatedCustomer);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCustomer = await Customer.delete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.json({ message: 'Customer deleted successfully', customer: deletedCustomer });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
