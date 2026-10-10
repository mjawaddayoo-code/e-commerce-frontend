import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Profile', 'Addresses', 'Settings'];

export default function Account() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Profile');
  document.title = 'My Account';
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold">My Account</h1>
      <div className="flex gap-2 text-sm font-semibold">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 ${tab === t ? 'bg-brand text-white' : 'bg-white ring-1 ring-slate-200'}`}>{t}</button>)}
        <Link to="/orders" className="rounded-full bg-white px-4 py-1.5 ring-1 ring-slate-200">Orders</Link>
        <Link to="/wishlist" className="rounded-full bg-white px-4 py-1.5 ring-1 ring-slate-200">Wishlist</Link>
      </div>
      {tab === 'Profile' && <Profile user={user} />}
      {tab === 'Addresses' && <Addresses user={user} />}
      {tab === 'Settings' && <Password />}
    </div>
  );
}

// The auth context holds the user object; a reload picks up saved changes
const refresh = () => setTimeout(() => window.location.reload(), 700);

function Profile({ user }) {
  const [f, setF] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put('/account/profile', f); toast.success('Profile updated'); refresh(); } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <input required className="input" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input required type="email" className="input" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className="input" placeholder="Phone (03XXXXXXXXX)" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <button disabled={busy} className="btn-blue w-full">{busy ? 'Saving...' : 'Save changes'}</button>
    </form>
  );
}

function Addresses({ user }) {
  const [list, setList] = useState(user.addresses || []);
  const [n, setN] = useState({ label: 'Home', area: '', city: 'Sukkur', street: '', landmark: '' });
  const [busy, setBusy] = useState(false);
  const clean = (a) => ({ label: a.label, area: a.area, city: a.city, street: a.street, landmark: a.landmark || undefined, instructions: a.instructions || undefined, isDefault: a.isDefault });
  const persist = async (next) => {
    setBusy(true);
    try { const r = await api.put('/account/addresses', { addresses: next.map(clean) }); setList(r.data.user.addresses); toast.success('Addresses saved'); return true; }
    catch (ex) { toast.error(errMsg(ex)); return false; } finally { setBusy(false); }
  };
  const add = async (e) => { e.preventDefault(); if (await persist([...list, n])) setN({ ...n, area: '', street: '', landmark: '' }); };

  return (
    <div className="space-y-3">
      {list.map((a) => (
        <div key={a._id} className="card flex items-start justify-between p-4 text-sm"><div><b>{a.label}</b><br />{a.street}, {a.area}, {a.city}{a.landmark && ` (near ${a.landmark})`}</div>
          <button onClick={() => persist(list.filter((x) => x._id !== a._id))} aria-label="Delete" className="text-red-500"><Trash2 className="h-4 w-4" /></button></div>
      ))}
      <form onSubmit={add} className="card space-y-3 p-5">
        <p className="font-bold">Add address</p>
        <input className="input" placeholder="Label (Home, Work)" value={n.label} onChange={(e) => setN({ ...n, label: e.target.value })} />
        <div className="grid grid-cols-2 gap-3"><input required className="input" placeholder="Area" value={n.area} onChange={(e) => setN({ ...n, area: e.target.value })} /><input required className="input" placeholder="City" value={n.city} onChange={(e) => setN({ ...n, city: e.target.value })} /></div>
        <input required minLength={5} className="input" placeholder="Street / address" value={n.street} onChange={(e) => setN({ ...n, street: e.target.value })} />
        <input className="input" placeholder="Landmark (optional)" value={n.landmark} onChange={(e) => setN({ ...n, landmark: e.target.value })} />
        <button disabled={busy} className="btn-blue w-full">Save address</button>
      </form>
    </div>
  );
}

function Password() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.put('/account/password', f); toast.success('Password updated'); setF({ currentPassword: '', newPassword: '' }); } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <p className="font-bold">Change password</p>
      <input required type="password" className="input" placeholder="Current password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} />
      <input required type="password" minLength={8} className="input" placeholder="New password (8+ characters)" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} />
      <button disabled={busy} className="btn-blue w-full">Update password</button>
    </form>
  );
}
