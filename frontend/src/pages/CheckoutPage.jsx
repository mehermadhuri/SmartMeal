import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, slotAPI } from '../api/api';
import { ShieldCheck, AlertCircle, Clock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Detect category from cart items (all items should be same meal type)
  const cartCategory = items.length > 0 ? (items[0].mealType || 'TIFFIN') : 'TIFFIN';

  useEffect(() => {
    if (items.length === 0) return;
    setSlotsLoading(true);
    slotAPI.getByCategory(cartCategory)
      .then(data => {
        const available = (data || []).filter(s => s.available !== false);
        setSlots(available);
        if (available.length > 0) setSelectedSlot(available[0].slotName);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [cartCategory]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
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

        {/* Order Items Summary */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              Order Items
              <span className="badge badge-primary" style={{ marginLeft: '0.75rem', fontSize: '0.75rem' }}>
                {cartCategory}
              </span>
            </h3>
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
                      onChange={() => setSelectedSlot(slot.slotName)}
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
          <ShieldCheck size={18} /> Your order will be confirmed after successful payment. Collect your meal during the selected pickup window.
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginBottom: '0.75rem' }}
          onClick={handlePlaceOrder}
          disabled={loading || slotsLoading || slots.length === 0}
        >
          {loading ? 'Placing Order...' : `🔒 Place Order & Pay — ₹${totalAmount}`}
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
