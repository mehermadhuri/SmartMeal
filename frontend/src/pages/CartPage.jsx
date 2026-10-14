import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { slotAPI } from '../api/api';
import './Cart.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems, selectedSlot, setSelectedSlot } = useCart();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const cartCategory = items.length > 0 ? (items[0].mealType || 'TIFFIN') : 'TIFFIN';

  useEffect(() => {
    if (items.length === 0) return;
    setSlotsLoading(true);
    slotAPI.getByCategory(cartCategory)
      .then(data => {
        const available = (data || []).filter(s => s.available !== false);
        setSlots(available);
        if (available.length > 0 && !selectedSlot) {
          setSelectedSlot(available[0].slotName);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [cartCategory, selectedSlot, setSelectedSlot, items.length]);

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <ShoppingBag size={64} />
            <h3>Your cart is empty</h3>
            <p>Browse the menu and add some delicious items!</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <ArrowLeft size={18} /> Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>🛒 Your Cart</h1>
          <p>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart • Category: <strong>{cartCategory}</strong></p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.menuId} className="cart-item card">
                <div className="card-body cart-item-inner">
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <span className="badge badge-primary">{item.mealType || item.category}</span>
                    <p className="cart-item-price">₹{item.price} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.menuId, item.quantity - 1)} className="qty-btn" aria-label="Decrease quantity"><Minus size={16} /></button>
                      <span className="qty-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuId, item.quantity + 1)} className="qty-btn" aria-label="Increase quantity"><Plus size={16} /></button>
                    </div>
                    <span className="cart-item-total">₹{item.price * item.quantity}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.menuId)} title="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-outline btn-sm" onClick={clearCart} style={{ marginTop: '0.5rem' }}>
              <Trash2 size={16} /> Clear Cart
            </button>
          </div>

          <div className="cart-summary card">
            <div className="card-body">
              <h3>Order Summary</h3>
              
              <div className="summary-lines">
                {items.map(item => (
                  <div key={item.menuId} className="summary-line">
                    <span>{item.name} × {item.quantity} (@ ₹{item.price})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Pickup Slot Selector / Review */}
              <div style={{ margin: '1.25rem 0', padding: '0.85rem', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} /> Preferred Pickup Slot
                </div>
                {slotsLoading ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Loading available slots...</div>
                ) : slots.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--danger, #d32f2f)' }}>No slots currently available. Ordering hours may be closed.</div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                  >
                    {slots.map(s => (
                      <option key={s.id} value={s.slotName}>
                        {s.slotName}
                      </option>
                    ))}
                  </select>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.35rem' }}>
                  You will collect your meal at the canteen counter during this slot.
                </div>
              </div>

              <div className="summary-total">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gray-600)', margin: '0.35rem 0 0.85rem' }}>
                <span>Canteen Convenience Fee</span>
                <span style={{ color: 'var(--success, #2e7d32)', fontWeight: 600 }}>FREE (₹0)</span>
              </div>
              <div className="summary-total" style={{ borderTop: '2px solid var(--gray-200)', paddingTop: '0.65rem' }}>
                <span style={{ fontWeight: 800 }}>Total Payable</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>₹{totalAmount}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => navigate('/checkout')}
                disabled={slots.length === 0 && !slotsLoading}
              >
                Proceed to Checkout
              </button>
              <Link to="/menu" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
