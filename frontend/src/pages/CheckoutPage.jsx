import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../api/api';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderRequest = {
        items: items.map(i => ({
          menuId: i.menuId,
          quantity: i.quantity,
        })),
      };
      const order = await orderAPI.create(orderRequest);
      clearCart();
      navigate(`/payment/${order.id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="page-header">
          <h1>📋 Checkout</h1>
          <p>Review your order before placing it</p>
        </div>

        {error && <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Order Items</h3>
            {items.map(item => (
              <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--gray-200)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ color: 'var(--gray-500)', marginLeft: '0.5rem' }}>× {item.quantity}</span>
                </div>
                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <ShieldCheck size={18} /> Your order will be confirmed after successful payment. Collect your meal during the designated pickup window.
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePlaceOrder} disabled={loading}>
          {loading ? 'Placing Order...' : `Place Order — ₹${totalAmount}`}
        </button>
      </div>
    </div>
  );
}
