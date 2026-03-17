import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Bell, Wallet, Trash2, Camera, Edit3, X } from 'lucide-react';
import { uploadUserPhoto, deleteUserAccount, deleteUserPhoto } from '../services/api';

export default function AccountSettings() {
  const { user, updateProfile, logout, getToken, updatePhoto, deletePhoto } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'balance', label: 'Account Balance', icon: Wallet },
    { id: 'delete', label: 'Delete Account', icon: Trash2 },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = getToken();
        await deleteUserAccount(token);
        logout();
        navigate('/');
      } catch (error) {
        alert(error.message || 'Failed to delete account');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
        
        {/* Mobile: horizontal scrollable tabs */}
        <div className="lg:hidden bg-white rounded-xl shadow-sm mb-4 overflow-x-auto">
          <div className="flex p-2 gap-1 min-w-max">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeSection === item.id
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeSection === item.id
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeSection === 'profile' && <ProfileSection user={user} updateProfile={updateProfile} updatePhoto={updatePhoto} deletePhoto={deletePhoto} onSave={handleSave} saved={saved} />}
              {activeSection === 'password' && <PasswordSection onSave={handleSave} saved={saved} />}
              {activeSection === 'security' && <SecuritySection onSave={handleSave} saved={saved} />}
              {activeSection === 'notifications' && <NotificationsSection onSave={handleSave} saved={saved} />}
              {activeSection === 'balance' && <BalanceSection user={user} />}
              {activeSection === 'delete' && <DeleteAccountSection onDelete={handleDeleteAccount} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileSection({ user, updateProfile, updatePhoto, deletePhoto, onSave, saved }) {
  const { getToken } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Update photoPreview when user.photoUrl changes
  useEffect(() => {
    setPhotoPreview(user?.photoUrl || '');
  }, [user?.photoUrl]);

  const handlePhotoChange = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const token = getToken();
      const result = await uploadUserPhoto(token, file);
      if (result.success) {
        updatePhoto(result.photoUrl);
        setPhotoPreview(result.photoUrl);
      }
    } catch (error) {
      alert(error.message || 'Failed to upload photo');
      setPhotoPreview(user?.photoUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.photoUrl) return;
    
    setDeleting(true);
    try {
      const token = getToken();
      const result = await deleteUserPhoto(token);
      if (result.success) {
        deletePhoto();
        setPhotoPreview('');
        setShowPhotoModal(false);
      }
    } catch (error) {
      alert('Failed to delete photo: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    onSave();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center group">
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <Edit3 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </>
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-2 cursor-pointer hover:bg-teal-700 shadow-lg">
              {uploading ? '...' : <Camera className="w-5 h-5" />}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handlePhotoChange(e.target.files[0])} 
                className="hidden" 
                disabled={uploading} 
              />
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Click camera icon to upload profile picture
            {photoPreview && <br />}
            {photoPreview && 'Click on photo to view and manage'}
          </p>
        </div>

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <img 
                  src={photoPreview} 
                  alt="Profile" 
                  className="w-48 h-48 rounded-2xl object-cover mx-auto shadow-lg" 
                />
              </div>
              
              <div className="flex gap-3">
                <label className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors cursor-pointer text-center">
                  Change Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      handlePhotoChange(e.target.files[0]);
                      setShowPhotoModal(false);
                    }} 
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleDeletePhoto}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <button type="submit" className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">Save Changes</button>
        {saved && <p className="text-sm text-green-600">✓ Changes saved successfully</p>}
      </form>
    </div>
  );
}

function PasswordSection({ onSave, saved }) {
  const { getToken } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPass !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const token = getToken();
      const { changePassword } = await import('../services/api');
      await changePassword(token, current, newPass);
      onSave();
      setCurrent('');
      setNewPass('');
      setConfirm('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input value={current} onChange={e => setCurrent(e.target.value)} type="password" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" required minLength={8} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">Update Password</button>
        {saved && <p className="text-sm text-green-600">✓ Password updated successfully</p>}
      </form>
    </div>
  );
}

