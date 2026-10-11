import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import useSeo from '../hooks/useSeo';
import api, { rs, errMsg } from '../services/api';
import { useCart } from '../context/CartContext';
import Grid from '../components/Grid';

export default function ProductDetails() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const [pick, setPick] = useState({});
  const [extras, setExtras] = useState([]);
  const [img, setImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setP(null); setErr(''); setQty(1); setExtras([]); setImg(0);
    api.get(`/products/${slug}`).then((r) => {
      setP(r.data.product); setRelated(r.data.related);
      setPick(Object.fromEntries((r.data.product.variants || []).map((v) => [v.name, v.options[0].label])));
    }).catch(() => setErr('This item could not be found.'));
  }, [slug]);

  const unit = useMemo(() => {
    if (!p) return 0;
    let u = p.discountPrice || p.price;
    p.variants.forEach((g) => { u += g.options.find((o) => o.label === pick[g.name])?.priceDelta || 0; });
    extras.forEach((n) => { u += p.extras.find((e) => e.name === n)?.price || 0; });
    return u;
  }, [p, pick, extras]);

  useSeo({
    title: p?.name, description: p?.description?.slice(0, 150), image: p?.images?.[0]?.url,
    jsonLd: p && {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: p.images?.map((i) => i.url),
      offers: { '@type': 'Offer', priceCurrency: 'PKR', price: p.discountPrice || p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
      ...(p.numReviews > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.numReviews } }),
    },
  });

  if (err) return <p className="py-20 text-center text-slate-500">{err}</p>;
  if (!p) return <div className="skeleton h-96" />;

  const line = () => ({ product: p._id, name: p.name, slug: p.slug, image: p.images?.[0]?.url, unit, quantity: qty, variants: Object.entries(pick).map(([name, label]) => ({ name, label })), extras });

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="card aspect-square overflow-hidden bg-slate-100">
            {p.images?.[img]?.url ? <img src={p.images[img].url} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🍽️</div>}
          </div>
          {p.images?.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {p.images.map((im, i) => <button key={i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 ${i === img ? 'ring-brand' : 'ring-transparent'}`}><img src={im.url} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-slate-500">{p.category?.name}</p>
          <h1 className="text-3xl font-extrabold">{p.name}</h1>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand">{rs(unit)}</span>
            {p.discountPrice && <span className="text-slate-400 line-through">{rs(p.price)}</span>}
            {p.percentOff > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{p.percentOff}% OFF</span>}
          </div>
          <p className="mt-3 text-slate-600">{p.description}</p>
          <p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><Clock className="h-4 w-4" />~{p.prepTimeMinutes} min prep · {p.stock > 0 ? 'In stock' : 'Out of stock'}</p>
          {p.ingredients?.length > 0 && <p className="mt-2 text-sm"><b>Ingredients:</b> {p.ingredients.join(', ')}</p>}

          {p.variants.map((g) => (
            <div key={g.name} className="mt-4">
              <p className="mb-1 font-semibold">{g.name}</p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => <button key={o.label} onClick={() => setPick({ ...pick, [g.name]: o.label })} className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${pick[g.name] === o.label ? 'bg-brand text-white ring-brand' : 'bg-white ring-slate-200'}`}>{o.label}{o.priceDelta ? ` (+${rs(o.priceDelta)})` : ''}</button>)}
              </div>
            </div>
          ))}
          {p.extras.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 font-semibold">Extras</p>
              {p.extras.map((e) => (
                <label key={e.name} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" checked={extras.includes(e.name)} onChange={(ev) => setExtras(ev.target.checked ? [...extras, e.name] : extras.filter((x) => x !== e.name))} />{e.name} (+{rs(e.price)})
                </label>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white px-2 py-1 ring-1 ring-slate-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(Math.min(p.stock, 50), qty + 1))} className="p-2" aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <button disabled={p.stock < 1} onClick={() => { add(line()); setAdded(true); setTimeout(() => setAdded(false), 1500); }} className={`btn flex-1 ${added ? 'bg-green-600 text-white' : 'bg-gold text-brand-dark'}`}>{added ? '✓ Added to cart' : `Add to Cart · ${rs(unit * qty)}`}</button>
            <button disabled={p.stock < 1} onClick={() => { add(line()); nav('/checkout'); }} className="btn-blue">Buy Now</button>
          </div>
        </div>
      </div>
      <Reviews slug={p.slug} />
      {related.length > 0 && <section><h2 className="mb-3 text-xl font-bold">You may also like</h2><Grid products={related} /></section>}
    </div>
  );
}

function Reviews({ slug }) {
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => api.get(`/products/${slug}/reviews`).then((r) => setData(r.data)).catch(() => setData({ reviews: [], canReview: false }));
  useEffect(() => { load(); }, [slug]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.post(`/products/${slug}/reviews`, { rating, comment: comment || undefined }); toast.success('Thanks for your review!'); setComment(''); load(); }
    catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  if (!data) return null;
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">Reviews</h2>
      {data.canReview && (
        <form onSubmit={submit} className="card mb-4 space-y-3 p-4">
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}><Star className={`h-6 w-6 ${n <= rating ? 'fill-gold text-gold' : 'text-slate-300'}`} /></button>)}</div>
          <textarea rows={2} className="input" placeholder="Tell others what you thought (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button disabled={busy} className="btn-blue">Submit review</button>
        </form>
      )}
      {data.reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews yet. Only customers who received this item can review it.</p> : (
        <div className="space-y-3">{data.reviews.map((r) => (
          <div key={r._id} className="card p-4 text-sm"><div className="flex items-center justify-between"><b>{r.user?.name}</b><span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</span></div>{r.comment && <p className="mt-1 text-slate-600">{r.comment}</p>}<p className="mt-1 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p></div>
        ))}</div>
      )}
    </section>
  );
}
