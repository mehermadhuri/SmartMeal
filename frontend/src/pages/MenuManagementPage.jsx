import { useEffect, useState } from 'react';
import { menuAPI, adminAPI } from '../api/api';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', price: '', category: 'TIFFIN', imageUrl: '', availableQuantity: 50, available: true };

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadMenus(); }, []);

  const loadMenus = async () => {
    setLoading(true);
    try { setMenus(await menuAPI.getAll() || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError(''); setSuccess(''); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item, price: item.price?.toString(), availableQuantity: item.availableQuantity?.toString() || '50' }); setShowForm(true); setError(''); setSuccess(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { setError('Name and price are required'); return; }
    setSaving(true);
    setError('');
    try {
      const body = { ...form, price: parseFloat(form.price), availableQuantity: parseInt(form.availableQuantity) || 50 };
      if (editing) {
        await adminAPI.updateMenu(editing.id, body);
        setSuccess('Menu item updated successfully');
      } else {
        await adminAPI.createMenu(body);
        setSuccess('Menu item created successfully');
      }
      setShowForm(false);
      loadMenus();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try { await adminAPI.deleteMenu(id); loadMenus(); }
    catch (err) { alert(err.message); }
  };

  const handleToggle = async (id) => {
    try { await adminAPI.toggleMenu(id); loadMenus(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>🍽️ Menu Management</h1>
            <p>Add, edit, and manage canteen menu items</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Item</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>{editing ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setShowForm(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Masala Dosa" />
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="45" min="0" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="TIFFIN">Tiffin</option>
                      <option value="LUNCH">Lunch</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Available Quantity</label>
                    <input type="number" className="form-control" value={form.availableQuantity} onChange={e => setForm({ ...form, availableQuantity: e.target.value })} min="0" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Description</label>
                    <input className="form-control" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Image URL</label>
                    <input className="form-control" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Item' : 'Create Item'}</button>
              </form>
            </div>
          </div>
        )}

        {loading ? <div className="spinner" /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {menus.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td><span className="badge badge-primary">{m.category}</span></td>
                    <td>₹{m.price}</td>
                    <td>{m.availableQuantity}</td>
                    <td><span className={`badge ${m.available ? 'badge-success' : 'badge-danger'}`}>{m.available ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleToggle(m.id)} title={m.available ? 'Disable' : 'Enable'}>{m.available ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
