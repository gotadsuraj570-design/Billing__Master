import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import DeleteModal from '../components/DeleteModal';
import { Tags, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [formError, setFormError] = useState('');

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories.');
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
    setCategoryName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setModalMode('edit');
    setCurrentId(category.id);
    setCategoryName(category.name);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoryName('');
    setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!categoryName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      if (modalMode === 'add') {
        const response = await api.post('/api/categories', { name: categoryName.trim() });
        setCategories((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
        showNotification('success', 'Category added successfully!');
      } else {
        const response = await api.put(`/api/categories/${currentId}`, { name: categoryName.trim() });
        setCategories((prev) => 
          prev.map((cat) => (cat.id === currentId ? response.data : cat)).sort((a, b) => a.name.localeCompare(b.name))
        );
        showNotification('success', 'Category updated successfully!');
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Something went wrong.';
      setFormError(msg);
    }
  };

  const handleOpenDelete = (category) => {
    setDeleteTarget(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== deleteTarget.id));
      showNotification('success', 'Category deleted successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">Create and manage your product categories</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
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

      {/* Categories Content */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Tags className="w-16 h-16 mb-4 text-slate-350" />
            <p className="text-lg font-semibold">No Categories Available</p>
            <p className="text-sm text-slate-400">Click "Add Category" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm text-slate-650">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-450">#{category.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{category.name}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          title="Edit"
                          className="p-1.5 text-slate-450 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(category)}
                          title="Delete"
                          className="p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-850">
                {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Electronics, Beverages"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 focus:ring-3 focus:ring-indigo-600/10 outline-none transition-all text-slate-850 font-medium"
                    autoFocus
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
                  {modalMode === 'add' ? 'Create' : 'Save Changes'}
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
        title="Delete Category"
      />
    </div>
  );
};

export default Categories;
