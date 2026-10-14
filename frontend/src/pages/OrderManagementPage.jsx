import { useEffect, useState } from 'react';
import { adminAPI } from '../api/api';
import { RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['PENDING_PAYMENT', 'PAYMENT_VERIFICATION_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COLLECTED', 'CANCELLED'];
const STATUS_COLORS = {
  PENDING_PAYMENT:              'badge-warning',
  PAYMENT_VERIFICATION_PENDING: 'badge-warning',
  CONFIRMED:                    'badge-primary',
  PREPARING:                    'badge-primary',
  READY_FOR_PICKUP:             'badge-success',
  COLLECTED:                    'badge-success',
  CANCELLED:                    'badge-danger',
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      setOrders(await adminAPI.getOrders(params) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      loadOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>📦 Order Management</h1>
            <p>View and update all student orders</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadOrders}><RefreshCw size={16} /> Refresh</button>
        </div>

        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${filter === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('')}>All</button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <div className="empty-state"><h3>No orders found</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>ID</th><th>Student</th><th>Items</th><th>Category/Slot</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Update Status</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.orderNumber || o.id}</td>
                    <td style={{ fontSize: '0.88rem' }}>{o.user?.name}<br /><span style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>{o.user?.rollNumber}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{o.items?.map(i => `${i.menuName}×${i.quantity}`).join(', ')}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <div>{o.mealCategory || '—'}</div>
                      <div style={{ color: 'var(--gray-500)' }}>{o.pickupSlot || '—'}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{o.totalAmount}</td>
                    <td><span className={`badge ${o.paymentStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{o.paymentStatus || 'PENDING'}</span></td>
                    <td><span className={`badge ${STATUS_COLORS[o.orderStatus] || 'badge-primary'}`}>{o.orderStatus}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
                        value={o.orderStatus}
                        disabled={updating === o.id}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
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
