import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { ArrowLeft, Printer, FileText, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const InvoiceDetails = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/bills/${id}`);
        setBill(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve invoice details.');
      } {
        setLoading(false);
      }
    };
    fetchBillDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSubtotal = () => {
    if (!bill || !bill.items) return 0;
    return bill.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-6 text-center text-rose-600 space-y-4">
        <div className="text-lg font-bold">Error Loading Invoice</div>
        <p className="text-sm">{error || 'Invoice not found.'}</p>
        <Link to="/invoices" className="inline-flex items-center gap-2 text-sm text-indigo-650 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = parseFloat(bill.discount) || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation and Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoice History</span>
        </Link>
      </div>

      {/* Invoice Layout Card */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-xs overflow-hidden">
        {/* Invoice Header Banner */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-black tracking-wider uppercase">Retail Invoice</span>
            </div>
            <p className="text-xs text-slate-400">Invoice Ref: #{String(bill.id).padStart(5, '0')}</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
              PAID
            </span>
            <p className="text-xs text-slate-400 flex items-center sm:justify-end gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(bill.created_at)}
            </p>
          </div>
        </div>

        {/* Customer & Merchant Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-slate-100 bg-slate-50/50">
          {/* Merchant Info */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issued By</p>
            <div className="font-extrabold text-slate-800 text-base">BillingMaster Store</div>
            <div className="text-xs text-slate-500 space-y-1">
              <p>101, Commercial Center Complex</p>
              <p>New Delhi, India, 110001</p>
              <p>Email: support@billingmaster.com</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed To</p>
            <div className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              {bill.customer_name}
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              {bill.customer_phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-450" />
                  {bill.customer_phone}
                </p>
              )}
              {bill.customer_email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-455" />
                  {bill.customer_email}
                </p>
              )}
              {bill.customer_address && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-455 mt-0.5 flex-shrink-0" />
                  <span>{bill.customer_address}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-450 uppercase tracking-wider pb-3">
                <th className="pb-3 pl-1">Product Description</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-center w-24">Qty</th>
                <th className="pb-3 text-right pr-1">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
              {bill.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/25">
                  <td className="py-4 pl-1 font-bold text-slate-800">{item.product_name || 'Deleted Product'}</td>
                  <td className="py-4 text-right">₹{Number(item.price).toFixed(2)}</td>
                  <td className="py-4 text-center font-semibold text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right pr-1 font-bold text-slate-800">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-end border-t border-slate-100 p-6 bg-slate-50/30">
          <div className="w-full sm:w-80 space-y-3.5 text-sm text-slate-600">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between font-medium text-slate-500">
                <span>Discount Applied</span>
                <span className="font-bold text-rose-600">-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <hr className="border-slate-200/60" />

            <div className="flex justify-between items-center text-slate-800">
              <span className="font-extrabold text-base">Grand Total</span>
              <span className="text-xl font-black text-indigo-700 tracking-tight">
                ₹{Number(bill.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
