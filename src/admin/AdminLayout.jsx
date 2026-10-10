import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ClipboardList, CreditCard, Users, LogOut, Menu, Bell, Star, Ticket, Settings, MessageSquare, BadgePercent, BarChart3 } from 'lucide-react';
import { getSocket, closeSocket } from '../services/socket';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const items = [
  ['/admin/dashboard', 'Dashboard', LayoutDashboard], ['/admin/products', 'Products', Package], ['/admin/categories', 'Categories', Tags],
  ['/admin/orders', 'Orders', ClipboardList], ['/admin/payments', 'Payments', CreditCard], ['/admin/customers', 'Customers', Users],
  ['/admin/reviews', 'Reviews', Star], ['/admin/offers', 'Offers', BadgePercent], ['/admin/coupons', 'Coupons', Ticket], ['/admin/reports', 'Reports', BarChart3], ['/admin/inquiries', 'Inquiries', MessageSquare], ['/admin/settings', 'Settings', Settings],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const prev = useRef(null);
  const seen = useRef(new Set());
  const announce = (num, extra = '') => { if (num && seen.current.has(num)) return; num && seen.current.add(num); toast(`New order ${num || ''} ${extra}`, { icon: '🔔' }); };

  // New-order notification: poll pending orders; toast + badge when the count rises
  useEffect(() => {
    const poll = () => api.get('/admin/orders', { params: { status: 'pending', limit: 1 } }).then((r) => {
      const n = r.data.total;
      if (prev.current !== null && n > prev.current) announce(r.data.orders[0]?.orderNumber);
      prev.current = n; setPending(n);
    }).catch(() => {});
    poll();
    const t = setInterval(poll, 30000); // fallback; sockets deliver instantly
    const sock = getSocket();
    const onNew = (o) => { announce(o.orderNumber, `· ${o.customer} · Rs. ${o.total.toLocaleString('en-PK')} · ${o.paymentMethod.toUpperCase()}`); poll(); };
    sock.on('order:new', onNew);
    return () => { clearInterval(t); sock.off('order:new', onNew); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 transform bg-brand-dark text-white transition md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 text-xl font-extrabold">Fresh<span className="text-gold">Bite</span> <span className="text-xs font-normal text-white/50">admin</span></div>
        <nav className="space-y-1 px-3">
          {items.map(([to, text, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-gold text-brand-dark' : 'text-white/80 hover:bg-white/10'}`}>
              <Icon className="h-4 w-4" />{text}
              {text === 'Orders' && pending > 0 && <span className="ml-auto rounded-full bg-red-500 px-2 text-xs font-bold text-white">{pending}</span>}
            </NavLink>
          ))}
          <button onClick={async () => { closeSocket(); await logout(); nav('/admin/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10"><LogOut className="h-4 w-4" />Logout</button>
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <button onClick={() => nav('/admin/orders')} className="relative" aria-label="Pending orders"><Bell className="h-5 w-5" />{pending > 0 && <span className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{pending}</span>}</button>
            <span className="font-semibold">{user.name} <span className="text-xs font-normal capitalize text-slate-500">({user.role})</span></span>
          </div>
        </header>
        <main className="p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
