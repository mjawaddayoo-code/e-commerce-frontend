import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Grid from '../components/Grid';

export default function Menu({ offers }) {
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = sp.get('search') || '';
  const sort = sp.get('sort') || 'newest';
  const page = Number(sp.get('page') || 1);
  const inStock = sp.get('inStock') === 'true';
  const maxPrice = sp.get('maxPrice') || '';
  const category = slug || sp.get('category') || '';

  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data.categories)); }, []);

  useEffect(() => {
    document.title = offers ? 'Offers & Deals' : search ? `Search: ${search}` : 'Menu';
    setLoading(true); setError('');
    const params = { sort, page, limit: 12, ...(search && { search }), ...(category && { category }), ...(inStock && { inStock: true }), ...(maxPrice && { maxPrice }), ...(offers && { discount: true }) };
    api.get('/products', { params }).then((r) => { setProducts(r.data.products); setPages(r.data.pages); })
      .catch(() => setError('Could not load the menu. Please try again.')).finally(() => setLoading(false));
  }, [search, sort, page, inStock, maxPrice, category, offers]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">{offers ? 'Offers & Deals' : search ? `Results for “${search}”` : 'Our Menu'}</h1>
      {!offers && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button onClick={() => set('category', '')} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${!category ? 'bg-brand text-white' : 'bg-white ring-1 ring-slate-200'}`}>All</button>
          {cats.map((c) => <button key={c._id} onClick={() => set('category', c.slug)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${category === c.slug ? 'bg-brand text-white' : 'bg-white ring-1 ring-slate-200'}`}>{c.name}</button>)}
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <select value={sort} onChange={(e) => set('sort', e.target.value)} className="input !w-auto !py-1.5">
          <option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Popular</option><option value="rating">Top rated</option>
        </select>
        <select value={maxPrice} onChange={(e) => set('maxPrice', e.target.value)} className="input !w-auto !py-1.5">
          <option value="">Any price</option><option value="500">Under Rs. 500</option><option value="1000">Under Rs. 1,000</option><option value="2000">Under Rs. 2,000</option>
        </select>
        <label className="flex items-center gap-2"><input type="checkbox" checked={inStock} onChange={(e) => set('inStock', e.target.checked ? 'true' : '')} />In stock only</label>
      </div>
      {error ? <p className="py-10 text-center text-red-600">{error}</p> : <Grid products={products} loading={loading} empty={search ? `No results for “${search}”. Try another word.` : 'Nothing here yet.'} />}
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => set('page', page - 1)} className="btn-blue">Prev</button>
          <span className="self-center text-sm">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => set('page', page + 1)} className="btn-blue">Next</button>
        </div>
      )}
    </div>
  );
}
