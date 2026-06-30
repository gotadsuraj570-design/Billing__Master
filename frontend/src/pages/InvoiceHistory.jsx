import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { History, Search, Eye, Calendar, User, FileText } from 'lucide-react';

const InvoiceHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bills');
      setBills(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invoice history.');
    } finally {
      setLoading(false);
    }
  };

  // Search by customer name, customer phone, or bill ID
  const filteredBills = bills.filter((bill) => {
    const query = searchQuery.toLowerCase();
    return (
      bill.customer_name.toLowerCase().includes(query) ||
      (bill.customer_phone && bill.customer_phone.includes(query)) ||
      bill.id.toString().includes(query)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && bills.length === 0) {
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
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer or bill ID..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-650 focus:ring-3 focus:ring-indigo-650/10 outline-none text-sm transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm font-semibold text-rose-800 bg-rose-50 border border-rose-100 rounded-xl">
          {error}
        </div>
      )}

      {/* Invoice Records Grid */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <History className="w-16 h-16 mb-4 text-slate-350" />
            <p className="text-lg font-semibold">No Invoices Found</p>
            <p className="text-sm text-slate-400">Create bills from the "New Bill" page first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-150 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Bill No</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-sm text-slate-650">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      #{String(bill.id).padStart(5, '0')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{bill.customer_name}</div>
                      {bill.customer_phone && (
                        <div className="text-xs text-slate-400 mt-0.5">{bill.customer_phone}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {formatDate(bill.created_at)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {Number(bill.discount) > 0 ? `₹${Number(bill.discount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      ₹{Number(bill.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/invoices/${bill.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-indigo-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceHistory;
