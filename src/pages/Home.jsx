import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Grid from '../components/Grid';
import useSeo from '../hooks/useSeo';

export default function Home() {
  const [cats, setCats] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hash } = useLocation();
  useSeo({ title: 'Order Fresh Food Online', description: 'Delicious bakery, sweets, fast food and meals delivered to your door.' });

  // Header "Categories" link goes to /#categories
  useEffect(() => { if (hash === '#categories') document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }, [hash, cats.length]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products?featured=true&limit=8')])
      .then(([c, p]) => { setCats(c.data.categories); setFeatured(p.data.products); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-white md:px-12 md:py-16">
        <h1 className="max-w-lg text-4xl font-extrabold leading-tight md:text-5xl">Fresh Taste. <span className="text-gold">Fast Delivery.</span></h1>
        <p className="mt-3 max-w-md text-white/80">Delicious bakery, sweets, fast food and meals delivered to your door.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/menu" className="btn-gold">Order Now</Link>
          <Link to="/menu" className="btn border border-white/30 text-white hover:bg-white/10">Explore Menu</Link>
        </div>
      </section>

      <section id="categories" className="scroll-mt-20">
        <h2 className="mb-3 text-xl font-bold">Categories</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {cats.map((c) => (
            <Link key={c._id} to={`/category/${c.slug}`} className="card overflow-hidden text-center transition hover:-translate-y-1 hover:shadow-md">
              <div className="aspect-square bg-slate-100">{c.image?.url ? <img src={c.image.url} alt={c.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🍴</div>}</div>
              <p className="px-1 pt-2 text-sm font-semibold">{c.name}</p>
              <p className="pb-2 text-xs text-slate-500">{c.itemCount} items</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Featured</h2><Link to="/menu" className="text-sm font-semibold text-brand">View all</Link></div>
        <Grid products={featured} loading={loading} empty="No featured items yet." />
      </section>
    </div>
  );
}
