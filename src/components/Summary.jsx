import { rs } from '../services/api';

export default function Summary({ quote }) {
  if (!quote) return null;
  const Row = ({ k, v, cls = '' }) => <div className={`flex justify-between py-1 ${cls}`}><span>{k}</span><span>{v}</span></div>;
  return (
    <div className="text-sm">
      <Row k="Subtotal" v={rs(quote.subtotal)} />
      <Row k="Delivery" v={quote.deliveryFee ? rs(quote.deliveryFee) : 'Free'} />
      {quote.discount > 0 && <Row k="Discount" v={`- ${rs(quote.discount)}`} cls="text-green-600" />}
      {quote.tax > 0 && <Row k="Tax" v={rs(quote.tax)} />}
      <Row k="Total" v={rs(quote.total)} cls="mt-1 border-t pt-2 text-lg font-extrabold text-brand" />
    </div>
  );
}
