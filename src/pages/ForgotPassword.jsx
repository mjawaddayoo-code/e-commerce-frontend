import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  document.title = 'Forgot password';
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-extrabold">Forgot password</h1>
      {sent ? <p className="text-sm text-slate-600">If an account exists for that email, a reset link is on its way. The link works for 1 hour.</p> : <>
        <input required type="email" placeholder="Your email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button disabled={busy} className="btn-gold w-full">{busy ? 'Sending...' : 'Send reset link'}</button>
      </>}
      <p className="text-center text-sm"><Link to="/login" className="font-semibold text-brand">Back to login</Link></p>
    </form>
  );
}
