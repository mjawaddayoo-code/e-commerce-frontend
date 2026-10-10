import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  document.title = 'Reset password';
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post('/auth/reset-password', { token, password }); toast.success('Password updated'); window.location.href = '/'; }
    catch (ex) { toast.error(errMsg(ex)); setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-extrabold">Set a new password</h1>
      <input required type="password" minLength={8} placeholder="New password (8+ characters)" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={busy} className="btn-gold w-full">{busy ? 'Saving...' : 'Update password'}</button>
      <p className="text-center text-sm"><Link to="/forgot-password" className="text-brand">Need a new link?</Link></p>
    </form>
  );
}
