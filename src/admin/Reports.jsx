import { useState } from 'react';
import { Download } from 'lucide-react';
import { rs } from '../services/api';
import { Table, useFetch } from './ui';

const iso = (d) => d.toISOString().slice(0, 10);

export default function Reports() {
  const [from, setFrom] = useState(iso(new Date(Date.now() - 29 * 864e5)));
  const [to, setTo] = useState(iso(new Date()));
  const { data, loading, error } = useFetch('/admin/reports/sales', { from, to });
  document.title = 'Reports';

  const csv = () => {
    const head = 'Date,Orders,Subtotal,Discount,Delivery,Tax,Total';
    const lines = data.rows.map((r) => [r.date, r.orders, r.subtotal, r.discount, r.delivery, r.tax, r.total].join(','));
    const url = URL.createObjectURL(new Blob([[head, ...lines].join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `sales-${from}-to-${to}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">Sales report</h1>
        <div className="ml-auto flex items-center gap-2 text-sm"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input !w-40" />to<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input !w-40" />
          <button disabled={!data?.rows.length} onClick={csv} className="btn-blue"><Download className="h-4 w-4" />CSV</button></div>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-48" /> : data && (<>
        <div className="grid grid-cols-3 gap-3">{[['Orders', data.totals.orders], ['Revenue', rs(data.totals.total)], ['Discounts given', rs(data.totals.discount)]].map(([k, v]) => <div key={k} className="card p-4"><p className="text-xs text-slate-500">{k}</p><p className="text-xl font-extrabold text-brand">{v}</p></div>)}</div>
        <Table head={['Date', 'Orders', 'Subtotal', 'Discount', 'Delivery', 'Tax', 'Total']} empty={!data.rows.length && 'No orders in this range'}>
          {data.rows.map((r) => <tr key={r.date}><td className="px-3 py-2">{r.date}</td><td className="px-3 py-2">{r.orders}</td><td className="px-3 py-2">{rs(r.subtotal)}</td><td className="px-3 py-2">{rs(r.discount)}</td><td className="px-3 py-2">{rs(r.delivery)}</td><td className="px-3 py-2">{rs(r.tax)}</td><td className="px-3 py-2 font-semibold">{rs(r.total)}</td></tr>)}
        </Table>
        <div className="card p-4 text-sm"><p className="mb-2 font-bold">By payment</p>{data.byPayment.map((b, i) => <p key={i} className="flex justify-between py-0.5"><span className="uppercase">{b.method} · {b.status}</span><span>{b.orders} orders · {rs(b.total)}</span></p>)}</div>
      </>)}
    </div>
  );
}
