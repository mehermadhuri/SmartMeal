import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuAPI } from '../api/api';
import FoodCard from '../components/FoodCard';
import { Search } from 'lucide-react';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    const cat = searchParams.get('category');
    return (cat === 'TIFFIN' || cat === 'LUNCH') ? cat : 'ALL';
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadMenu();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ category: tab });
    }
  };

  const loadMenu = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (activeTab === 'ALL') {
        data = await menuAPI.getAvailable();
      } else {
        data = await menuAPI.getByCategory(activeTab);
      }
      setItems(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>🍽️ Today's Menu</h1>
          <p>Choose from our delicious tiffin and lunch options</p>
        </div>

        <div className="tabs">
          {['ALL', 'TIFFIN', 'LUNCH'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabChange(tab)}>
              {tab === 'ALL' ? '🍴 All Items' : tab === 'TIFFIN' ? '🥐 Tiffin' : '🍛 Lunch'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>{search ? 'Try a different search term' : 'No menu items available at the moment'}</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
