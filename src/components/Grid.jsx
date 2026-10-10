import ProductCard from './ProductCard';

export default function Grid({ products, loading, empty = 'No items found.' }) {
  if (loading) return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-64" />)}</div>;
  if (!products.length) return <p className="py-16 text-center text-slate-500">{empty}</p>;
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>;
}
