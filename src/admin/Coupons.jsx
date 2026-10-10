import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmProvider';
import api, { errMsg, rs } from '../services/api';
import { Badge, Modal, Table, useFetch } from './ui';

const blank = { code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiresAt: '', usageLimit: '' };

export default function Coupons() {
  const { data, loading, error, reload } = useFetch('/admin/coupons');
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  document.title = 'Coupons';

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const num = (v) => (v === '' ? undefined : Number(v));
    try {
      await api.post('/admin/coupons', { code: f.code, type: f.type, value: Number(f.value), minOrder: num(f.minOrder), maxDiscount: num(f.maxDiscount), usageLimit: num(f.usageLimit), expiresAt: f.expiresAt || undefined });
      toast.success('Coupon created'); setF(null); reload(true);
    } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  const act = async (fn) => { try { await fn(); reload(true); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center"><h1 className="text-2xl font-extrabold">Coupons</h1><button onClick={() => setF(blank)} className="btn-blue ml-auto"><Plus className="h-4 w-4" />New coupon</button></div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-48" /> : (
        <Table head={['Code', 'Discount', 'Min order', 'Max discount', 'Used', 'Expires', 'Status', '']} empty={!data?.coupons.length && 'No coupons yet'}>
          {data?.coupons.map((c) => (
            <tr key={c._id}>
              <td className="px-3 py-2 font-bold">{c.code}</td>
              <td className="px-3 py-2">{c.type === 'percentage' ? `${c.value}%` : rs(c.value)}</td>
              <td className="px-3 py-2">{rs(c.minOrder)}</td>
              <td className="px-3 py-2">{c.maxDiscount ? rs(c.maxDiscount) : '—'}</td>
              <td className="px-3 py-2">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
              <td className="px-3 py-2 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
              <td className="px-3 py-2"><button onClick={() => act(() => api.put(`/admin/coupons/${c._id}`, { active: !c.active }))}><Badge s={c.active ? 'active' : 'inactive'} /></button></td>
              <td className="px-3 py-2"><button onClick={async () => (await confirm(`Delete ${c.code}?`)) && act(() => api.delete(`/admin/coupons/${c._id}`))} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></button></td>
            </tr>
          ))}
        </Table>
      )}
      {f && (
        <Modal title="New coupon" onClose={() => setF(null)}>
          <form onSubmit={save} className="space-y-3">
            <input required placeholder="Code (e.g. SAVE20)" className="input uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed (Rs.)</option></select>
              <input required type="number" min="1" placeholder="Value" className="input" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
              <input type="number" min="0" placeholder="Minimum order" className="input" value={f.minOrder} onChange={(e) => setF({ ...f, minOrder: e.target.value })} />
              <input type="number" min="1" placeholder="Max discount" className="input" value={f.maxDiscount} onChange={(e) => setF({ ...f, maxDiscount: e.target.value })} />
              <input type="number" min="1" placeholder="Usage limit" className="input" value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} />
              <input type="date" className="input" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
            </div>
            <button disabled={busy} className="btn-blue w-full">{busy ? 'Saving...' : 'Create coupon'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
