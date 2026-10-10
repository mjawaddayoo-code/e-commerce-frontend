import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { Badge, useFetch } from './ui';

export default function Inquiries() {
  const { data, loading, error, reload } = useFetch('/admin/inquiries');
  document.title = 'Inquiries';
  const mark = async (i) => { try { await api.put(`/admin/inquiries/${i._id}`, { handled: !i.handled }); reload(true); } catch (e) { toast.error(errMsg(e)); } };
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Customer inquiries</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-48" /> : !data?.inquiries.length ? <p className="py-10 text-center text-slate-500">No inquiries yet</p> : data.inquiries.map((i) => (
        <div key={i._id} className="card p-4 text-sm">
          <div className="flex items-start justify-between gap-3"><div><b>{i.name}</b> · {i.email}{i.phone && ` · ${i.phone}`}<p className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleString()}</p></div><button onClick={() => mark(i)}><Badge s={i.handled ? 'handled' : 'pending'} /></button></div>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{i.message}</p>
        </div>
      ))}
    </div>
  );
}
