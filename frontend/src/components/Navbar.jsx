import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <span className="brand-icon">🍽️</span>
          <div>
            <span className="brand-name">SmartMeal</span>
            <span className="brand-sub">Anurag University</span>
          </div>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {isAdmin ? (
            <>
              <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/admin/menus" className={isActive('/admin/menus')} onClick={() => setMenuOpen(false)}>
                Menus
              </Link>
              <Link to="/admin/orders" className={isActive('/admin/orders')} onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
              <Link to="/admin/predictions" className={isActive('/admin/predictions')} onClick={() => setMenuOpen(false)}>
                Predictions
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/menu" className={isActive('/menu')} onClick={() => setMenuOpen(false)}>
                Menu
              </Link>
              <Link to="/orders" className={isActive('/orders')} onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              <Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)}>
                <ShoppingCart size={18} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            </>
          )}

          <div className="nav-user">
            <span className="user-name"><User size={16} /> {user?.name?.split(' ')[0]}</span>
            <button className="btn btn-sm btn-outline nav-logout" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
