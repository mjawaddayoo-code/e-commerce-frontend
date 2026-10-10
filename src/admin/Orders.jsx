import { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmProvider';
import api, { errMsg, rs } from '../services/api';
import { STATUSES, label } from '../utils/constants';
import { Badge, Modal, Pager, Table, useFetch } from './ui';

export default function Orders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useFetch('/admin/orders', { status: status || undefined, search: search || undefined, page, limit: 15 });
  const confirm = useConfirm();
  document.title = 'Orders';

  const change = async (o, next) => {
    if (next === 'cancelled' && !(await confirm('Cancel this order? Stock will be returned.'))) return;
    try { await api.put(`/admin/orders/${o._id}/status`, { status: next }); toast.success(`Order ${o.orderNumber} → ${label(next)}`); reload(true); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">Orders</h1>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Order #, name or phone" className="input ml-auto !w-56" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input !w-44"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-64" /> : (
        <Table head={['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Pay status', 'Status', 'Date']} empty={!data?.orders.length && 'No orders found'}>
          {data?.orders.map((o) => {
            const closed = ['delivered', 'cancelled'].includes(o.orderStatus);
            return (
              <tr key={o._id}>
                <td className="px-3 py-2"><button onClick={() => setOpen(o)} className="font-bold text-brand underline">{o.orderNumber}</button></td>
                <td className="px-3 py-2">{o.customer.name}<br /><span className="text-xs text-slate-500">{o.customer.phone}</span></td>
                <td className="px-3 py-2">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="px-3 py-2 font-semibold">{rs(o.total)}</td>
                <td className="px-3 py-2 uppercase">{o.paymentMethod}</td>
                <td className="px-3 py-2"><Badge s={o.paymentStatus} /></td>
                <td className="px-3 py-2">{closed ? <Badge s={o.orderStatus} /> : <select value={o.orderStatus} onChange={(e) => change(o, e.target.value)} className="rounded-lg border px-2 py-1 text-xs">{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            );
          })}
        </Table>
      )}
      <Pager page={page} pages={data?.pages || 1} onChange={setPage} />
      {open && (
        <Modal title={`Order ${open.orderNumber}`} onClose={() => setOpen(null)}>
          <div className="space-y-3 text-sm">
            <p><b>{open.customer.name}</b> · {open.customer.phone} · {open.customer.email}</p>
            <p>{open.shippingAddress.street}, {open.shippingAddress.area}, {open.shippingAddress.city}{open.shippingAddress.landmark && ` (near ${open.shippingAddress.landmark})`}</p>
            {open.shippingAddress.instructions && <p className="rounded-lg bg-amber-50 p-2">Note: {open.shippingAddress.instructions}</p>}
            <div className="space-y-1 border-t pt-2">{open.items.map((i, k) => <div key={k} className="flex justify-between"><span>{i.name} × {i.quantity} <span className="text-xs text-slate-500">{[...(i.variants || []).map((v) => v.label), ...(i.extras || []).map((e) => e.name)].join(' · ')}</span></span><span>{rs(i.lineTotal)}</span></div>)}</div>
            <div className="border-t pt-2"><div className="flex justify-between"><span>Delivery</span><span>{rs(open.deliveryFee)}</span></div>{open.discount > 0 && <div className="flex justify-between"><span>Discount {open.couponCode && `(${open.couponCode})`}</span><span>- {rs(open.discount)}</span></div>}<div className="flex justify-between text-base font-extrabold"><span>Total</span><span>{rs(open.total)}</span></div></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
