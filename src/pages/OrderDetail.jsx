import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { rs } from '../services/api';
import { getSocket } from '../services/socket';
import OrderTracker from '../components/OrderTracker';
import { label } from '../utils/constants';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  document.title = 'Order tracking';

  useEffect(() => {
    let last;
    const load = () => api.get(`/orders/${id}`).then((r) => {
      if (last && last !== r.data.order.orderStatus) toast(`Your order is now ${label(r.data.order.orderStatus).toLowerCase()}`);
      last = r.data.order.orderStatus; setOrder(r.data.order);
    }).catch(() => setErr('Order not found.'));
    load();
    const sock = getSocket();
    const onStatus = (e) => e.orderId === id && load();
    sock.on('order:status', onStatus);
    const t = setInterval(load, 30000); // fallback if the socket drops
    return () => { clearInterval(t); sock.off('order:status', onStatus); };
  }, [id]);

  if (err) return <p className="py-20 text-center text-slate-500">{err}</p>;
  if (!order) return <div className="skeleton h-72" />;

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      <div className="card p-5"><h1 className="mb-4 font-extrabold">Order {order.orderNumber}</h1><OrderTracker status={order.orderStatus} /></div>
      <div className="card space-y-3 p-5 text-sm">
        {order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.name} × {i.quantity}<br /><span className="text-xs text-slate-500">{[...(i.variants || []).map((v) => v.label), ...(i.extras || []).map((e) => e.name)].join(' · ')}</span></span><span>{rs(i.lineTotal)}</span></div>)}
        <div className="border-t pt-2">
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee ? rs(order.deliveryFee) : 'Free'}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {rs(order.discount)}</span></div>}
          <div className="flex justify-between text-lg font-extrabold text-brand"><span>Total</span><span>{rs(order.total)}</span></div>
        </div>
        <p className="rounded-xl bg-slate-50 p-3">{order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}<br />Payment: Cash on Delivery ({order.paymentStatus})</p>
      </div>
    </div>
  );
}
