import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserWallet } from '../services/api';
import { Wallet, RefreshCw } from 'lucide-react';

export default function UserWallet() {
  const { user, getToken } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await getUserWallet(token, user.email);
      setWallet(res.data);
      setTransactions(res.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <button onClick={load} className="p-2 text-gray-500 hover:text-teal-600 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Wallet className="w-5 h-5" />
                <span className="text-sm">Refund Balance</span>
              </div>
              <p className="text-4xl font-bold mb-1">₦{(wallet?.balance || 0).toLocaleString()}</p>
              <p className="text-teal-100 text-sm">Total refunds received: ₦{(wallet?.totalRefunds || 0).toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Refund History</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No refunds yet.</p>
                  <p className="text-sm mt-1">Approved refunds from reports will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-green-600 text-sm">+₦{tx.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
