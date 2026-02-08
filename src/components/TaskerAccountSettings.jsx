import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTaskers } from '../context/TaskersContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Bell, Briefcase, Wallet, Receipt, Trash2, Camera, MapPin, DollarSign } from 'lucide-react';

export default function TaskerAccountSettings() {
  const { user, updateProfile, logout } = useAuth();
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

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      logout();
      navigate('/');
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
              {activeSection === 'profile' && <ProfileSection user={user} currentTasker={currentTasker} updateProfile={updateProfile} updateTasker={updateTasker} onSave={handleSave} saved={saved} />}
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

function ProfileSection({ user, currentTasker, updateProfile, updateTasker, onSave, saved }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(currentTasker?.bio || '');
  const [location, setLocation] = useState(currentTasker?.location || '');
  const [photoUrl, setPhotoUrl] = useState(currentTasker?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState(currentTasker?.photoUrl || '');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    updateTasker(user.email, { photoUrl, bio, location });
    onSave();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile & Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-2 cursor-pointer hover:bg-teal-700">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2">Click camera icon to upload profile picture</p>
        </div>
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
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPass !== confirm) {
      alert('Passwords do not match');
      return;
    }
    onSave();
    setCurrent('');
    setNewPass('');
    setConfirm('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input value={current} onChange={e => setCurrent(e.target.value)} type="password" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
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
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Balance</h2>
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-2">Available Balance</p>
        <p className="text-4xl font-bold">₦0.00</p>
      </div>
      <button className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">Withdraw Funds</button>
    </div>
  );
}

function TransactionsSection() {
  const transactions = [
    { id: 1, date: '2024-01-15', description: 'Earnings from Plumbing Job', amount: 15000, status: 'completed' },
    { id: 2, date: '2024-01-10', description: 'Earnings from Cleaning Job', amount: 8000, status: 'completed' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{t.description}</p>
              <p className="text-sm text-gray-600">{new Date(t.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">+₦{t.amount.toLocaleString()}</p>
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
