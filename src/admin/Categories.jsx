import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmProvider';
import api, { errMsg } from '../services/api';
import { Badge, ImageUpload, Modal, Table, useFetch } from './ui';

export default function Categories() {
  const { data, loading, error, reload } = useFetch('/categories', { all: true });
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();
  document.title = 'Categories';

  const del = async (c) => {
    if (!(await confirm(`Delete category "${c.name}"?`))) return;
    try { await api.delete(`/categories/${c._id}`); toast.success('Category deleted'); reload(true); } catch (e) { toast.error(errMsg(e)); }
  };
  const toggle = async (c) => { try { await api.put(`/categories/${c._id}`, { active: !c.active }); reload(true); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center"><h1 className="text-2xl font-extrabold">Categories</h1><button onClick={() => setEditing({ name: '', description: '', active: true })} className="btn-blue ml-auto"><Plus className="h-4 w-4" />Add category</button></div>
      {error && <p className="text-red-600">{error}</p>}
      {loading && !data ? <div className="skeleton h-48" /> : (
        <Table head={['Category', 'Items', 'Status', 'Actions']} empty={!data?.categories.length && 'No categories yet'}>
          {data?.categories.map((c) => (
            <tr key={c._id}>
              <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">{c.image?.url && <img src={c.image.url} alt="" className="h-full w-full object-cover" />}</div><span className="font-semibold">{c.name}</span></div></td>
              <td className="px-3 py-2">{c.itemCount}</td>
              <td className="px-3 py-2"><button onClick={() => toggle(c)}><Badge s={c.active ? 'active' : 'disabled'} /></button></td>
              <td className="px-3 py-2"><div className="flex gap-2"><button onClick={() => setEditing(c)} aria-label="Edit"><Pencil className="h-4 w-4 text-brand" /></button><button onClick={() => del(c)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td>
            </tr>
          ))}
        </Table>
      )}
      {editing && <CategoryForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(true); }} />}
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { name: f.name, description: f.description || undefined, active: f.active, ...(f.image?.url && { image: { url: f.image.url, publicId: f.image.publicId } }) };
    try { if (f._id) await api.put(`/categories/${f._id}`, body); else await api.post('/categories', body); toast.success('Category saved'); onSaved(); }
    catch (ex) { toast.error(errMsg(ex)); } finally { setBusy(false); }
  };
  return (
    <Modal title={f._id ? 'Edit category' : 'New category'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <ImageUpload folder="categories" value={f.image} onChange={(image) => setF({ ...f, image })} />
        <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
        <input placeholder="Description (optional)" value={f.description || ''} onChange={(e) => setF({ ...f, description: e.target.value })} className="input" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Active</label>
        <button disabled={busy} className="btn-blue w-full">{busy ? 'Saving...' : 'Save category'}</button>
      </form>
    </Modal>
  );
}
