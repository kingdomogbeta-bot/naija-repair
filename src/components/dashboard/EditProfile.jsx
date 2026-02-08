import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saved, setSaved] = useState(false);

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
            {preview ? (
              <img src={preview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">No photo</div>
            )}
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded">Save</button>
          <button type="button" onClick={() => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPhoto(null); setPreview(user?.photoUrl || null); }} className="border px-4 py-2 rounded">Reset</button>
        </div>
        {saved && <div className="text-sm text-teal-600">Profile saved.</div>}
      </form>
    </div>
  );
}
