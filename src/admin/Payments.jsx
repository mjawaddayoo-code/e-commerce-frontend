import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, rs } from '../services/api';
import { Badge, Modal, Pager, Table, useFetch } from './ui';

const PAY = ['pending', 'paid', 'failed', 'refunded'];

export default function Payments() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useFetch('/admin/payments', { status: status || undefined, page, limit: 15 });
  document.title = 'Payments';

  const change = async (p, next) => {
    try { await api.put(`/admin/payments/${p._id}/status`, { status: next }); toast.success('Payment updated'); reload(true); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-extrabold">Payments</h1>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input ml-auto !w-44"><option value="">All statuses</option>{PAY.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-64" /> : (
        <Table head={['Order', 'Customer', 'Amount', 'Method', 'Provider', 'Status', 'Transaction', 'Date']} empty={!data?.payments.length && 'No payments yet'}>
          {data?.payments.map((p) => (
            <tr key={p._id}>
              <td className="px-3 py-2"><button onClick={() => setOpen(p)} className="font-bold text-brand underline">{p.order?.orderNumber}</button></td>
              <td className="px-3 py-2">{p.user?.name}</td>
              <td className="px-3 py-2 font-semibold">{rs(p.amount)}</td>
              <td className="px-3 py-2 uppercase">{p.method}</td>
              <td className="px-3 py-2">{p.provider}</td>
              <td className="px-3 py-2"><select value={p.status} onChange={(e) => change(p, e.target.value)} className="rounded-lg border px-2 py-1 text-xs">{PAY.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
              <td className="px-3 py-2 text-xs">{p.transactionId || '—'}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={page} pages={data?.pages || 1} onChange={setPage} />
      {open && <Modal title="Payment details" onClose={() => setOpen(null)}><div className="space-y-1 text-sm"><p>ID: {open._id}</p><p>Order: {open.order?.orderNumber}</p><p>Customer: {open.user?.name} ({open.user?.email})</p><p>Amount: {rs(open.amount)}</p><p>Method: {open.method} / {open.provider}</p><p>Status: <Badge s={open.status} /></p><p>Transaction: {open.transactionId || '—'}</p>{open.method === 'cod' && open.status === 'pending' && <p className="rounded-lg bg-amber-50 p-2">COD stays pending until marked as paid after cash is collected.</p>}</div></Modal>}
    </div>
  );
}
