import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import DeleteModal from '../components/DeleteModal';
import { 
  Boxes, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  Search, 
  AlertTriangle 
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [formError, setFormError] = useState('');

  // Individual field states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setCurrentId(product.id);
    setName(product.name);
    setCategoryId(product.category_id || '');
    setDescription(product.description || '');
    setPurchasePrice(product.purchase_price);
    setSellingPrice(product.selling_price);
    setQuantity(product.quantity);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Input Validation
    if (!name.trim()) return setFormError('Product name is required.');
    if (!categoryId) return setFormError('Please select a category.');
    if (purchasePrice === '' || Number(purchasePrice) < 0) return setFormError('Please enter a valid purchase price.');
    if (sellingPrice === '' || Number(sellingPrice) < 0) return setFormError('Please enter a valid selling price.');
    if (quantity === '' || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
      return setFormError('Quantity must be a positive whole number.');
    }

    const payload = {
      name: name.trim(),
      category_id: parseInt(categoryId, 10),
      description: description.trim(),
      purchase_price: parseFloat(purchasePrice),
      selling_price: parseFloat(sellingPrice),
      quantity: parseInt(quantity, 10)
    };

    try {
      if (modalMode === 'add') {
        await api.post('/api/products', payload);
        showNotification('success', 'Product added successfully!');
      } else {
        await api.put(`/api/products/${currentId}`, payload);
        showNotification('success', 'Product updated successfully!');
      }
      handleCloseModal();
      // Reload products list to fetch correct joins
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Something went wrong saving the product.';
      setFormError(msg);
    }
  };

  const handleOpenDelete = (product) => {
    setDeleteTarget(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showNotification('success', 'Product deleted successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Client-side filtration
  const filteredProducts = products.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      (p.description && p.description.toLowerCase().includes(searchLower)) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchLower))
    );
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-650 focus:ring-3 focus:ring-indigo-650/10 outline-none text-sm transition-all"
          />
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 text-sm font-semibold text-rose-800 bg-rose-50 border border-rose-100 rounded-xl">
          {error}
        </div>
      )}

      {/* Products Table Wrapper */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Boxes className="w-16 h-16 mb-4 text-slate-350" />
            <p className="text-lg font-semibold">No Products Found</p>
            <p className="text-sm text-slate-400">Try modifying your search or click "Add Product".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Purchase Price</th>
                  <th className="py-4 px-6">Selling Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm text-slate-650">
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity < 5;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{product.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md">
                          {product.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium">₹{Number(product.purchase_price).toFixed(2)}</td>
                      <td className="py-4 px-6 font-bold text-slate-855">₹{Number(product.selling_price).toFixed(2)}</td>
                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            product.quantity === 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : isLowStock 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {product.quantity} units
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-amber-500" title="Low Stock Warning" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            title="Edit"
                            className="p-1.5 text-slate-450 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(product)}
                            title="Delete"
                            className="p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-850">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Wireless Mouse"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 focus:ring-3 focus:ring-indigo-600/10 outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 outline-none text-sm font-medium"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Prices Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Purchase Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 outline-none text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Initial Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 outline-none text-sm font-medium"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add optional notes or technical specs..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-150">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-650 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-750 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name}
        title="Delete Product"
      />
    </div>
  );
};

export default Products;
