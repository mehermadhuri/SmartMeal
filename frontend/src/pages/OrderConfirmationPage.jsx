import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../api/api';
import { CheckCircle, Download, Home } from 'lucide-react';
import './OrderConfirmation.css';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await orderAPI.getById(orderId);
        setOrder(o);
        try { setPayment(await paymentAPI.getByOrder(orderId)); } catch { /* ok */ }
      } catch { /* handled below */ } finally { setLoading(false); }
    };
    load();
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="spinner" />;
  if (!order) return <div className="container page"><div className="alert alert-error">Order not found.</div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="receipt-header">
          <CheckCircle size={52} className="receipt-check" />
          <h1>Order Confirmed!</h1>
          <p>Your meal has been successfully booked and payment received.</p>
        </div>

        <div className="card receipt-card" id="receipt-content">
          <div className="card-body">
            <div className="receipt-brand">
              <h2>🍽️ SmartMeal</h2>
              <p>Anurag University Canteen</p>
              <p className="receipt-tagline">"Book Your Meal. Pay Online. Collect on Time."</p>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-meta">
              <div className="receipt-row"><span>Order Ref</span><strong>#{order.orderNumber || order.id}</strong></div>
              <div className="receipt-row"><span>Order Date</span><strong>{new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</strong></div>
              <div className="receipt-row"><span>Meal Category</span><strong>{order.mealCategory || '—'}</strong></div>
              <div className="receipt-row"><span>Pickup Slot</span><strong>🕐 {order.pickupSlot || '—'}</strong></div>
              <div className="receipt-row"><span>Status</span><strong>{order.orderStatus}</strong></div>
              <div className="receipt-row"><span>Payment</span><strong className="text-success">{order.paymentStatus || payment?.status || 'COMPLETED'}</strong></div>
            </div>

            <div className="receipt-divider" />

            <h3 className="receipt-section-title">Items Ordered</h3>
            {order.items?.map(item => (
              <div key={item.id} className="receipt-item">
                <span>{item.menuName} × {item.quantity}</span>
                <span>₹{item.totalPrice}</span>
              </div>
            ))}

            <div className="receipt-divider" />
            <div className="receipt-total">
              <span>Total Paid</span>
              <span className="receipt-total-amount">₹{order.totalAmount}</span>
            </div>

            <div className="receipt-divider" />
            <div className="receipt-footer-note">
              <p>📍 Please collect your meal at the Anurag University Canteen Counter.</p>
              <p>Show this receipt or your Order ID at the collection point.</p>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Download size={18} /> Print / Save Receipt
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={18} /> Back to Dashboard
          </Link>
          <Link to="/orders" className="btn btn-secondary">View All Orders</Link>
        </div>
      </div>
    </div>
  );
}
