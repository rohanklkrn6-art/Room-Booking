import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { icon: '⊞', label: 'Home' },
  { icon: '📰', label: 'Beiträge' },
  { icon: '👤', label: 'Profil' },
];

export default function BottomNav() {
  const { dispatch } = useApp();
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <div
          key={item.label}
          className="bn-item"
          onClick={() => dispatch({ type: 'SHOW_TOAST', payload: `${item.label} — coming soon` })}
        >
          <span className="bn-icon">{item.icon}</span>
          <span className="bn-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
