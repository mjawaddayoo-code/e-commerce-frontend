import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function AdminLogin() {
  const { user, adminLogin } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  document.title = 'Admin login';
  if (user && ['admin', 'staff'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await adminLogin(f.email, f.password); nav('/admin/dashboard', { replace: true }); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6">
        <h1 className="text-2xl font-extrabold text-brand">Admin <span className="text-gold">Panel</span></h1>
        <input required type="email" placeholder="Email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" placeholder="Password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button disabled={busy} className="btn-blue w-full">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
