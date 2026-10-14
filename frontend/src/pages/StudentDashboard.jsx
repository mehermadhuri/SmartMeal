import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Clock, ShoppingBag, History } from 'lucide-react';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Book your meals, pay online, and collect on time from the Anurag University Canteen.</p>
          </div>
        </div>

        <div className="booking-hours-card card">
          <div className="card-body">
            <h2><Clock size={22} /> Canteen Ordering Hours</h2>
            <div className="hours-grid">
              <div className="hours-item">
                <h3>🥐 Tiffin Bookings</h3>
                <p className="hours-time">8:00 AM – 10:00 AM</p>
              </div>
              <div className="hours-item">
                <h3>🍛 Lunch Bookings</h3>
                <p className="hours-time">11:30 AM – 2:00 PM</p>
              </div>
              <div className="hours-item">
                <h3>🕐 Online Ordering Closes</h3>
                <p className="hours-time">3:00 PM</p>
              </div>
            </div>
            <p className="hours-note">Orders can only be placed while the relevant booking window is open and the item is available. Payment must be confirmed before an order is accepted.</p>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/menu" className="action-card card">
            <div className="card-body">
              <UtensilsCrossed size={32} className="action-icon" />
              <h3>Browse Menu</h3>
              <p>View today's tiffin and lunch items</p>
            </div>
          </Link>
          <Link to="/cart" className="action-card card">
            <div className="card-body">
              <ShoppingBag size={32} className="action-icon" />
              <h3>My Cart</h3>
              <p>Review your selected items</p>
            </div>
          </Link>
          <Link to="/orders" className="action-card card">
            <div className="card-body">
              <History size={32} className="action-icon" />
              <h3>Order History</h3>
              <p>View your past orders and receipts</p>
            </div>
          </Link>
        </div>

        <div className="info-section card">
          <div className="card-body">
            <h2>How It Works</h2>
            <div className="steps">
              <div className="step"><span className="step-num">1</span><div><h4>Browse Menu</h4><p>Choose from tiffin or lunch categories</p></div></div>
              <div className="step"><span className="step-num">2</span><div><h4>Add to Cart</h4><p>Select items and quantities</p></div></div>
              <div className="step"><span className="step-num">3</span><div><h4>Pay Online</h4><p>Complete payment via UPI or other methods</p></div></div>
              <div className="step"><span className="step-num">4</span><div><h4>Collect</h4><p>Pick up your meal at the canteen counter</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
