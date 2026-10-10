import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { rs } from '../services/api';
import { useCart } from '../context/CartContext';
import { label, statusColor } from '../utils/constants';

export const reorderLines = (order) => order.items.map((i) => ({
  product: i.product, name: i.name, slug: i.product, image: i.image, unit: i.unitPrice, quantity: i.quantity,
  variants: (i.variants || []).map((v) => ({ name: v.name, label: v.label })), extras: (i.extras || []).map((e) => e.name),
}));

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const { add } = useCart();
  const nav = useNavigate();
  document.title = 'My Orders';

  useEffect(() => {
    const load = () => api.get('/orders/my').then((r) => setOrders(r.data.orders)).catch(() => setOrders([]));
    load();
    const t = setInterval(load, 20000); // keeps statuses fresh
    return () => clearInterval(t);
  }, []);

  if (!orders) return <div className="skeleton h-64" />;
  if (!orders.length) return <div className="py-20 text-center"><p className="text-lg font-semibold">No orders yet</p><Link to="/menu" className="btn-gold mt-4">Order something tasty</Link></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h1 className="text-2xl font-extrabold">My Orders</h1>
      {orders.map((o) => (
        <div key={o._id} className="card space-y-2 p-4">
          <div className="flex items-start justify-between">
            <div><p className="font-bold">{o.orderNumber}</p><p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p></div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(o.orderStatus)}`}>{label(o.orderStatus)}</span>
          </div>
          <p className="text-sm text-slate-600">{o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-extrabold text-brand">{rs(o.total)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(o.paymentStatus)}`}>Payment {o.paymentStatus}</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/orders/${o._id}`} className="btn-blue flex-1 !py-2 text-sm">View Details</Link>
            <button onClick={() => { reorderLines(o).forEach((l) => add(l)); nav('/cart'); }} className="btn-gold flex-1 !py-2 text-sm">Reorder</button>
          </div>
        </div>
      ))}
    </div>
  );
}
