import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import './Cart.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems } = useCart();
  const navigate = useNavigate();

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
          <p>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.menuId} className="cart-item card">
                <div className="card-body cart-item-inner">
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <span className="badge badge-primary">{item.category}</span>
                    <p className="cart-item-price">₹{item.price} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.menuId, item.quantity - 1)} className="qty-btn"><Minus size={16} /></button>
                      <span className="qty-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuId, item.quantity + 1)} className="qty-btn"><Plus size={16} /></button>
                    </div>
                    <span className="cart-item-total">₹{item.price * item.quantity}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.menuId)}>
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
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/checkout')}>
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
