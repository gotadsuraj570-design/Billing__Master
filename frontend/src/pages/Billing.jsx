import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { 
  ReceiptText, 
  User, 
  Boxes, 
  Plus, 
  Trash2, 
  Percent, 
  IndianRupee, 
  AlertCircle,
  TrendingDown
} from 'lucide-react';

const Billing = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Billing Header
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('0');

  // Currently selecting item fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemError, setItemError] = useState('');

  // Invoiced items array: list of { product_id, name, price, quantity, maxQuantity }
  const [billItems, setBillItems] = useState([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [custRes, prodRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/products')
      ]);
      setCustomers(custRes.data);
      // Filter out products that have 0 stock to make selection easier
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customers or products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setItemError('');

    if (!selectedProductId) {
      setItemError('Please select a product.');
      return;
    }

    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setItemError('Quantity must be greater than zero.');
      return;
    }

    // Find product details
    const productObj = products.find((p) => p.id === parseInt(selectedProductId, 10));
    if (!productObj) {
      setItemError('Product not found.');
      return;
    }

    // Verify stock availability
    const alreadyAddedQty = billItems
      .filter((item) => item.product_id === productObj.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalRequestedQty = qty + alreadyAddedQty;

    if (productObj.quantity < totalRequestedQty) {
      setItemError(`Insufficient stock! Available: ${productObj.quantity}, Already added: ${alreadyAddedQty}`);
      return;
    }

    // Add to bill items
    const existingIndex = billItems.findIndex((item) => item.product_id === productObj.id);
    if (existingIndex > -1) {
      // Update quantity
      const updated = [...billItems];
      updated[existingIndex].quantity += qty;
      setBillItems(updated);
    } else {
      // Add new row
      setBillItems((prev) => [
        ...prev,
        {
          product_id: productObj.id,
          name: productObj.name,
          price: parseFloat(productObj.selling_price),
          quantity: qty,
          maxQuantity: productObj.quantity
        }
      ]);
    }

    // Reset selectors
    setSelectedProductId('');
    setItemQuantity('1');
  };

  const handleRemoveItem = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index, value) => {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty <= 0) return;

    const updated = [...billItems];
    const maxQty = updated[index].maxQuantity;

    if (qty > maxQty) {
      alert(`Cannot exceed available stock of ${maxQty} units.`);
      updated[index].quantity = maxQty;
    } else {
      updated[index].quantity = qty;
    }
    setBillItems(updated);
  };

  // Calculations
  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const parsedDiscount = parseFloat(discount) || 0;
  const finalAmount = Math.max(0, subtotal - parsedDiscount);

  const handleSaveBill = async () => {
    setError('');
    setSuccess('');

    if (!customerId) {
      setError('Please select a customer for this invoice.');
      return;
    }

    if (billItems.length === 0) {
      setError('Invoice must contain at least one item.');
      return;
    }

    if (parsedDiscount < 0) {
      setError('Discount amount cannot be negative.');
      return;
    }

    const payload = {
      customer_id: parseInt(customerId, 10),
      discount: parsedDiscount,
      items: billItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    setSaving(true);
    try {
      const response = await api.post('/api/bills', payload);
      setSuccess('Invoice saved successfully!');
      
      // Redirect to invoice details after brief delay
      setTimeout(() => {
        navigate(`/invoices/${response.data.billId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit billing transaction.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Invoice compiler */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer & Items compiler */}
        <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-indigo-650" />
            <h3 className="text-lg font-bold text-slate-800">Invoice Header</h3>
          </div>

          <div className="space-y-4">
            {/* Select Customer */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
                required
              >
                <option value="" disabled>Choose a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Compile Items */}
        <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Boxes className="w-5 h-5 text-indigo-650" />
            <h3 className="text-lg font-bold text-slate-800">Add Products to Invoice</h3>
          </div>

          {itemError && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{itemError}</span>
            </div>
          )}

          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setItemError('');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
              >
                <option value="" disabled>Choose product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                    {p.name} (Price: ₹{Number(p.selling_price).toFixed(2)}) {p.quantity <= 0 ? '[OUT OF STOCK]' : `[In Stock: ${p.quantity}]`}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-32 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors cursor-pointer w-full sm:w-auto h-[42px]"
            >
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Invoice Items Grid */}
        <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Invoice Items</h3>

          {billItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ReceiptText className="w-12 h-12 mb-3 text-slate-350" />
              <p className="text-sm font-semibold">No items added to invoice yet</p>
              <p className="text-xs">Add products above to compile the bill.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Product</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 w-28">Quantity</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3 text-right pr-1">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-650">
                  {billItems.map((item, index) => (
                    <tr key={item.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-1 font-bold text-slate-800">{item.name}</td>
                      <td className="py-4">₹{item.price.toFixed(2)}</td>
                      <td className="py-4">
                        <input
                          type="number"
                          min="1"
                          max={item.maxQuantity}
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center font-medium bg-slate-50 text-slate-800"
                        />
                      </td>
                      <td className="py-4 font-semibold text-slate-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-4 text-right pr-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Invoice summary */}
      <div className="space-y-6">
        <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Bill Summary</h3>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
              {success}
            </div>
          )}

          {/* Pricing figures */}
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount Form Input */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <Percent className="w-3.5 h-3.5" /> Apply Discount (₹)
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-sm font-bold text-slate-800"
              />
            </div>

            <hr className="border-slate-100 my-4" />

            <div className="flex justify-between items-center text-slate-800">
              <span className="font-bold text-base">Net Payable</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{finalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleSaveBill}
            disabled={saving || billItems.length === 0}
            className="flex items-center justify-center w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold shadow-md shadow-indigo-650/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                <span>Processing...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Save & Generate Bill
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
