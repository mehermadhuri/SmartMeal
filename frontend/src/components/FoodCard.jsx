import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

export default function FoodCard({ item }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const available = item.available && item.availableQuantity > 0;

  const handleAdd = () => {
    if (!available) return;
    addItem(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    setQty(1);
  };

  return (
    <div className={`food-card card ${!available ? 'sold-out' : ''}`}>
      <div className="food-img-wrap">
        <img
          src={imgError ? FALLBACK_IMG : (item.imageUrl || FALLBACK_IMG)}
          alt={item.name}
          className="food-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {!available && <div className="sold-out-overlay">Sold Out</div>}
        <span className="food-category badge badge-primary">{item.category}</span>
      </div>
      <div className="card-body">
        <h3 className="food-name">{item.name}</h3>
        {item.description && <p className="food-desc">{item.description}</p>}
        <div className="food-price">₹{item.price}</div>

        {available ? (
          <div className="food-actions">
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn"><Minus size={16} /></button>
              <span className="qty-value">{qty}</span>
              <button onClick={() => setQty(q => Math.min(item.availableQuantity || 50, q + 1))} className="qty-btn"><Plus size={16} /></button>
            </div>
            <button className={`btn btn-primary btn-sm add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
              <ShoppingCart size={16} /> {added ? 'Added!' : 'Add'}
            </button>
          </div>
        ) : (
          <div className="food-unavailable">Currently Unavailable</div>
        )}
      </div>
    </div>
  );
}
