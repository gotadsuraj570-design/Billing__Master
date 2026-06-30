import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import DeleteModal from '../components/DeleteModal';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  Search,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
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

  // Fields states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customers.');
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
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setModalMode('edit');
    setCurrentId(customer.id);
    setName(customer.name);
    setPhone(customer.phone || '');
    setEmail(customer.email || '');
    setAddress(customer.address || '');
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

    // Validations
    if (!name.trim()) return setFormError('Customer name is required.');
    
    // Optional Email Validation
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return setFormError('Please enter a valid email address.');
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim()
    };

    try {
      if (modalMode === 'add') {
        const response = await api.post('/api/customers', payload);
        setCustomers((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
        showNotification('success', 'Customer added successfully!');
      } else {
        const response = await api.put(`/api/customers/${currentId}`, payload);
        setCustomers((prev) => 
          prev.map((c) => (c.id === currentId ? response.data : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        showNotification('success', 'Customer updated successfully!');
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Something went wrong saving user info.';
      setFormError(msg);
    }
  };

  const handleOpenDelete = (customer) => {
    setDeleteTarget(customer);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/customers/${deleteTarget.id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showNotification('success', 'Customer deleted successfully!');
    } catch (err) {
      console.error(err);
      showNotification('error', err.response?.data?.message || 'Failed to delete customer.');
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Client Search Filtration
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query))
    );
  });

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-650 focus:ring-3 focus:ring-indigo-650/10 outline-none text-sm transition-all"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Customer</span>
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

      {/* Customers Table wrapper */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-16 h-16 mb-4 text-slate-350" />
            <p className="text-lg font-semibold">No Customers Found</p>
            <p className="text-sm text-slate-400">Modify your search query or click "Add Customer" to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm text-slate-650">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{customer.name}</div>
                      <div className="text-xs text-slate-450 mt-0.5">ID: #{customer.id}</div>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                      {!customer.phone && !customer.email && (
                        <span className="text-xs text-slate-400 italic">No contact added</span>
                      )}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      {customer.address ? (
                        <div className="flex items-start gap-1 text-xs text-slate-600 line-clamp-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span>{customer.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 italic">No address</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          title="Edit"
                          className="p-1.5 text-slate-450 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(customer)}
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150">
              <h3 className="text-lg font-bold text-slate-850">
                {modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}
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
                
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 focus:ring-3 focus:ring-indigo-600/10 outline-none text-sm font-medium"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 9876543210"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., jane.doe@example.com"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Billing Address
                  </label>
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, New Delhi"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
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
                  {modalMode === 'add' ? 'Create Customer' : 'Save Changes'}
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
        title="Delete Customer"
      />
    </div>
  );
};

export default Customers;
