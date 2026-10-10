import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, rs } from '../services/api';
import { Badge, Pager, Table, useFetch } from './ui';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch('/admin/customers', { search: search || undefined, page, limit: 15 });
  document.title = 'Customers';

  const toggle = async (c) => {
    try { await api.put(`/admin/customers/${c._id}/status`, { isActive: !c.isActive }); toast.success(c.isActive ? 'Account disabled' : 'Account enabled'); reload(true); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3"><h1 className="text-2xl font-extrabold">Customers</h1><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Name, email or phone" className="input ml-auto !w-56" /></div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-64" /> : (
        <Table head={['Customer', 'Phone', 'Orders', 'Total spent', 'Status', 'Joined', 'Action']} empty={!data?.customers.length && 'No customers found'}>
          {data?.customers.map((c) => (
            <tr key={c._id}>
              <td className="px-3 py-2 font-semibold">{c.name}<br /><span className="text-xs font-normal text-slate-500">{c.email}</span></td>
              <td className="px-3 py-2">{c.phone || '—'}</td>
              <td className="px-3 py-2">{c.orders}</td>
              <td className="px-3 py-2">{rs(c.totalSpent)}</td>
              <td className="px-3 py-2"><Badge s={c.isActive ? 'active' : 'disabled'} /></td>
              <td className="px-3 py-2 text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2"><button onClick={() => toggle(c)} className="btn border border-slate-200 !px-3 !py-1 text-xs">{c.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={page} pages={data?.pages || 1} onChange={setPage} />
    </div>
  );
}
