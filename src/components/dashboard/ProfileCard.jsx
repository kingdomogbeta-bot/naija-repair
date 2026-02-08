import { useAuth } from '../../context/AuthContext';

export default function ProfileCard() {
  const { user, logout } = useAuth();
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center gap-4">
        {user?.photoUrl ? (
          <img src={user.photoUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="bg-teal-500 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold">
            {user?.name?.split(' ')[0]?.[0] ?? 'N'}
          </div>
        )}
        <div>
          <div className="font-semibold text-lg">{user?.name ?? 'Guest'}</div>
          <div className="text-sm text-gray-500">{user?.email ?? ''}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <a href="/account-settings" className="block text-center w-full bg-gray-50 border border-gray-100 py-2 rounded text-sm hover:bg-gray-100">Account settings</a>
        <button onClick={logout} className="w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded">Log out</button>
      </div>
    </div>
  );
}
