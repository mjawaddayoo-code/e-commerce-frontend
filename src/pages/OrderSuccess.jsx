import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api, { rs } from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  document.title = 'Order Placed';

  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch(() => setErr('Order not found.')); }, [id]);

  if (err) return <p className="py-20 text-center text-slate-500">{err}</p>;
  if (!order) return <div className="skeleton h-72" />;

  return (
    <div className="card mx-auto max-w-xl space-y-4 p-6">
      <div className="text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-green-500" /><h1 className="mt-2 text-2xl font-extrabold">Order Placed Successfully!</h1><p className="text-slate-500">Order <b className="text-brand">{order.orderNumber}</b></p></div>
      <div className="space-y-1 text-sm">
        {order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{rs(i.lineTotal)}</span></div>)}
        <div className="flex justify-between border-t pt-2 text-lg font-extrabold text-brand"><span>Total</span><span>{rs(order.total)}</span></div>
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        <p><b>{order.customer.name}</b> · {order.customer.phone}</p>
        <p>{order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}</p>
        <p className="mt-1">Payment: Cash on Delivery ({order.paymentStatus}) · Status: <b className="capitalize">{order.orderStatus.replace(/_/g, ' ')}</b></p>
        <p>Estimated delivery: {new Date(order.estimatedDeliveryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <Link to="/menu" className="btn-gold w-full">Continue Shopping</Link>
    </div>
  );
}
