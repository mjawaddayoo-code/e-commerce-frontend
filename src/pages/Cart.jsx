import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import useQuote from '../hooks/useQuote';
import Summary from '../components/Summary';
import { rs } from '../services/api';

export default function Cart() {
  const { lines, setQty, remove, apiItems } = useCart();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const { quote, error, loading } = useQuote(apiItems, applied);
  const nav = useNavigate();
  document.title = 'Your Cart';

  if (!lines.length) return (
    <div className="py-20 text-center"><p className="text-5xl">🛒</p><p className="mt-2 text-lg font-semibold">Your cart is empty</p><Link to="/menu" className="btn-gold mt-4">Browse Menu</Link></div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        <h1 className="text-2xl font-extrabold">Your Cart</h1>
        {lines.map((l) => (
          <div key={l.key} className="card flex gap-3 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">{l.image ? <img src={l.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl">🍽️</div>}</div>
            <div className="min-w-0 flex-1">
              <Link to={`/product/${l.slug}`} className="font-bold">{l.name}</Link>
              <p className="truncate text-xs text-slate-500">{[...(l.variants || []).map((v) => v.label), ...(l.extras || [])].join(' · ')}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-lg ring-1 ring-slate-200">
                  <button onClick={() => setQty(l.key, l.quantity - 1)} className="p-1.5" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center text-sm font-bold">{l.quantity}</span>
                  <button onClick={() => setQty(l.key, l.quantity + 1)} className="p-1.5" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="font-bold text-brand">{rs(l.unit * l.quantity)}</span>
                <button onClick={() => remove(l.key)} className="p-1.5 text-red-500" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="card h-fit space-y-3 p-4 md:sticky md:top-20">
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input uppercase" />
          <button onClick={() => setApplied(code.trim())} className="btn-blue">Apply</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {quote && !error && applied && <p className="text-sm text-green-600">Coupon {applied.toUpperCase()} applied</p>}
        {loading && !quote ? <div className="skeleton h-28" /> : <Summary quote={quote} />}
        <button disabled={!quote} onClick={() => nav('/checkout', { state: { coupon: applied } })} className="btn-gold w-full">Proceed to Checkout</button>
      </aside>
    </div>
  );
}
