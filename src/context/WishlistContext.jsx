import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);
export const useWishlist = () => useContext(Ctx);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) return setIds(new Set());
    api.get('/wishlist').then((r) => setIds(new Set(r.data.products.map((p) => p._id)))).catch(() => {});
  }, [user]);

  const toggle = async (id) => {
    if (!user) return toast('Please log in to use your wishlist');
    const has = ids.has(id);
    const next = new Set(ids); has ? next.delete(id) : next.add(id);
    setIds(next); // optimistic
    try { await (has ? api.delete(`/wishlist/${id}`) : api.put(`/wishlist/${id}`)); }
    catch (e) { setIds(ids); toast.error(errMsg(e)); }
  };
  return <Ctx.Provider value={{ ids, toggle }}>{children}</Ctx.Provider>;
}
