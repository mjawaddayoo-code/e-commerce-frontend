import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Grid from '../components/Grid';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ids } = useWishlist();
  document.title = 'My Wishlist';

  useEffect(() => { api.get('/wishlist').then((r) => setProducts(r.data.products)).finally(() => setLoading(false)); }, []);
  const shown = products.filter((p) => ids.has(p._id)); // un-hearting removes it instantly

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">My Wishlist</h1>
      <Grid products={shown} loading={loading} empty="Your wishlist is empty. Tap the heart on any item to save it." />
      {!loading && !shown.length && <div className="text-center"><Link to="/menu" className="btn-gold">Browse Menu</Link></div>}
    </div>
  );
}
