const STORAGE_KEY = 'ayurveda_recent_activity';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getRecentActivities = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    const now = Date.now();
    // Keep only activities within the last 24 hours
    const valid = items.filter(item => item.timestamp && (now - item.timestamp < TTL_MS));
    
    // Prune expired items from storage
    if (valid.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    console.error('Error reading activities:', e);
    return [];
  }
};

export const logUserActivity = ({ title, detail, type = 'practical', link = '/practical', colorClass = 'green' }) => {
  try {
    const current = getRecentActivities();
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      detail,
      type,
      link,
      colorClass,
      timestamp: Date.now()
    };

    // Prepend newest activity and keep up to 20
    const updated = [newEntry, ...current].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for live reactive UI updates
    window.dispatchEvent(new Event('ayurveda_activity_updated'));
    return updated;
  } catch (e) {
    console.error('Error logging activity:', e);
  }
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  return 'Over 24h ago';
};
