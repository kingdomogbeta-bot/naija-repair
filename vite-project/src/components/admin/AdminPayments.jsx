import { useState, useEffect } from 'react';
import { getAllPaymentsAdmin, getAdminEarnings, getAllSettings, migrateHistoricPayments } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminPayments() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [adminEarnings, setAdminEarnings] = useState({ totalCommission: 0, totalTransactions: 0 });
  const [commissionRate, setCommissionRate] = useState(15);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        const [paymentsRes, earningsRes, settingsRes] = await Promise.all([
          getAllPaymentsAdmin(token),
          getAdminEarnings(token),
          getAllSettings()
        ]);
        setPayments(paymentsRes.data || []);
        setAdminEarnings(earningsRes.data || { totalCommission: 0, totalTransactions: 0 });
        if (settingsRes.data?.commissionRate) setCommissionRate(settingsRes.data.commissionRate);
      } catch (e) {
        console.error('Failed to load payments:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMigrate = async () => {
    if (!window.confirm('This will process all past successful payments and credit tasker wallets + admin earnings for any unprocessed ones. Continue?')) return;
    setMigrating(true);
    setMigrateResult(null);
    try {
      const res = await migrateHistoricPayments(getToken());
      setMigrateResult(res);
      const earningsRes = await getAdminEarnings(getToken());
      setAdminEarnings(earningsRes.data || { totalCommission: 0, totalTransactions: 0 });
    } catch (e) {
      setMigrateResult({ error: e.message });
    } finally {
      setMigrating(false);
    }
  };

  const rate = commissionRate / 100;
  const successful = payments.filter(p => p.status === 'success');
  const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTaskerPayout = successful.reduce((sum, p) => sum + Math.round((p.amount || 0) * (1 - rate)), 0);
  const pending = payments.filter(p => p.status === 'pending');
  const failed = payments.filter(p => p.status === 'failed');

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payments</h2>
          <p className="text-gray-600">All transactions — commission rate: <span className="font-semibold text-teal-600">{commissionRate}%</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg font-semibold text-sm"
          >
            {migrating ? 'Processing...' : '⚡ Process Past Payments'}
          </button>
          {migrateResult && (
            migrateResult.error
              ? <p className="text-xs text-red-600">{migrateResult.error}</p>
              : <p className="text-xs text-green-600">✓ {migrateResult.processed} processed, {migrateResult.skipped} already done</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900 mt-1">₦{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-teal-50 rounded-xl shadow-md p-5 border border-teal-200">
          <p className="text-teal-600 text-sm font-medium">Admin Commission</p>
          <p className="text-xl font-bold text-teal-700 mt-1">₦{adminEarnings.totalCommission.toLocaleString()}</p>
          <p className="text-xs text-teal-500 mt-1">{adminEarnings.totalTransactions} transactions</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Tasker Payouts</p>
          <p className="text-xl font-bold text-gray-900 mt-1">₦{totalTaskerPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-gray-500 text-sm">Failed</p>
          <p className="text-xl font-bold text-red-600 mt-1">{failed.length}</p>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Reference</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-3 font-semibold text-teal-700">Admin ({commissionRate}%)</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Tasker Gets</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const commission = Math.round((p.amount || 0) * rate);
                  const taskerAmt = (p.amount || 0) - commission;
                  return (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{p.reference}</td>
                      <td className="py-3 px-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-gray-900">{p.metadata?.userName || p.metadata?.userEmail || p.userId}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900">₦{(p.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-teal-700">
                        {p.status === 'success' ? `₦${commission.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700">
                        {p.status === 'success' ? `₦${taskerAmt.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === 'success' ? 'bg-green-100 text-green-700' :
                          p.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
