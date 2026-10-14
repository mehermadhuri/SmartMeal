import { useEffect, useState } from 'react';
import { adminAPI } from '../api/api';
import { LayoutDashboard, ShoppingBag, IndianRupee, Clock, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [windowStatus, setWindowStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([adminAPI.dashboard(), adminAPI.getWindowStatus()]);
      setStats(s);
      setWindowStatus(w);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOverride = async () => {
    setOverrideLoading(true);
    try {
      const newState = !windowStatus?.overrideEnabled;
      await adminAPI.setOverride(newState);
      setWindowStatus(prev => ({ ...prev, overrideEnabled: newState }));
    } catch (err) {
      alert(err.message);
    } finally {
      setOverrideLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1><LayoutDashboard size={28} /> Admin Dashboard</h1>
          <p>Anurag University Canteen Management</p>
        </div>

        <div className="stats-grid">
          <StatCard icon={<ShoppingBag size={24} />} label="Orders Today" value={stats?.totalOrdersToday ?? 0} color="var(--primary)" />
          <StatCard icon={<ShoppingBag size={24} />} label="Paid Orders Today" value={stats?.totalPaidOrdersToday ?? 0} color="var(--success)" />
          <StatCard icon={<IndianRupee size={24} />} label="Revenue Today" value={`₹${stats?.totalRevenueToday ?? 0}`} color="var(--secondary)" />
          <StatCard icon={<Clock size={24} />} label="Pending Payments" value={stats?.pendingPayments ?? 0} color="var(--warning)" />
          <StatCard icon={<Utensils size={24} />} label="Active Menu Items" value={stats?.activeMenuItems ?? 0} color="var(--primary-light)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>⏰ Booking Window Status</h3>
              {windowStatus && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <WindowItem label="Tiffin Window" isOpen={windowStatus.tiffinWindowOpen} time="8:00 AM – 10:00 AM" />
                    <WindowItem label="Lunch Window" isOpen={windowStatus.lunchWindowOpen} time="11:30 AM – 2:00 PM" />
                    <WindowItem label="General Ordering" isOpen={windowStatus.generalOrderingOpen} time="Closes at 3:00 PM" />
                  </div>
                  <button
                    className={`btn btn-sm ${windowStatus.overrideEnabled ? 'btn-danger' : 'btn-success'}`}
                    onClick={toggleOverride}
                    disabled={overrideLoading}
                    style={{ width: '100%' }}
                  >
                    {windowStatus.overrideEnabled ? '🔒 Disable Test Override' : '🔓 Enable Test Override (All Hours)'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/admin/menus" className="btn btn-primary">Manage Menu Items</Link>
                <Link to="/admin/orders" className="btn btn-outline">View All Orders</Link>
                <Link to="/admin/predictions" className="btn btn-secondary">AI Demand Predictions</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>{label}</h3>
          <div className="stat-value">{value}</div>
        </div>
        <span style={{ color, opacity: 0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

function WindowItem({ label, isOpen, time }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{time}</div>
      </div>
      <span className={`badge ${isOpen ? 'badge-success' : 'badge-danger'}`}>{isOpen ? 'OPEN' : 'CLOSED'}</span>
    </div>
  );
}
