import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Leaf, Droplet, Flame, Database, Beaker, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const iconMap = {
  Leaf:     <Leaf size={14} />,
  Droplet:  <Droplet size={14} />,
  Flame:    <Flame size={14} />,
  Database: <Database size={14} />,
  Beaker:   <Beaker size={14} />
};

const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};

const DraggableItem = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `inv_${item.id}`,
    data: item
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    touchAction: 'none'
  };

  const hasImage = Boolean(item.image) && !imgError;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="inventory-item glass-panel"
      title={item.name}
    >
      <div className="item-icon" style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.3rem', overflow: 'hidden' }}>
        {hasImage ? (
          <img 
            src={getAssetUrl(item.image)} 
            alt={item.name} 
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px', display: 'block' }}
          />
        ) : (
          iconMap[item.iconName] || <Leaf size={22} color="#10b981" />
        )}
      </div>
      <div className="item-info">
        <h4>{item.name}</h4>
      </div>
    </div>
  );
};

const TABS = ['All', 'Herbs', 'Liquids', 'Utensils'];

const Inventory = () => {
  const { inventoryItems } = useData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filtered = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Herbs'    && item.type === 'herb') ||
      (activeTab === 'Liquids'  && item.type === 'liquid') ||
      (activeTab === 'Utensils' && item.type === 'utensil');
    return matchesSearch && matchesTab;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="inventory-sidebar ayurvedic-panel" style={{ borderRadius: '4px 40px 4px 40px' }}>
      <h3 style={{ marginBottom: '0.6rem' }}>🧪 Inventory <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({inventoryItems.length} items)</span></h3>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
        <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search herb or utensil…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.4rem 0.5rem 0.4rem 1.8rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontSize: '0.65rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      <div className="items-grid" style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length > 0
          ? filtered.map(item => <DraggableItem key={item.id} item={item} />)
          : <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', gridColumn: '1/-1' }}>No items found.</p>
        }
      </div>
    </div>
  );
};

export default Inventory;
