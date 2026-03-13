import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit3, X } from 'lucide-react';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (user) {
      const names = (user.name || '').split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setPreview(user.photoUrl || null);
    }
  }, [user]);

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`.trim();

    if (photo) {
      const reader = new FileReader();
      reader.onload = () => {
        updateProfile({ name, email, phone, photoUrl: reader.result });
        setSaved(true);
      };
      reader.readAsDataURL(photo);
    } else {
      updateProfile({ name, email, phone });
      setSaved(true);
    }

    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeletePhoto = async () => {
    if (!user?.photoUrl) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/delete-photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        updateProfile({ photoUrl: null });
        setPreview(null);
        setPhoto(null);
        setShowPhotoModal(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Failed to delete photo: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h4 className="font-semibold mb-3">Edit Profile</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className="flex-1 min-w-0 border rounded px-3 py-2" placeholder="First name" />
          <input value={lastName} onChange={e => setLastName(e.target.value)} className="flex-1 min-w-0 border rounded px-3 py-2" placeholder="Last name" />
        </div>
        <div>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border rounded px-3 py-2" placeholder="Email" />
        </div>
        <div>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Phone" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Profile Photo</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              {preview ? (
                <div className="relative group">
                  <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all duration-200"
                  >
                    <Edit3 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No photo</div>
              )}
            </div>
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setPhoto(e.target.files[0])} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {preview && (
                <p className="text-xs text-gray-500 mt-1">Click on photo to view and manage</p>
              )}
            </div>
          </div>
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
                  src={preview} 
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
                      setPhoto(e.target.files[0]);
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
        <div className="flex gap-2">
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={() => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPhoto(null); setPreview(user?.photoUrl || null); }} className="border px-4 py-2 rounded">Reset</button>
        </div>
        {saved && <div className="text-sm text-teal-600">Profile saved.</div>}
      </form>
    </div>
  );
}
