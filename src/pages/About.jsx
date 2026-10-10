import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useSeo from '../hooks/useSeo';

export default function About() {
  const [s, setS] = useState(null);
  useSeo({ title: 'About us', description: 'Fresh bakery, sweets, fast food and meals made daily and delivered to your door.' });
  useEffect(() => { api.get('/settings').then((r) => setS(r.data.settings)).catch(() => {}); }, []);
  return (
    <div className="card mx-auto max-w-2xl space-y-3 p-6">
      <h1 className="text-2xl font-extrabold">About {s?.businessName || 'us'}</h1>
      <p className="text-slate-600">We bake, cook and deliver fresh food every day: bakery items, sweets, fast food and full meals, made to order and brought to your door.</p>
      {s?.address && <p className="text-sm text-slate-500">Find us at {s.address}.</p>}
      <div className="flex gap-3"><Link to="/menu" className="btn-gold">Order Now</Link><Link to="/contact" className="btn border border-slate-200">Contact</Link></div>
    </div>
  );
}