function SecuritySection({ onSave, saved }) {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Security</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-sm text-gray-600">Add an extra layer of security</p>
          </div>
          <button onClick={() => { setTwoFactor(!twoFactor); onSave(); }} className={`px-4 py-2 rounded-lg font-medium ${twoFactor ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {twoFactor ? 'Enabled' : 'Enable'}
          </button>
        </div>
        {saved && <p className="text-sm text-green-600">✓ Security settings updated</p>}
      </div>
    </div>
  );
}

function NotificationsSection({ onSave, saved }) {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [push, setPush] = useState(true);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Receive updates via email</p>
          </div>
          <input type="checkbox" checked={email} onChange={e => { setEmail(e.target.checked); onSave(); }} className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">SMS Notifications</p>
            <p className="text-sm text-gray-600">Receive updates via SMS</p>
          </div>
          <input type="checkbox" checked={sms} onChange={e => { setSms(e.target.checked); onSave(); }} className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-600">Receive push notifications</p>
          </div>
          <input type="checkbox" checked={push} onChange={e => { setPush(e.target.checked); onSave(); }} className="w-5 h-5 text-teal-600" />
        </div>
        {saved && <p className="text-sm text-green-600">✓ Notification preferences saved</p>}
      </div>
    </div>
  );
}

function BalanceSection({ user }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  const load = async () => {
    try {
      const { getUserWallet } = await import('../services/api');
      const res = await getUserWallet(getToken(), user?.email);
      setWallet(res.data);
      setTransactions(res.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) load();
  }, [user?.email]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return setWithdrawError('Enter a valid amount');
    if (amount > (wallet?.balance || 0)) return setWithdrawError('Insufficient balance');
    setWithdrawing(true);
    try {
      const { userWalletWithdraw } = await import('../services/api');
      await userWalletWithdraw(getToken(), { bankName, accountNumber, accountName, amount });
      setWithdrawSuccess('Withdrawal request submitted!');
      setShowWithdraw(false);
      setBankName(''); setAccountNumber(''); setAccountName(''); setWithdrawAmount('');
      load();
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Balance</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white mb-6">
            <p className="text-sm text-teal-100 mb-1">Wallet Balance</p>
            <p className="text-4xl font-black">₦{(wallet?.balance || 0).toLocaleString()}</p>
            <p className="text-xs text-teal-200 mt-2">Total refunds received: ₦{(wallet?.totalRefunds || 0).toLocaleString()}</p>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={!wallet?.balance}
              className="mt-4 bg-white text-teal-700 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-teal-50 disabled:opacity-40 transition-all"
            >
              Withdraw
            </button>
          </div>

          {withdrawSuccess && <p className="text-green-600 text-sm mb-4">{withdrawSuccess}</p>}

          {showWithdraw && (
            <form onSubmit={handleWithdraw} className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 mb-6 space-y-3">
              <h3 className="font-bold text-gray-900">Withdraw Funds</h3>
              <input required value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              <input required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              <input required value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Account Name" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              <input required type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder={`Amount (max ₦${(wallet?.balance || 0).toLocaleString()})`} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              {withdrawError && <p className="text-red-600 text-sm">{withdrawError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={withdrawing} className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 text-sm">{withdrawing ? 'Processing...' : 'Submit'}</button>
                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
              </div>
            </form>
          )}

          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t._id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{t.description}</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-bold ${t.type === 'refund' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'refund' ? '+' : '-'}₦{t.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DeleteAccountSection({ onDelete }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Delete Account</h2>
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
        <p className="text-red-700 text-sm">Deleting your account will permanently remove all your data, bookings, and transaction history.</p>
      </div>
      <button onClick={onDelete} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700">Delete My Account</button>
    </div>
  );
}
