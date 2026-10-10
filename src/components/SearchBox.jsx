import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api, { rs } from '../services/api';

export default function SearchBox({ onDone, className = '' }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults(null); return; }
    const t = setTimeout(() => {
      api.get('/products', { params: { search: term, limit: 5 } }).then((r) => setResults(r.data.products)).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path) => { setOpen(false); setQ(''); setResults(null); onDone?.(); nav(path); };
  const submit = (e) => { e.preventDefault(); if (q.trim()) go(`/menu?search=${encodeURIComponent(q.trim())}`); };

  return (
    <form onSubmit={submit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search food..." className="w-full rounded-full bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none" />
      {open && results && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-2xl bg-white text-ink shadow-xl ring-1 ring-slate-100">
          {results.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">No results for “{q.trim()}”</p> : results.map((p) => (
            <button type="button" key={p._id} onMouseDown={() => go(`/product/${p.slug}`)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">{p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
              <span className="text-sm font-bold text-brand">{rs(p.discountPrice || p.price)}</span>
            </button>
          ))}
          {results.length > 0 && <button type="submit" className="w-full border-t px-4 py-2 text-left text-sm font-semibold text-brand hover:bg-slate-50">See all results</button>}
        </div>
      )}
    </form>
  );
}
