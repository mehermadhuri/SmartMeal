import { useEffect, useState } from 'react';
import { menuAPI, adminAPI } from '../api/api';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  mealType: 'TIFFIN',
  imageUrl: '',
  availableQuantity: 50,
  available: true,
};

export default function MenuManagementPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const data = await menuAPI.getAll();
      setMenus(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...EMPTY_FORM,
      ...item,
      mealType: item.mealType || item.category || 'TIFFIN',
      price: item.price != null ? String(item.price) : '',
      availableQuantity:
        item.availableQuantity != null
          ? String(item.availableQuantity)
          : '50',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || form.price === '') {
      setError('Name and price are required');
      return;
    }

    const price = Number(form.price);
    const availableQuantity = Number(form.availableQuantity);

    if (!Number.isFinite(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    if (
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 0
    ) {
      setError('Available quantity must be a non-negative whole number');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body = {
        name: form.name.trim(),
        description: form.description || '',
        price,
        mealType: form.mealType,
        imageUrl: form.imageUrl || '',
        availableQuantity,
        available: form.available,
      };

      if (editing) {
        await adminAPI.updateMenu(editing.id, body);
        setSuccess('Menu item updated successfully');
      } else {
        await adminAPI.createMenu(body);
        setSuccess('Menu item created successfully');
      }

      setShowForm(false);
      await loadMenus();
    } catch (err) {
      setError(err.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;

    try {
      await adminAPI.deleteMenu(id);
      setSuccess('Menu item deleted successfully');
      await loadMenus();
    } catch (err) {
      setError(err.message || 'Failed to delete menu item');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleMenu(id);
      await loadMenus();
    } catch (err) {
      setError(err.message || 'Failed to update menu availability');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>🍽️ Menu Management</h1>
            <p>Add, edit, and manage canteen menu items</p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreate}
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h3>{editing ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  aria-label="Close menu form"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="menu-name">Name *</label>
                    <input
                      id="menu-name"
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g., Masala Dosa"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="menu-price">Price (₹) *</label>
                    <input
                      id="menu-price"
                      type="number"
                      className="form-control"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="45"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="menu-meal-type">Meal Category</label>
                    <select
                      id="menu-meal-type"
                      className="form-control"
                      value={form.mealType}
                      onChange={(e) =>
                        setForm({ ...form, mealType: e.target.value })
                      }
                    >
                      <option value="TIFFIN">Tiffin</option>
                      <option value="LUNCH">Lunch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="menu-quantity">Available Quantity</label>
                    <input
                      id="menu-quantity"
                      type="number"
                      className="form-control"
                      value={form.availableQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          availableQuantity: e.target.value,
                        })
                      }
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div
                    className="form-group"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <label htmlFor="menu-description">Description</label>
                    <input
                      id="menu-description"
                      className="form-control"
                      value={form.description || ''}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Short description"
                    />
                  </div>

                  <div
                    className="form-group"
                    style={{ gridColumn: '1 / -1' }}
                  >
                    <label htmlFor="menu-image">Image URL</label>
                    <input
                      id="menu-image"
                      type="url"
                      className="form-control"
                      value={form.imageUrl || ''}
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editing
                      ? 'Update Item'
                      : 'Create Item'}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : menus.length === 0 ? (
          <div className="card">
            <div className="card-body">
              No menu items found. Select Add Item to create one.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {menus.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>

                    <td>
                      <span className="badge badge-primary">
                        {m.mealType || m.category || '—'}
                      </span>
                    </td>

                    <td>₹{m.price}</td>
                    <td>{m.availableQuantity}</td>

                    <td>
                      <span
                        className={`badge ${
                          m.available ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {m.available ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(m)}
                          title="Edit menu item"
                          aria-label={`Edit ${m.name}`}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => handleToggle(m.id)}
                          title={m.available ? 'Disable' : 'Enable'}
                          aria-label={`${
                            m.available ? 'Disable' : 'Enable'
                          } ${m.name}`}
                        >
                          {m.available ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(m.id)}
                          title="Delete menu item"
                          aria-label={`Delete ${m.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
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