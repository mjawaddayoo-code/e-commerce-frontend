import { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

// line = { key, product (id), name, slug, image, unit, quantity, variants:[{name,label}], extras:[name] }
const KEY = 'cart_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const lineKey = (l) => `${l.product}|${(l.variants || []).map((v) => v.label).join(',')}|${[...(l.extras || [])].sort().join(',')}`;

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const [lines, setLines] = useState(load);
  const synced = useRef(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines]);

  // On login: merge server cart into local cart once
  useEffect(() => {
    if (loading) return;
    if (!user) { synced.current = false; return; }
    api.get('/cart').then((r) => {
      const server = r.data.items.map((i) => ({
        product: i.product._id, name: i.product.name, slug: i.product.slug, image: i.product.images?.[0]?.url,
        unit: i.product.discountPrice || i.product.price, quantity: i.quantity, variants: i.variants, extras: i.extras,
      })).map((l) => ({ ...l, key: lineKey(l) }));
      setLines((local) => {
        const map = new Map(server.map((l) => [l.key, l]));
        local.forEach((l) => map.set(l.key, map.has(l.key) ? { ...l, quantity: Math.max(l.quantity, map.get(l.key).quantity) } : l));
        return [...map.values()];
      });
    }).catch(() => {}).finally(() => { synced.current = true; });
  }, [user, loading]);

  // Persist to server (debounced) for logged-in users
  useEffect(() => {
    if (!user || !synced.current) return;
    const t = setTimeout(() => {
      api.put('/cart', { items: lines.map((l) => ({ product: l.product, quantity: l.quantity, variants: l.variants, extras: l.extras })) }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [lines, user]);

  const add = (line) => {
    const key = lineKey(line);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      return found ? prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(l.quantity + line.quantity, 50) } : l)) : [...prev, { ...line, key }];
    });
    toast.success(`${line.name} added to cart`);
  };
  const setQty = (key, q) => setLines((p) => (q < 1 ? p.filter((l) => l.key !== key) : p.map((l) => (l.key === key ? { ...l, quantity: Math.min(q, 50) } : l))));
  const remove = (key) => setLines((p) => p.filter((l) => l.key !== key));
  const clear = () => setLines([]);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const apiItems = lines.map((l) => ({ product: l.product, quantity: l.quantity, variants: l.variants, extras: l.extras }));

  return <Ctx.Provider value={{ lines, add, setQty, remove, clear, count, apiItems }}>{children}</Ctx.Provider>;
}
