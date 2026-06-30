import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import Spinner from '../components/Spinner';
import { 
  Boxes, 
  Tags, 
  Users, 
  ReceiptText, 
  IndianRupee, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Could not retrieve dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-rose-600">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Error Loading Data</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-slate-400 text-sm">Here is a quick overview of your business performance today.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Boxes} 
          color="indigo" 
        />
        <StatsCard 
          title="Categories" 
          value={stats.totalCategories} 
          icon={Tags} 
          color="blue" 
        />
        <StatsCard 
          title="Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          color="orange" 
        />
        <StatsCard 
          title="Total Bills" 
          value={stats.totalBills} 
          icon={ReceiptText} 
          color="green" 
        />
        <StatsCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={IndianRupee} 
          color="green" 
        />
      </div>

      {/* Low Stock Warning Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white border border-slate-150 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">Low Stock Alert</h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-100">
              Threshold &lt; 5
            </span>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Boxes className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-semibold">All products have sufficient stock!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 text-right pr-1">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-1 font-semibold text-slate-700">{product.name}</td>
                      <td className="py-3.5 text-slate-500">{product.category_name || 'N/A'}</td>
                      <td className="py-3.5 text-slate-650 font-medium">₹{Number(product.selling_price).toFixed(2)}</td>
                      <td className="py-3.5 text-right pr-1 font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.quantity === 0 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {product.quantity} units
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Navigate quickly to common actions like invoicing, adding items, and checking history.
            </p>
          </div>
          
          <div className="mt-6 space-y-2.5">
            <Link 
              to="/billing" 
              className="flex items-center justify-between w-full p-4 bg-indigo-650 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-md hover:scale-101 transition-all"
            >
              <span>Generate New Bill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/products" 
              className="flex items-center justify-between w-full p-4 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
            >
              <span>Manage Products</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              to="/invoices" 
              className="flex items-center justify-between w-full p-4 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
            >
              <span>Invoice Records</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
