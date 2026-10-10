import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import { statusColor, label } from '../utils/constants';

export const Badge = ({ s }) => <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(s)}`}>{label(String(s))}</span>;

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} aria-label="Close"><X /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-blue !py-1.5">Prev</button>
      <span>Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-blue !py-1.5">Next</button>
    </div>
  );
}

export const Table = ({ head, children, empty }) => (
  <div className="card overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{head.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
    {empty && <p className="py-10 text-center text-slate-500">{empty}</p>}
  </div>
);

// Fetch helper: { data, loading, error, reload }
export function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = url + JSON.stringify(params || {});
  const reload = useCallback((silent) => {
    if (!silent) setLoading(true);
    return api.get(url, { params }).then((r) => { setData(r.data); setError(''); })
      .catch((e) => setError(e.response?.data?.message || 'Could not load data')).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [key]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload };
}

export function ImageUpload({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setErr('Use a JPG, PNG or WebP image');
    if (file.size > 5 * 1024 * 1024) return setErr('Image must be under 5 MB');
    setErr(''); setBusy(true);
    const fd = new FormData(); fd.append('image', file); fd.append('folder', folder);
    try { const r = await api.post('/upload', fd); onChange(r.data.image); }
    catch (ex) { setErr(ex.response?.data?.message || 'Upload failed'); } finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-400">{value?.url ? <img src={value.url} alt="" className="h-full w-full object-cover" /> : 'No image'}</div>
      <div><input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} disabled={busy} className="text-sm" />{busy && <p className="text-xs text-brand">Uploading...</p>}{err && <p className="text-xs text-red-600">{err}</p>}</div>
    </div>
  );
}
