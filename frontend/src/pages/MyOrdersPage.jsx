import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api/api';
import { Receipt, XCircle, Eye } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-primary',
  READY: 'badge-success',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderAPI.getMy();
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(id);
    try {
      await orderAPI.cancel(id, 'Cancelled by student');
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const canCancel = (order) => ['PENDING', 'CONFIRMED'].includes(order.status);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><Receipt size={28} /> My Orders</h1>
          <p>View and manage your meal bookings</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <Receipt size={56} />
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. Start by browsing the menu!</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: 700 }}>Order #{order.id}</h3>
                        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-primary'}`}>{order.status}</span>
                        <span className={`badge ${order.paymentStatus === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {order.paymentStatus || 'PENDING'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                        {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                      <div style={{ marginTop: '0.5rem' }}>
                        {order.items?.slice(0, 3).map(item => (
                          <span key={item.id} style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginRight: '0.75rem' }}>
                            {item.menuName} × {item.quantity}
                          </span>
                        ))}
                        {order.items?.length > 3 && <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>+{order.items.length - 3} more</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{order.totalAmount}</span>
                      <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline btn-sm">
                        <Eye size={16} /> Receipt
                      </Link>
                      {canCancel(order) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order.id)} disabled={cancelling === order.id}>
                          <XCircle size={16} /> {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
