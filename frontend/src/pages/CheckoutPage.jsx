import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, slotAPI } from '../api/api';
import { ShieldCheck, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, selectedSlot: ctxSlot, setSelectedSlot: setCtxSlot } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(ctxSlot || '');

  // Detect category from cart items (all items belong to one category per booking)
  const cartCategory = items.length > 0 ? (items[0].mealType || 'TIFFIN') : 'TIFFIN';

  useEffect(() => {
    if (items.length === 0) return;
    setSlotsLoading(true);
    slotAPI.getByCategory(cartCategory)
      .then(data => {
        const available = (data || []).filter(s => s.available !== false);
        setSlots(available);
        if (available.length > 0) {
          if (!selectedSlot || !available.some(s => s.slotName === selectedSlot)) {
            setSelectedSlot(available[0].slotName);
            setCtxSlot(available[0].slotName);
          }
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [cartCategory]);

  const handleSlotSelect = (slotName) => {
    setSelectedSlot(slotName);
    setCtxSlot(slotName);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    if (loading) return; // Prevent double click
    if (!selectedSlot) {
      setError('Please select a pickup slot before placing your order.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderRequest = {
        mealCategory: cartCategory,
        pickupSlot: selectedSlot,
        items: items.map(i => ({
          menuItemId: i.menuId,
          quantity: i.quantity,
        })),
      };
      const order = await orderAPI.create(orderRequest);
      clearCart();
      navigate(`/payment/${order.id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Cart
          </Link>
        </div>

        <div className="page-header">
          <h1>📋 Review & Checkout</h1>
          <p>Confirm your items and pickup slot before payment</p>
        </div>

        {/* Order Items Summary */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Order Summary</span>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {cartCategory}
              </span>
            </h3>

            {items.map(item => (
              <div key={item.menuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px solid var(--gray-200)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>
                    ₹{item.price} × {item.quantity}
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              <span>Canteen Convenience Fee</span>
              <span style={{ color: 'var(--success, #2e7d32)', fontWeight: 600 }}>FREE (₹0)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.85rem', marginTop: '0.5rem', borderTop: '2px solid var(--gray-200)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Pickup Slot Selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> Select Pickup Slot
            </h3>
            {slotsLoading ? (
              <div className="spinner" style={{ width: '24px', height: '24px' }} />
            ) : slots.length === 0 ? (
              <div className="alert alert-error" style={{ marginBottom: 0 }}>
                <AlertCircle size={16} /> No pickup slots available for {cartCategory}. The booking window may be closed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {slots.map(slot => (
                  <label
                    key={slot.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: `2px solid ${selectedSlot === slot.slotName ? 'var(--primary)' : 'var(--gray-200)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedSlot === slot.slotName ? 'var(--primary-light, #f0f4ff)' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="pickupSlot"
                      value={slot.slotName}
                      checked={selectedSlot === slot.slotName}
                      onChange={() => handleSlotSelect(slot.slotName)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{slot.slotName}</div>
                      {slot.capacity && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          Capacity: {slot.capacity}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <ShieldCheck size={18} /> Review your order details above. On the next screen, you can choose your preferred payment option (UPI, Card, or Pay at Canteen).
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginBottom: '0.75rem' }}
          onClick={handlePlaceOrder}
          disabled={loading || slotsLoading || slots.length === 0}
        >
          {loading ? 'Processing Order...' : `Proceed to Payment — ₹${totalAmount}`}
        </button>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}
