import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../api/api';
import { CheckCircle, Clock, Download, Home, ArrowLeft } from 'lucide-react';
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
        try {
          const p = await paymentAPI.getByOrder(orderId);
          setPayment(p);
        } catch {
          /* optional */
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="spinner" />;
  if (!order) {
    return (
      <div className="container page">
        <div className="alert alert-error">Order not found.</div>
        <Link to="/orders" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'PAID' || payment?.status === 'PAID';
  const isCanteenPay = payment?.paymentMethod === 'PAY_AT_CANTEEN' || order.paymentReference?.includes('COUNTER');

  // Friendly payment method label
  const getPaymentMethodLabel = () => {
    const method = payment?.paymentMethod;
    if (method === 'PAY_AT_CANTEEN' || isCanteenPay) return 'Pay at Canteen Counter (Cash/UPI)';
    if (method === 'CARD_DEMO') return 'Debit / Credit Card (Demo)';
    if (method === 'UPI_QR' || method === 'UPI_DIRECT' || method === 'SANDBOX_DEMO') return 'UPI (Online Simulation)';
    return method || 'Online / Counter';
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="back-link" style={{ marginBottom: '1rem' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> All Orders
          </Link>
        </div>

        <div className="receipt-header">
          {isPaid ? (
            <>
              <CheckCircle size={52} className="receipt-check" />
              <h1>Order Confirmed!</h1>
              <p>Your meal has been booked and payment recorded.</p>
            </>
          ) : (
            <>
              <Clock size={52} style={{ color: 'var(--warning, #eab308)', marginBottom: '0.5rem' }} />
              <h1 style={{ color: 'var(--gray-900)' }}>Order Placed — Payment Due at Counter</h1>
              <p>Your meal is confirmed for preparation. Please pay at the canteen counter.</p>
            </>
          )}
        </div>

        <div className="card receipt-card" id="receipt-content">
          <div className="card-body">
            {/* Canteen Branding */}
            <div className="receipt-brand">
              <h2>🍽️ SmartMeal</h2>
              <p><strong>Anurag University Canteen</strong></p>
              <p>Venkatapur, Ghatkesar, Medchal-Malkajgiri, Hyderabad, Telangana</p>
              <p className="receipt-tagline">"Book Your Meal. Pay Online. Collect on Time."</p>
            </div>

            <div className="receipt-divider" />

            {/* Bill Meta */}
            <div className="receipt-meta">
              <div className="receipt-row">
                <span>Receipt / Order Ref:</span>
                <strong>#{order.orderNumber || order.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Date & Time:</span>
                <span>{new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              {order.user && (
                <div className="receipt-row">
                  <span>Student Name / Roll:</span>
                  <span>{order.user.name} ({order.user.rollNumber || order.user.email})</span>
                </div>
              )}
              <div className="receipt-row">
                <span>Meal Category:</span>
                <strong>{order.mealCategory || 'MEAL'}</strong>
              </div>
              <div className="receipt-row">
                <span>Pickup Slot:</span>
                <strong style={{ color: 'var(--primary-dark)' }}>🕐 {order.pickupSlot || 'Counter Pickup'}</strong>
              </div>
              <div className="receipt-row">
                <span>Order Status:</span>
                <span className="badge badge-primary">{order.orderStatus}</span>
              </div>
              <div className="receipt-row">
                <span>Payment Method:</span>
                <span>{getPaymentMethodLabel()}</span>
              </div>
              <div className="receipt-row">
                <span>Payment Status:</span>
                {isPaid ? (
                  <strong className="text-success">✅ PAID</strong>
                ) : (
                  <strong className="text-warning">⏳ Payment due at counter</strong>
                )}
              </div>
              {(payment?.providerReference || order.paymentReference) && (
                <div className="receipt-row">
                  <span>Transaction Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {payment?.providerReference || order.paymentReference}
                  </span>
                </div>
              )}
            </div>

            <div className="receipt-divider" />

            {/* Itemized Table */}
            <div className="receipt-section-title">Itemized Bill</div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="num-col">Qty</th>
                  <th className="num-col">Unit Price</th>
                  <th className="num-col">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map(item => {
                  const unitPrice = item.unitPriceSnapshot || item.unitPrice || (item.lineTotal / item.quantity) || 0;
                  const total = item.lineTotal || (unitPrice * item.quantity);
                  return (
                    <tr key={item.id}>
                      <td>{item.itemNameSnapshot || item.menuName}</td>
                      <td className="num-col">{item.quantity}</td>
                      <td className="num-col">₹{unitPrice}</td>
                      <td className="num-col" style={{ fontWeight: 600 }}>₹{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Calculations */}
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal || order.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Canteen Service / Packaging</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹0 (Included)</span>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-total">
              <span>Grand Total</span>
              <span className="receipt-total-amount">₹{order.totalAmount}</span>
            </div>

            <div className="receipt-divider" />

            {/* Pickup Instructions */}
            <div className="receipt-footer-note">
              <p>📍 <strong>Collection Point:</strong> Anurag University Main Canteen Counter.</p>
              <p>🕐 Please present this receipt or mention your Order Ref (<strong>#{order.orderNumber || order.id}</strong>) during your pickup slot.</p>
              {!isPaid && (
                <p style={{ color: '#b45309', fontWeight: 600, marginTop: '0.35rem' }}>
                  💵 Payment Notice: Please pay ₹{order.totalAmount} in cash or UPI at the counter before meal handover.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Download size={18} /> Print / Save Bill
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
