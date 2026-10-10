import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmProvider';
import api, { errMsg } from '../services/api';
import { Badge, Pager, Table, useFetch } from './ui';

export default function Reviews() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch('/admin/reviews', { page });
  const confirm = useConfirm();
  document.title = 'Reviews';
  const act = async (fn) => { try { await fn(); reload(true); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Reviews</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-48" /> : (
        <Table head={['Product', 'Customer', 'Rating', 'Comment', 'Status', 'Actions']} empty={!data?.reviews.length && 'No reviews yet'}>
          {data?.reviews.map((r) => (
            <tr key={r._id}>
              <td className="px-3 py-2 font-semibold">{r.product?.name}</td>
              <td className="px-3 py-2">{r.user?.name}</td>
              <td className="px-3 py-2"><span className="flex items-center gap-1">{r.rating}<Star className="h-3.5 w-3.5 fill-gold text-gold" /></span></td>
              <td className="max-w-xs px-3 py-2 text-slate-600">{r.comment || '—'}</td>
              <td className="px-3 py-2"><Badge s={r.approved ? 'approved' : 'hidden'} /></td>
              <td className="px-3 py-2"><div className="flex gap-3"><button onClick={() => act(() => api.put(`/admin/reviews/${r._id}`, { approved: !r.approved }))} className="text-xs font-semibold text-brand">{r.approved ? 'Hide' : 'Approve'}</button>
                <button onClick={async () => (await confirm('Delete this review?')) && act(() => api.delete(`/admin/reviews/${r._id}`))} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={page} pages={data?.pages || 1} onChange={setPage} />
    </div>
  );
}
