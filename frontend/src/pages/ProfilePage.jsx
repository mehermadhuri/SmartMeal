import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Hash, Building, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '560px' }}>
        <div className="page-header">
          <h1><User size={28} /> My Profile</h1>
          <p>Your account information</p>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800, flexShrink: 0,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>{user?.name}</h2>
                <span className="badge badge-primary" style={{ marginTop: '0.3rem' }}>{user?.role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ProfileRow icon={<Mail size={18} />} label="Email" value={user?.email} />
              <ProfileRow icon={<Phone size={18} />} label="Phone Number" value={user?.phoneNumber || '—'} />
              <ProfileRow icon={<Hash size={18} />} label="Roll Number" value={user?.rollNumber || '—'} />
              <ProfileRow icon={<Building size={18} />} label="Department" value={user?.department || '—'} />
              <ProfileRow icon={<Calendar size={18} />} label="Year of Study" value={user?.year ? `Year ${user.year}` : '—'} />
            </div>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          To update your profile information, please contact the university canteen administrator.
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.65rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
      <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{value}</div>
      </div>
    </div>
  );
}
