import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Plus, Heart, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { rs } from '../services/api';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const price = p.discountPrice || p.price;
  const [added, setAdded] = useState(false);
  const quickAdd = () => {
    add({ product: p._id, name: p.name, slug: p.slug, image: p.images?.[0]?.url, unit: price, quantity: 1, variants: [], extras: [] });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };
  const hasOptions = p.variants?.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link to={`/product/${p.slug}`} className="relative block aspect-[4/3] bg-slate-100">
        {p.images?.[0]?.url
          ? <img src={p.images[0].url} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
          : <div className="flex h-full items-center justify-center text-4xl">🍽️</div>}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(p._id); }} aria-label="Wishlist" className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow"><Heart className={`h-4 w-4 ${ids.has(p._id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} /></button>
        {p.percentOff > 0 && <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{p.percentOff}% OFF</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-slate-500">{p.category?.name}</p>
        <Link to={`/product/${p.slug}`} className="font-bold leading-tight hover:text-brand">{p.name}</Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{p.numReviews ? `${p.rating.toFixed(1)} (${p.numReviews})` : 'New'}</div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-extrabold text-brand">{rs(price)}</p>
            {p.discountPrice && <p className="text-xs text-slate-400 line-through">{rs(p.price)}</p>}
          </div>
          {p.stock < 1 ? <span className="text-sm font-semibold text-red-500">Sold out</span>
            : hasOptions ? <Link to={`/product/${p.slug}`} className="btn-blue !px-3 !py-2 text-sm">Customize</Link>
            : <button onClick={quickAdd} className={`btn !px-3 !py-2 text-sm ${added ? 'bg-green-600 text-white' : 'bg-gold text-brand-dark'}`}>{added ? <><Check className="h-4 w-4" />Added</> : <><Plus className="h-4 w-4" />Add</>}</button>}
        </div>
      </div>
    </motion.div>
  );
}
