const Category = require('../models/categoryModel');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const newCategory = await Category.create(name.trim());
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error creating category:', err);
    if (err.code === '23505') { // Unique constraint violation code in Postgres
      return res.status(400).json({ message: 'Category name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const updatedCategory = await Category.update(id, name.trim());
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json(updatedCategory);
  } catch (err) {
    console.error('Error updating category:', err);
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Category name already exists.' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.delete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.json({ message: 'Category deleted successfully', category: deletedCategory });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
