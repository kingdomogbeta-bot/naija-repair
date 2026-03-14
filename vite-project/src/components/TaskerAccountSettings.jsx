import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTaskers } from '../context/TaskersContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Bell, Briefcase, Wallet, Receipt, Trash2, Camera, MapPin, DollarSign, Edit3, X } from 'lucide-react';
import { uploadTaskerPhoto, deleteTaskerAccount, deleteTaskerPhoto } from '../services/api';

export default function TaskerAccountSettings() {
  const { user, updateProfile, logout, getToken, updatePhoto, deletePhoto } = useAuth();
  const { taskers, updateTasker } = useTaskers();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const currentTasker = taskers.find(t => t.email === user?.email);

  const menuItems = [
    { id: 'profile', label: 'Profile & Photo', icon: User },
    { id: 'rates', label: 'Rates & Availability', icon: Briefcase },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'balance', label: 'Account Balance', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'delete', label: 'Delete Account', icon: Trash2 },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { getToken } = useAuth();
        const token = getToken();
        await deleteTaskerAccount(token);
        logout();
        navigate('/');
      } catch (error) {
        alert(error.message || 'Failed to delete account');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tasker Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
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

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeSection === 'profile' && <ProfileSection user={user} currentTasker={currentTasker} updateProfile={updateProfile} updateTasker={updateTasker} updatePhoto={updatePhoto} deletePhoto={deletePhoto} onSave={handleSave} saved={saved} />}
              {activeSection === 'rates' && <RatesSection currentTasker={currentTasker} updateTasker={updateTasker} onSave={handleSave} saved={saved} />}
              {activeSection === 'password' && <PasswordSection onSave={handleSave} saved={saved} />}
              {activeSection === 'security' && <SecuritySection onSave={handleSave} saved={saved} />}
              {activeSection === 'notifications' && <NotificationsSection onSave={handleSave} saved={saved} />}
              {activeSection === 'balance' && <BalanceSection />}
              {activeSection === 'transactions' && <TransactionsSection />}
              {activeSection === 'delete' && <DeleteAccountSection onDelete={handleDeleteAccount} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProfileSection({ user, currentTasker, updateProfile, updateTasker, updatePhoto, deletePhoto, onSave, saved }) {
  const { getToken } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(currentTasker?.bio || '');
  const [location, setLocation] = useState(currentTasker?.location || '');
  const [photoPreview, setPhotoPreview] = useState(currentTasker?.photoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Update photoPreview when currentTasker.photoUrl changes
  useEffect(() => {
    setPhotoPreview(currentTasker?.photoUrl || '');
  }, [currentTasker?.photoUrl]);

  const handlePhotoChange = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const token = getToken();
      const result = await uploadTaskerPhoto(token, file);
      if (result.success) {
        updateTasker(user.email, { photoUrl: result.photoUrl });
        updatePhoto(result.photoUrl);
        setPhotoPreview(result.photoUrl);
      }
    } catch (error) {
      alert(error.message || 'Failed to upload photo');
      setPhotoPreview(currentTasker?.photoUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentTasker?.photoUrl) return;
    
    setDeleting(true);
    try {
      const token = getToken();
      const result = await deleteTaskerPhoto(token);
      if (result.success) {
        updateTasker(user.email, { photoUrl: null });
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
    updateTasker(user.email, { bio, location });
    onSave();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile & Photo</h2>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Lagos, Abuja" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell clients about your experience and skills..." className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <button type="submit" className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">Save Changes</button>
        {saved && <p className="text-sm text-green-600">✓ Changes saved successfully</p>}
      </form>
    </div>
  );
}

function RatesSection({ currentTasker, updateTasker, onSave, saved }) {
  const [hourlyRate, setHourlyRate] = useState(currentTasker?.hourlyRate || 3000);
  const [availability, setAvailability] = useState(currentTasker?.availability || 'Available');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTasker(currentTasker.email, { hourlyRate: Number(hourlyRate), availability });
    onSave();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rates & Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₦)</label>
          <input value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} type="number" min="1000" step="500" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
          <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Unavailable">Unavailable</option>
          </select>
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
      const { changeTaskerPassword } = await import('../services/api');
      await changeTaskerPassword(token, current, newPass);
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
            <p className="text-sm text-gray-600">Receive job alerts via email</p>
          </div>
          <input type="checkbox" checked={email} onChange={e => { setEmail(e.target.checked); onSave(); }} className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
          <div>
            <p className="font-medium text-gray-900">SMS Notifications</p>
            <p className="text-sm text-gray-600">Receive job alerts via SMS</p>
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

function BalanceSection() {
  const { user, getToken } = useAuth();
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = getToken();
        const res = await fetch(`https://naija-repair-api.onrender.com/api/wallet/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setWallet(data.data);
      } catch (err) {
        console.error('Fetch wallet error:', err);
      }
    };
    fetchWallet();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Balance</h2>
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white mb-4">
        <p className="text-sm opacity-90 mb-2">Available Balance</p>
        <p className="text-4xl font-bold">₦{wallet ? Number(wallet.balance).toLocaleString() : '0'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-xl font-bold text-gray-900">₦{wallet ? Number(wallet.totalEarnings).toLocaleString() : '0'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Withdrawals</p>
          <p className="text-xl font-bold text-gray-900">₦{wallet ? Number(wallet.totalWithdrawals).toLocaleString() : '0'}</p>
        </div>
      </div>
      <button onClick={() => window.location.href = '/tasker-wallet'} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">Manage Wallet</button>
    </div>
  );
}

function TransactionsSection() {
  const { user, getToken } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = getToken();
        const res = await fetch(`https://naija-repair-api.onrender.com/api/wallet/${user.email}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setTransactions(data.data);
      } catch (err) {
        console.error('Fetch transactions error:', err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
      <div className="space-y-3">
        {transactions.length === 0 && <p className="text-gray-500 text-center py-8">No transactions yet</p>}
        {transactions.map(t => (
          <div key={t._id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{t.description}</p>
              <p className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'credit' ? '+' : '-'}₦{t.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{t.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeleteAccountSection({ onDelete }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Delete Account</h2>
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
        <p className="text-red-700 text-sm">Deleting your account will permanently remove all your data, jobs, and earnings history.</p>
      </div>
      <button onClick={onDelete} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700">Delete My Account</button>
    </div>
  );
}
