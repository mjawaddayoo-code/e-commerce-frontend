import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { ImageUpload } from './ui';

// One settings document, two admin pages: /admin/settings (business) and /admin/delivery
export default function Settings({ section }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  document.title = section === 'delivery' ? 'Delivery settings' : 'Business settings';
  useEffect(() => { api.get('/admin/settings').then((r) => setS(r.data.settings)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!s) return <div className="skeleton h-64" />;

  const set = (k, num) => (e) => setS({ ...s, [k]: num ? Number(e.target.value) : e.target.value });
  const social = (k) => (e) => setS({ ...s, social: { ...s.social, [k]: e.target.value } });

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = section === 'delivery'
      ? { deliveryFee: s.deliveryFee, freeDeliveryThreshold: s.freeDeliveryThreshold, estimatedDeliveryMinutes: s.estimatedDeliveryMinutes, taxPercent: s.taxPercent, deliveryAreas: (s.deliveryAreas || []).map((a) => ({ name: a.name, fee: Number(a.fee), active: a.active !== false })) }
      : { businessName: s.businessName, phone: s.phone || '', whatsapp: s.whatsapp || '', email: s.email || '', address: s.address || '', openingTime: s.openingTime, closingTime: s.closingTime, googleMapsEmbedUrl: s.googleMapsEmbedUrl || '', social: { facebook: s.social?.facebook || '', instagram: s.social?.instagram || '', tiktok: s.social?.tiktok || '' }, ...(s.logo?.url && { logo: { url: s.logo.url, publicId: s.logo.publicId } }) };
    try { const r = await api.put('/admin/settings', body); setS(r.data.settings); toast.success('Settings saved'); } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-4 p-5">
      <h1 className="text-2xl font-extrabold">{section === 'delivery' ? 'Delivery' : 'Business settings'}</h1>
      {section === 'delivery' ? <>
        <div className="grid grid-cols-2 gap-3">
          <F label="Delivery fee (Rs.)"><input type="number" min="0" className="input" value={s.deliveryFee} onChange={set('deliveryFee', true)} /></F>
          <F label="Free delivery above (Rs.)"><input type="number" min="0" className="input" value={s.freeDeliveryThreshold} onChange={set('freeDeliveryThreshold', true)} /></F>
          <F label="Estimated delivery (min)"><input type="number" min="5" className="input" value={s.estimatedDeliveryMinutes} onChange={set('estimatedDeliveryMinutes', true)} /></F>
          <F label="Tax (%)"><input type="number" min="0" max="30" className="input" value={s.taxPercent} onChange={set('taxPercent', true)} /></F>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Delivery areas</p>
          {(s.deliveryAreas || []).map((a, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="Area (e.g. Sukkur)" value={a.name} onChange={(e) => setS({ ...s, deliveryAreas: s.deliveryAreas.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} />
              <input type="number" min="0" className="input !w-28" placeholder="Fee" value={a.fee} onChange={(e) => setS({ ...s, deliveryAreas: s.deliveryAreas.map((x, k) => (k === i ? { ...x, fee: e.target.value } : x)) })} />
              <button type="button" onClick={() => setS({ ...s, deliveryAreas: s.deliveryAreas.filter((_, k) => k !== i) })} aria-label="Remove"><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setS({ ...s, deliveryAreas: [...(s.deliveryAreas || []), { name: '', fee: 0 }] })} className="btn border border-slate-200 !py-1.5 text-sm"><Plus className="h-4 w-4" />Add area</button>
        </div>
      </> : <>
        <ImageUpload folder="branding" value={s.logo} onChange={(logo) => setS({ ...s, logo })} />
        <F label="Business name"><input required className="input" value={s.businessName || ''} onChange={set('businessName')} /></F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Phone"><input className="input" value={s.phone || ''} onChange={set('phone')} /></F>
          <F label="WhatsApp"><input className="input" value={s.whatsapp || ''} onChange={set('whatsapp')} /></F>
          <F label="Opening time"><input type="time" className="input" value={s.openingTime} onChange={set('openingTime')} /></F>
          <F label="Closing time"><input type="time" className="input" value={s.closingTime} onChange={set('closingTime')} /></F>
        </div>
        <F label="Email"><input type="email" className="input" value={s.email || ''} onChange={set('email')} /></F>
        <F label="Address"><input className="input" value={s.address || ''} onChange={set('address')} /></F>
        <F label="Google Maps embed URL (https://www.google.com/maps/embed?...)"><input className="input" value={s.googleMapsEmbedUrl || ''} onChange={set('googleMapsEmbedUrl')} /></F>
        <div className="grid grid-cols-3 gap-3">{['facebook', 'instagram', 'tiktok'].map((k) => <F key={k} label={k[0].toUpperCase() + k.slice(1)}><input className="input" value={s.social?.[k] || ''} onChange={social(k)} /></F>)}</div>
      </>}
      <button disabled={busy} className="btn-blue">{busy ? 'Saving...' : 'Save settings'}</button>
    </form>
  );
}

function F({ label, children }) {
  return <label className="block text-sm"><span className="font-semibold">{label}</span><div className="mt-1">{children}</div></label>;
}
