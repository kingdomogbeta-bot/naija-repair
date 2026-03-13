import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingUp, ArrowDownCircle } from 'lucide-react';

export default function TaskerWallet() {
  const { user, getToken } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/wallet/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setWallet(data.data);

      const txResponse = await fetch(`http://localhost:5000/api/wallet/${user.email}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txData = await txResponse.json();
      if (txData.success) setTransactions(txData.data);

      const wdResponse = await fetch(`http://localhost:5000/api/wallet/${user.email}/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wdData = await wdResponse.json();
      if (wdData.success) setWithdrawals(wdData.data);
    } catch (err) {
      console.error('Fetch wallet error:', err);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch('http://localhost:5000/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskerEmail: user.email,
          amount: parseFloat(withdrawAmount),
          bankName,
          accountNumber,
          accountName
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setBankName('');
        setAccountNumber('');
        setAccountName('');
        fetchWalletData();
      } else {
        setError(data.error || 'Withdrawal request failed');
      }
    } catch (err) {
      setError(err.message || 'Withdrawal request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">My Wallet</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">₦{wallet?.balance?.toLocaleString() || '0'}</p>
            <button onClick={() => setShowWithdrawModal(true)} className="mt-4 bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 text-sm sm:text-base">Withdraw</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Total Earnings</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">₦{wallet?.totalEarnings?.toLocaleString() || '0'}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Withdrawals</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">₦{wallet?.totalWithdrawals?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Recent Transactions</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map(tx => (
                <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-bold text-sm whitespace-nowrap ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-gray-500 text-center py-8 text-sm">No transactions yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Withdrawal Requests</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {withdrawals.slice(0, 10).map(wd => (
                <div key={wd._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-semibold text-sm">₦{wd.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 truncate">{wd.bankName} - {wd.accountNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      wd.status === 'completed' ? 'bg-green-100 text-green-700' :
                      wd.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      wd.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{wd.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(wd.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {withdrawals.length === 0 && <p className="text-gray-500 text-center py-8 text-sm">No withdrawal requests</p>}
            </div>
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Request Withdrawal</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Available: ₦{wallet?.balance?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setShowWithdrawModal(false)} className="flex-1 border-2 border-gray-200 py-3 rounded-lg font-semibold hover:border-gray-300 text-sm sm:text-base">Cancel</button>
              <button onClick={handleWithdraw} disabled={loading || !withdrawAmount || !bankName || !accountNumber || !accountName} className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 text-sm sm:text-base">{loading ? 'Processing...' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
