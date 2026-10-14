import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api/api';
import { Receipt, XCircle, Eye, CreditCard } from 'lucide-react';

// Matches actual OrderStatus enum values from backend
const STATUS_COLORS = {
  PENDING_PAYMENT:               'badge-warning',
  PAYMENT_VERIFICATION_PENDING:  'badge-warning',
  CONFIRMED:                     'badge-primary',
  PREPARING:                     'badge-primary',
  READY_FOR_PICKUP:              'badge-success',
  COLLECTED:                     'badge-success',
  CANCELLED:                     'badge-danger',
};

const STATUS_LABELS = {
  PENDING_PAYMENT:               '⏳ Pending Payment',
  PAYMENT_VERIFICATION_PENDING:  '🔍 Verifying Payment',
  CONFIRMED:                     '✅ Confirmed',
  PREPARING:                     '👨‍🍳 Preparing',
  READY_FOR_PICKUP:              '🛎️ Ready for Pickup',
  COLLECTED:                     '✔️ Collected',
  CANCELLED:                     '❌ Cancelled',
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

  // Allow cancel for orders in preparation or pending payment
  const canCancel = (order) =>
    ['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING'].includes(order.orderStatus);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><Receipt size={28} /> My Orders</h1>
          <p>View and manage your meal bookings & official receipts</p>
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
            {orders.map(order => {
              const isPaid = order.paymentStatus === 'PAID';
              const isPendingPayment = order.orderStatus === 'PENDING_PAYMENT';

              return (
                <div key={order.id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontWeight: 700 }}>
                            {order.orderNumber ? `#${order.orderNumber}` : `Order #${order.id}`}
                          </h3>
                          <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-primary'}`}>
                            {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                          </span>
                          <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                            💳 {isPaid ? 'PAID' : (order.paymentReference?.includes('COUNTER') ? 'PAY AT COUNTER' : 'PENDING')}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                          {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                        </p>

                        {(order.mealCategory || order.pickupSlot) && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                            {order.mealCategory && <span>🍽️ <strong>{order.mealCategory}</strong></span>}
                            {order.pickupSlot && <span style={{ marginLeft: '0.75rem' }}>🕐 Slot: <strong>{order.pickupSlot}</strong></span>}
                          </p>
                        )}

                        <div style={{ marginTop: '0.5rem' }}>
                          {order.items?.slice(0, 3).map(item => (
                            <span key={item.id} style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginRight: '0.75rem' }}>
                              {item.itemNameSnapshot || item.menuName} × {item.quantity}
                            </span>
                          ))}
                          {order.items?.length > 3 && (
                            <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>+{order.items.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', marginRight: '0.5rem' }}>
                          ₹{order.totalAmount}
                        </span>

                        {isPendingPayment && (
                          <Link to={`/payment/${order.id}`} className="btn btn-primary btn-sm">
                            <CreditCard size={15} /> Pay Now
                          </Link>
                        )}

                        <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline btn-sm">
                          <Eye size={15} /> View Receipt
                        </Link>

                        {canCancel(order) && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelling === order.id}
                            title="Cancel this order"
                          >
                            <XCircle size={15} /> {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
