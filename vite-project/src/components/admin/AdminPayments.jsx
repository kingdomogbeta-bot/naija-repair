import { useState, useEffect } from 'react';
import { getAllPaymentsAdmin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminPayments() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllPaymentsAdmin(getToken());
        setPayments(res.data || []);
      } catch (e) {
        console.error('Failed to load payments:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalRevenue = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.amount || 0), 0);
  const successful = payments.filter(p => p.status === 'success');
  const pending = payments.filter(p => p.status === 'pending');
  const failed = payments.filter(p => p.status === 'failed');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Payments</h2>
        <p className="text-gray-600">All payment transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Successful</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{successful.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{failed.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Transactions</h3>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No payments found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{p.reference}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {p.metadata?.userName || p.metadata?.userEmail || p.userId}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      ₦{(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === 'success' ? 'bg-green-100 text-green-700' :
                        p.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
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
}
