import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmProvider';
import api, { errMsg, rs } from '../services/api';
import { Badge, ImageUpload, Modal, Pager, Table, useFetch } from './ui';

const variantsToText = (v = []) => v.map((g) => `${g.name}: ${g.options.map((o) => o.label + (o.priceDelta ? ` +${o.priceDelta}` : '')).join(', ')}`).join('\n');
const extrasToText = (e = []) => e.map((x) => `${x.name}${x.price ? ` +${x.price}` : ''}`).join('\n');
const parseVariants = (t) => String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
  const [name, rest = ''] = [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1)];
  const options = rest.split(',').map((o) => o.trim()).filter(Boolean).map((o) => { const m = o.match(/^(.*?)\s*(?:\+\s*(\d+))?$/); return { label: m[1], priceDelta: Number(m[2] || 0) }; });
  return { name: name.trim(), options };
}).filter((g) => g.name && g.options.length);
const parseExtras = (t) => String(t || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const m = l.match(/^(.*?)\s*(?:\+\s*(\d+))?$/); return { name: m[1], price: Number(m[2] || 0) }; });

const blank = { variantsText: '', extrasText: '', offerExpiresAt: '',  name: '', category: '', price: '', discountPrice: '', stock: 0, sku: '', prepTimeMinutes: 20, description: '', ingredients: '', images: [], featured: false, active: true };

export default function Products({ offers }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch('/products', { all: true, search: search || undefined, page, limit: 10, sort: 'newest', discount: offers ? true : undefined });
  const cats = useFetch('/categories', { all: true });
  const confirm = useConfirm();
  document.title = 'Products';

  const toggle = async (p) => { try { await api.put(`/products/${p._id}`, { active: !p.active }); reload(true); } catch (e) { toast.error(errMsg(e)); } };
  const del = async (p) => {
    if (!(await confirm(`Delete "${p.name}"? This cannot be undone.`))) return;
    try { await api.delete(`/products/${p._id}`); toast.success('Product deleted'); reload(true); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{offers ? 'Offers & discounts' : 'Products'}</h1>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="input ml-auto !w-56" />
        <button onClick={() => setEditing(blank)} className="btn-blue"><Plus className="h-4 w-4" />Add product</button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-64" /> : (
        <Table head={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']} empty={!data?.products.length && 'No products found'}>
          {data?.products.map((p) => (
            <tr key={p._id}>
              <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">{p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}</div><span className="font-semibold">{p.name}</span></div></td>
              <td className="px-3 py-2">{p.category?.name}</td>
              <td className="px-3 py-2">{p.discountPrice ? <><b>{rs(p.discountPrice)}</b> <s className="text-xs text-slate-400">{rs(p.price)}</s></> : rs(p.price)}</td>
              <td className={`px-3 py-2 ${p.stock <= p.lowStockThreshold ? 'font-bold text-red-600' : ''}`}>{p.stock}</td>
              <td className="px-3 py-2"><button onClick={() => toggle(p)} title="Click to toggle"><Badge s={p.active ? 'active' : 'disabled'} /></button></td>
              <td className="px-3 py-2"><div className="flex gap-2"><button onClick={() => setEditing({ ...p, category: p.category?._id, discountPrice: p.discountPrice ?? '', ingredients: (p.ingredients || []).join(', '), variantsText: variantsToText(p.variants), extrasText: extrasToText(p.extras), offerExpiresAt: p.offerExpiresAt ? String(p.offerExpiresAt).slice(0, 10) : '' })} aria-label="Edit"><Pencil className="h-4 w-4 text-brand" /></button><button onClick={() => del(p)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={page} pages={data?.pages || 1} onChange={setPage} />
      {editing && <ProductForm initial={editing} categories={cats.data?.categories || []} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(true); }} />}
    </div>
  );
}

function ProductForm({ initial, categories, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = {
      name: f.name, category: f.category, description: f.description, price: Number(f.price),
      discountPrice: f.discountPrice === '' ? null : Number(f.discountPrice),
      stock: Number(f.stock), prepTimeMinutes: Number(f.prepTimeMinutes),
      ingredients: String(f.ingredients).split(',').map((s) => s.trim()).filter(Boolean),
      images: (f.images || []).map(({ url, publicId }) => ({ url, publicId })),
      variants: parseVariants(f.variantsText), extras: parseExtras(f.extrasText), offerExpiresAt: f.offerExpiresAt || null,
      featured: f.featured, active: f.active, ...(f.sku && { sku: f.sku }),
    };
    try {
      if (f._id) await api.put(`/products/${f._id}`, body); else await api.post('/products', body);
      toast.success('Product saved'); onSaved();
    } catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };

  return (
    <Modal title={f._id ? 'Edit product' : 'New product'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Images ({(f.images || []).length}/5, first one is the main photo)</p>
          <div className="flex flex-wrap gap-2">
            {(f.images || []).map((im, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                <img src={im.url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, k) => k !== i) })} aria-label="Remove image" className="absolute right-0 top-0 rounded-bl-lg bg-black/60 px-1.5 text-xs text-white">✕</button>
              </div>
            ))}
          </div>
          {(f.images || []).length < 5 && <ImageUpload key={(f.images || []).length} folder="products" onChange={(im) => setF({ ...f, images: [...(f.images || []), im] })} />}
        </div>
        <input required placeholder="Name" value={f.name} onChange={set('name')} className="input" />
        <select required value={f.category} onChange={set('category')} className="input"><option value="">Select category</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" min="0" placeholder="Price (Rs.)" value={f.price} onChange={set('price')} className="input" />
          <input type="number" min="0" placeholder="Discount price" value={f.discountPrice} onChange={set('discountPrice')} className="input" />
          <input type="number" min="0" placeholder="Stock" value={f.stock} onChange={set('stock')} className="input" />
          <input type="number" min="0" placeholder="Prep time (min)" value={f.prepTimeMinutes} onChange={set('prepTimeMinutes')} className="input" />
        </div>
        <input placeholder="SKU (optional)" value={f.sku || ''} onChange={set('sku')} className="input" />
        <textarea rows={3} placeholder="Description" value={f.description} onChange={set('description')} className="input" />
        <input placeholder="Ingredients (comma separated)" value={f.ingredients} onChange={set('ingredients')} className="input" />
        <label className="block text-sm"><span className="font-semibold">Offer expires on (optional)</span><input type="date" value={f.offerExpiresAt} onChange={set('offerExpiresAt')} className="input mt-1" /></label>
        <label className="block text-sm"><span className="font-semibold">Options, one group per line</span><textarea rows={3} placeholder={'Size: Small, Medium +100, Large +250'} value={f.variantsText} onChange={set('variantsText')} className="input mt-1" /></label>
        <label className="block text-sm"><span className="font-semibold">Extras, one per line</span><textarea rows={3} placeholder={'Extra cheese +80\nExtra sauce +30'} value={f.extrasText} onChange={set('extrasText')} className="input mt-1" /></label>
        <div className="flex gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={set('featured')} />Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={f.active} onChange={set('active')} />Active</label></div>
        <button disabled={busy} className="btn-blue w-full">{busy ? 'Saving...' : 'Save product'}</button>
      </form>
    </Modal>
  );
}
