import { useState } from 'react';
import SearchBox from './SearchBox';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu as MenuIcon, X, User, LogOut, Heart, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const baseLinks = [['/', 'Home'], ['/menu', 'Menu'], ['/#categories', 'Categories'], ['/offers', 'Offers'], ['/about', 'About'], ['/contact', 'Contact']];
const userLinks = [['/orders', 'My Orders'], ['/wishlist', 'Wishlist'], ['/account', 'Account']];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const mobileLinks = user ? [...baseLinks, ...userLinks] : baseLinks;

  return (
    <header className="sticky top-0 z-40 bg-brand text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">Fresh<span className="text-gold">Bite</span></Link>
        <nav className="ml-6 hidden gap-5 md:flex">
          {baseLinks.map(([to, label]) => to.includes('#')
            ? <Link key={to} to={to} className="font-medium hover:text-gold">{label}</Link>
            : <NavLink key={to} to={to} end className={({ isActive }) => `font-medium hover:text-gold ${isActive ? 'text-gold' : ''}`}>{label}</NavLink>)}
        </nav>
        <SearchBox className="ml-auto hidden max-w-[11rem] flex-1 lg:max-w-xs md:block" />
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <Link to="/cart" className="relative p-1" aria-label="Cart">
            <ShoppingCart />
            {count > 0 && <motion.span key={count} initial={{ scale: 1.8 }} animate={{ scale: 1 }} className="absolute -right-2 -top-1 rounded-full bg-gold px-1.5 text-xs font-bold text-brand-dark">{count}</motion.span>}
          </Link>
          {user ? (
            <div className="hidden items-center gap-3 text-sm md:flex">
              <Link to="/wishlist" aria-label="Wishlist" title="Wishlist"><Heart className="h-5 w-5" /></Link>
              <Link to="/orders" aria-label="My orders" title="My orders"><Package className="h-5 w-5" /></Link>
              <Link to="/account" className="flex items-center gap-1 hover:text-gold"><User className="h-4 w-4" />{user.name.split(' ')[0]}</Link>
              <button onClick={logout} aria-label="Log out" title="Log out"><LogOut className="h-4 w-4" /></button>
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-brand-dark md:block">Login</Link>
          )}
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <MenuIcon />}</button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-white/10 px-4 pb-4 pt-3 md:hidden">
          <SearchBox onDone={() => setOpen(false)} />
          {mobileLinks.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="block py-1 font-medium">{label}</Link>)}
          {user ? <button onClick={() => { logout(); setOpen(false); }} className="block py-1 font-medium">Log out</button>
                : <Link to="/login" onClick={() => setOpen(false)} className="block py-1 font-bold text-gold">Login / Sign up</Link>}
        </div>
      )}
    </header>
  );
}
