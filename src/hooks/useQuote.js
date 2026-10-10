import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

// Totals always come from the server (never calculated trusting the browser)
export default function useQuote(items, couponCode, area) {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sig = JSON.stringify(items) + (couponCode || '') + (area || '');

  useEffect(() => {
    if (!items.length) { setQuote(null); setError(''); return; }
    setLoading(true);
    const t = setTimeout(() => {
      api.post('/orders/quote', { items, couponCode: couponCode || undefined, area: area || undefined })
        .then((r) => { setQuote(r.data); setError(''); })
        .catch((e) => { setQuote(null); setError(errMsg(e)); })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [sig]);

  return { quote, error, loading };
}
